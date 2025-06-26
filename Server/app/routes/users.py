from flask import Blueprint, request, jsonify
from app.models.models import User, db
from flask_jwt_extended import jwt_required, get_jwt_identity


users = Blueprint('users', __name__)

@users.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    all_users = User.query.all()
    return jsonify([u.to_json() for u in all_users]), 200

@users.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_json()), 200

@users.route('/<int:user_id>', methods=['PUT'])  # not /users/<int:id> again
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()

    if user_id != current_user_id:
        return jsonify({"error": "Unauthorized: You can only update your own account"}), 403

    data = request.get_json()
    user = User.query.get_or_404(user_id)

    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    user.bio = data.get('bio', user.bio)
    user.profile_picture = data.get('profile_picture', user.profile_picture)
    user.favorite_genres = data.get('favorite_genres', user.favorite_genres)

    db.session.commit()
    return jsonify(user.to_json()), 200

@users.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "bio": user.bio,
        "profile_picture": user.profile_picture,
        "favorite_genres": user.favorite_genres
    }), 200

@users.route('/me', methods=['PATCH'])
@jwt_required()
def update_current_user():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "No input data provided"}), 400
    
    if 'username' in data:
        if User.query.filter_by(username=data['username']).first() and data['username'] != user.username:
            return jsonify({"message": "Username already taken"}), 400
        user.username = data['username']
    
    if 'email' in data:
        if User.query.filter_by(email=data['email']).first() and data['email'] != user.email:
            return jsonify({"message": "Email already in use"}), 400
        user.email = data['email']
    
    if 'bio' in data:
        user.bio = data['bio']
    
    if 'profile_picture' in data:
        user.profile_picture = data['profile_picture']
    
    if 'favorite_genres' in data:
        if isinstance(data['favorite_genres'], str):
            user.favorite_genres = [genre.strip() for genre in data['favorite_genres'].split(',') if genre.strip()]
        else:
            user.favorite_genres = data['favorite_genres']
    
    try:
        db.session.commit()
        return jsonify({
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "bio": user.bio,
                "profile_picture": user.profile_picture,
                "favorite_genres": user.favorite_genres
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to update profile", "error": str(e)}), 500