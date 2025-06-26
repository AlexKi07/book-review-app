from flask import Blueprint, request, jsonify, current_app
from flask_mail import Message
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from app.models.models import User, db
from app.extensions import mail
from app.config import Config

auth = Blueprint('auth', __name__)
jwt_blacklist = set()  # Set to store revoked tokens


def validate_fields(data, required):
    missing = [field for field in required if not data.get(field)]
    if missing:
        return False, f"Missing fields: {', '.join(missing)}"
    return True, None

from datetime import datetime, timezone, timedelta
from flask import jsonify, request
from flask_jwt_extended import create_access_token
from app.models.models import User
from werkzeug.security import check_password_hash
from flask_mail import Message

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    valid, message = validate_fields(data, ['email', 'password'])
    if not valid:
        return jsonify({"error": message}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({"error": "Invalid email or password"}), 401

    expires_delta = current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
    access_token = create_access_token(
        identity=user.id,
        additional_claims={
            'username': user.username,
            'email': user.email
        }
    )

    expires_at = datetime.now(timezone.utc) + expires_delta
    expires_at_timestamp = int(expires_at.timestamp())

    try:
        msg = Message(
            subject="Login Notification",
            recipients=[user.email],
            body=f"Hello {user.username},\n\nYou successfully logged into your Book Review account."
        )
        mail.send(msg)
    except Exception as e:
        current_app.logger.error(f"Email sending failed: {str(e)}")

    return jsonify({
        "access_token": access_token,
        "expires_at": expires_at_timestamp,
        "expires_in": expires_delta.total_seconds(),
        "user_id": user.id,
        "username": user.username,
        "message": "Login successful"
    }), 200

@auth.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    jwt_blacklist.add(jti)
    return jsonify({"msg": "Successfully logged out"}), 200


def is_token_revoked(jwt_payload):
    return jwt_payload["jti"] in jwt_blacklist

