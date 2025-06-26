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

@users.route('/me', methods=['GET', 'PATCH', 'OPTIONS'])  
@jwt_required()
def current_user():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    
    if request.method == 'PATCH':
        data = request.get_json()
        
        if 'username' in data:
            if User.query.filter(User.username == data['username'], User.id != user_id).first():
                return jsonify({"error": "Username taken"}), 400
        
        allowed_fields = ['username', 'email', 'bio', 'profile_picture', 'favorite_genres']
        updates = {k: data[k] for k in allowed_fields if k in data}
        
        try:
            for key, value in updates.items():
                setattr(user, key, value)
            db.session.commit()
            return jsonify(user.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
    
    return jsonify(user.to_dict()), 200