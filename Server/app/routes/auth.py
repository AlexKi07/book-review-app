import traceback
from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_mail import Message
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from app.models.models import User, db
from app.extensions import mail, redis_client
import re

auth = Blueprint('auth', __name__)

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+$')




def validate_input(data, required_fields):
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        return False, f"Missing fields: {', '.join(missing)}"
    
    if 'email' in data and not EMAIL_REGEX.match(data['email']):
        return False, "Invalid email format"
    
    if 'password' in data and len(data['password']) < 8:
        return False, "Password must be at least 8 characters"
        
    return True, None


def add_token_to_blacklist(jti):
    expires_at = datetime.now(timezone.utc) + current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
    redis_client.setex(f"token:{jti}", int(current_app.config['JWT_ACCESS_TOKEN_EXPIRES'].total_seconds()), "revoked")


def is_token_revoked(jwt_payload):
    jti = jwt_payload["jti"]
    return redis_client.exists(f"token:{jti}") > 0




@auth.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.status_code = 204
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response

    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    is_valid, error_msg = validate_input(data, ['username', 'email', 'password'])
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    if not data['username'].strip():
        return jsonify({"error": "Username cannot be empty"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 409

    password_hash = generate_password_hash(data['password'])
    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=password_hash
    )

    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating user: {str(e)}")
        return jsonify({"error": "Something went wrong. Please try again."}), 500

    if current_app.config.get('SEND_WELCOME_EMAILS', True):
        try:
            msg = Message(
                subject="Welcome to the App",
                recipients=[new_user.email],
                body=f"Hello {new_user.username},\n\nWelcome to our platform!"
            )
            mail.send(msg)
        except Exception as e:
            current_app.logger.error(f"Failed to send welcome email: {str(e)}")

    return jsonify({"message": "User registered successfully"}), 201

@auth.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'preflight'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    is_valid, error_msg = validate_input(data, ['email', 'password'])
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    login_attempts_key = f"login_attempts:{data['email']}"
    try:
        attempts = int(redis_client.get(login_attempts_key) or 0)
    except:
        attempts = 0

    if attempts >= 5:
        return jsonify({"error": "Too many login attempts. Try again later."}), 429

    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        try:
            redis_client.incr(login_attempts_key)
            redis_client.expire(login_attempts_key, 3600)
        except:
            pass
        current_app.logger.warning(f"Failed login attempt for email: {data['email']}")
        return jsonify({"error": "Invalid email or password"}), 401

    try:
        redis_client.delete(login_attempts_key)
    except:
        pass

    try:
        expires_delta = current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
        access_token = create_access_token(
            identity=user.id,
            additional_claims={
                'username': user.username,
                'email': user.email,
                'is_admin': user.is_admin,
                'is_active': True
            },
            expires_delta=expires_delta
        )

        refresh_token = create_refresh_token(identity=user.id)
        expires_at = datetime.now(timezone.utc) + expires_delta
        expires_at_timestamp = int(expires_at.timestamp())

        if current_app.config.get('SEND_LOGIN_EMAILS', True):
            try:
                msg = Message(
                    subject="Login Notification",
                    recipients=[user.email],
                    body=f"Hello {user.username},\n\nYou successfully logged in at {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} UTC."
                )
                mail.send(msg)
            except Exception as e:
                current_app.logger.error(f"Email sending failed: {str(e)}")

        response_data = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_at": expires_at_timestamp,
            "expires_in": expires_delta.total_seconds(),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_admin": user.is_admin
            },
            "message": "Login successful"
        }

        response = jsonify(response_data)
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')

        if current_app.config.get('ENV', '').lower() == 'production':
            response.set_cookie(
                'access_token_cookie',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='Lax',
                max_age=int(expires_delta.total_seconds())
            )

        return response

    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@auth.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    add_token_to_blacklist(jti)
    return jsonify({"message": "Successfully logged out"}), 200


@auth.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_token = create_access_token(identity=current_user)
    return jsonify(access_token=new_token), 200
