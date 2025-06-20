from flask import Blueprint, request, jsonify
from flask_mail import Message
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app.models.models import User, db
from app.extensions import mail

auth = Blueprint('auth', __name__)


def validate_fields(data, required):
    missing = [field for field in required if not data.get(field)]
    if missing:
        return False, f"Missing fields: {', '.join(missing)}"
    return True, None


@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    valid, message = validate_fields(data, ['username', 'email', 'password'])
    if not valid:
        return jsonify({"error": message}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 409

    hashed_pw = generate_password_hash(data['password'])

    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=hashed_pw
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Registration successful"}), 201


@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    valid, message = validate_fields(data, ['email', 'password'])
    if not valid:
        return jsonify({"error": message}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=user.id)

    # email section
    try:
        msg = Message(
            subject="Login Notification",
            recipients=[user.email],
            body=f"Hello {user.username},\n\nYou successfully logged into your Book Review account."
        )
        mail.send(msg)
    except Exception as e:
        print("EMAIL ERROR:", e)  # Don’t fail login even if email fails

    return jsonify({
        "access_token": access_token,
        "user_id": user.id,
        "username": user.username
    }), 200