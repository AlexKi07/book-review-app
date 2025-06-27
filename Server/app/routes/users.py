from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import User, db

users = Blueprint('users', __name__)


@users.route('/users', methods=['GET'])
@cross_origin(origins=["http://localhost:5173"], supports_credentials=True)
@jwt_required()
def get_all_users():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or not current_user.is_admin:
        return jsonify({"error": "Admins only"}), 403

    all_users = User.query.all()
    return jsonify([
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_admin": u.is_admin,
            "bio": u.bio,
            "favorite_genres": u.favorite_genres,
            "profile_picture": u.profile_picture
        } for u in all_users
    ]), 200


@users.route('/users/<int:user_id>', methods=['GET'])
@cross_origin(origins=["http://localhost:5173"], supports_credentials=True)
@jwt_required()
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_json()), 200


@users.route('/users/<int:user_id>', methods=['PUT'])
@cross_origin(origins=["http://localhost:5173"], supports_credentials=True, methods=["PUT", "OPTIONS"])
@jwt_required()
def update_user_by_id(user_id):
    current_user_id = get_jwt_identity()

    if user_id != current_user_id:
        return jsonify({"error": "Unauthorized: You can only update your own account"}), 403

    data = request.get_json()
    user = User.query.get_or_404(user_id)

    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"error": "Username already taken"}), 400
    
    if 'email' in data and data['email'] != user.email:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email already in use"}), 400

    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    user.bio = data.get('bio', user.bio)
    user.profile_picture = data.get('profile_picture', user.profile_picture)
    user.favorite_genres = data.get('favorite_genres', user.favorite_genres)

    try:
        db.session.commit()
        return jsonify(user.to_json()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@users.route('/me', methods=['OPTIONS', 'GET', 'PATCH'])
@cross_origin(
    origins=["http://localhost:5173"],
    supports_credentials=True,
    methods=["GET", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)
@jwt_required()
def current_user():
    if request.method == 'OPTIONS':
        return '', 204

    try:
        user_id = get_jwt_identity()

        if not user_id:
            return jsonify({"error": "No user identity found in token"}), 401

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        if request.method == 'PATCH':
            data = request.get_json()

            if 'username' in data:
                if User.query.filter(User.username == data['username'], User.id != user_id).first():
                    return jsonify({"error": "Username taken"}), 400

            allowed_fields = ['username', 'email', 'bio', 'profile_picture', 'favorite_genres']
            for key in allowed_fields:
                if key in data:
                    setattr(user, key, data[key])

            db.session.commit()
            return jsonify(user.to_json()), 200

        return jsonify(user.to_json()), 200

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@users.route('/users/<int:user_id>/ban', methods=['POST'])
@cross_origin(origins=["http://localhost:5173"], supports_credentials=True)
@jwt_required()
def ban_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or not current_user.is_admin:
        return jsonify({"error": "Admins only"}), 403

    user = User.query.get_or_404(user_id)

    if user.is_admin:
        return jsonify({"error": "Cannot ban another admin"}), 400

    user.is_banned = True
    try:
        db.session.commit()
        return jsonify({"message": f"User {user.username} has been banned."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@users.route('/users/<int:user_id>/unban', methods=['OPTIONS', 'POST'])
@cross_origin(
    origins=["http://localhost:5173"],
    supports_credentials=True,
    methods=["POST", "OPTIONS"]
)
@jwt_required()
def unban_user(user_id):
    if request.method == 'OPTIONS':
        return '', 204

    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or not current_user.is_admin:
        return jsonify({"error": "Admins only"}), 403

    user = User.query.get_or_404(user_id)

    if not user.is_banned:
        return jsonify({"message": "User is not banned."}), 400

    user.is_banned = False
    try:
        db.session.commit()
        return jsonify({"message": f"User {user.username} has been unbanned."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
