from flask import Blueprint, request, jsonify
from app.models.models import User, db

users = Blueprint('users', __name__)

@users.route('/users', methods=['GET'])
def get_all_users():
    all_users = User.query.all()
    return jsonify([u.to_json() for u in all_users]), 200

@users.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_json()), 200

@users.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    user = User.query.get_or_404(user_id)
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    db.session.commit()
    return jsonify(user.to_json()), 200
