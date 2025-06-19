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
