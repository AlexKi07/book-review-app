from flask import Blueprint, request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.models import User, db

users = Blueprint('users', __name__)

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://book-review-app-psi.vercel.app"
]

def set_cors(response):
    origin = request.headers.get("Origin")
    if origin in ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PATCH,PUT,DELETE,OPTIONS'
    return response


@users.route('/users', methods=['GET', 'OPTIONS'])
def get_all_users():
    if request.method == 'OPTIONS':
        return set_cors(jsonify({})), 204

    try:
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user or not current_user.is_admin:
            return set_cors(jsonify({"error": "Admins only"})), 403

        all_users = User.query.all()
        return set_cors(jsonify([
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "is_admin": u.is_admin,
                "bio": u.bio,
                "favorite_genres": u.favorite_genres,
                "profile_picture": u.profile_picture,
                "is_banned": u.is_banned
            } for u in all_users
        ])), 200

    except Exception as e:
        return set_cors(jsonify({"error": str(e)})), 500


@users.route('/users/<int:user_id>', methods=['GET', 'OPTIONS'])
def get_user(user_id):
    if request.method == 'OPTIONS':
        return set_cors(jsonify({})), 204

    verify_jwt_in_request()
    user = User.query.get_or_404(user_id)
    return set_cors(jsonify(user.to_json())), 200


@users.route('/users/<int:user_id>', methods=['PUT', 'OPTIONS'])
def update_user_by_id(user_id):
    if request.method == 'OPTIONS':
        return set_cors(jsonify({})), 204

    verify_jwt_in_request()
    current_user_id = get_jwt_identity()

    if user_id != current_user_id:
        return set_cors(jsonify({"error": "Unauthorized"})), 403

    data = request.get_json()
    user = User.query.get_or_404(user_id)

    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return set_cors(jsonify({"error": "Username already taken"})), 400

    if 'email' in data and data['email'] != user.email:
        if User.query.filter_by(email=data['email']).first():
            return set_cors(jsonify({"error": "Email already in use"})), 400

    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    user.bio = data.get('bio', user.bio)
    user.profile_picture = data.get('profile_picture', user.profile_picture)
    user.favorite_genres = data.get('favorite_genres', user.favorite_genres)

    try:
        db.session.commit()
        return set_cors(jsonify(user.to_json())), 200
    except Exception as e:
        db.session.rollback()
        return set_cors(jsonify({"error": str(e)})), 500


@users.route('/me', methods=['GET', 'PATCH', 'OPTIONS'])
def current_user():
    if request.method == 'OPTIONS':
        return set_cors(jsonify({})), 204

    verify_jwt_in_request()
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return set_cors(jsonify({"error": "User not found"})), 404

        if request.method == 'PATCH':
            data = request.get_json()

            if 'username' in data:
                if User.query.filter(User.username == data['username'], User.id != user_id).first():
                    return set_cors(jsonify({"error": "Username taken"})), 400

            allowed_fields = ['username', 'email', 'bio', 'profile_picture', 'favorite_genres']
            for key in allowed_fields:
                if key in data:
                    setattr(user, key, data[key])

            db.session.commit()
            return set_cors(jsonify(user.to_json())), 200

        return set_cors(jsonify(user.to_json())), 200

    except Exception as e:
        return set_cors(jsonify({"error": f"Server error: {str(e)}"})), 500


@users.route('/users/<int:user_id>/ban', methods=['POST', 'OPTIONS'])
def ban_user(user_id):
    if request.method == 'OPTIONS':
        return set_cors(jsonify({})), 204

    verify_jwt_in_request()
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or not current_user.is_admin:
        return set_cors(jsonify({"error": "Admins only"})), 403

    user = User.query.get_or_404(user_id)

    if user.is_admin:
        return set_cors(jsonify({"error": "Cannot ban another admin"})), 400

    user.is_banned = True
    try:
        db.session.commit()
        return set_cors(jsonify({"message": f"User {user.username} has been banned."})), 200
    except Exception as e:
        db.session.rollback()
        return set_cors(jsonify({"error": str(e)})), 500


@users.route('/users/<int:user_id>/unban', methods=['POST', 'OPTIONS'])
def unban_user(user_id):
    if request.method == 'OPTIONS':
        return set_cors(jsonify({})), 204

    verify_jwt_in_request()
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or not current_user.is_admin:
        return set_cors(jsonify({"error": "Admins only"})), 403

    user = User.query.get_or_404(user_id)

    if not user.is_banned:
        return set_cors(jsonify({"message": "User is not banned."})), 400

    user.is_banned = False
    try:
        db.session.commit()
        return set_cors(jsonify({"message": f"User {user.username} has been unbanned."})), 200
    except Exception as e:
        db.session.rollback()
        return set_cors(jsonify({"error": str(e)})), 500
