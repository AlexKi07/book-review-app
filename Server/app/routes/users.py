from flask import Blueprint, request, jsonify
from app.models.models import User, db
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request

users = Blueprint('users', __name__)


@users.route('/users', methods=['GET'])
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
@jwt_required()
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_json()), 200

@users.route('/users/<int:user_id>', methods=['PUT'])
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
@jwt_required()
def current_user():
    print(">>> /users/me route hit")

    if request.method == 'OPTIONS':
        return '', 204

    try:
        user_id = get_jwt_identity()
        print(">>> JWT identity:", user_id)

        if not user_id:
            return jsonify({"error": "No user identity found in token"}), 401

        user = User.query.get(user_id)
        if not user:
            print(">>> User not found in database")
            return jsonify({"error": "User not found"}), 404

        print(f">>> Retrieved user: {user.username}")

        if request.method == 'PATCH':
            data = request.get_json()
            print(">>> Incoming PATCH data:", data)

            if 'username' in data:
                if User.query.filter(User.username == data['username'], User.id != user_id).first():
                    return jsonify({"error": "Username taken"}), 400

            allowed_fields = ['username', 'email', 'bio', 'profile_picture', 'favorite_genres']
            updates = {k: data[k] for k in allowed_fields if k in data}

            for key, value in updates.items():
                setattr(user, key, value)

            db.session.commit()
            print(">>> User updated successfully")
            return jsonify(user.to_json()), 200

        # For GET
        user_data = user.to_json()
        print(">>> Returning user data:", user_data)
        return jsonify(user_data), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@users.route('/users/<int:user_id>/ban', methods=['POST'])
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
@jwt_required()
def unban_user(user_id):
    if request.method == 'OPTIONS':
        return '', 204  # Respond to CORS preflight

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


