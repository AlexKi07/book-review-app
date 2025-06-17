from flask import Blueprint, request, jsonify
from app.models.models import UserBookList, db
from flask_jwt_extended import jwt_required, get_jwt_identity

userlist = Blueprint('userlist', __name__)

@userlist.route('/list', methods=['POST'])
@jwt_required()
def add_to_list():
    data = request.json
    user_id = get_jwt_identity()
    item = UserBookList(status=data['status'], book_id=data['book_id'], user_id=user_id)
    db.session.add(item)
    db.session.commit()
    return jsonify({"msg": "Book added to your list!"})

@userlist.route('/list/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_list(item_id):
    item = UserBookList.query.get_or_404(item_id)
    user_id = get_jwt_identity()
    if item.user_id != user_id:
        return jsonify({"msg": "Not authorized"}), 403
    
    data = request.json
    item.status = data['status']

    db.session.commit()
    return jsonify({"msg": "List updated!"})

@userlist.route('/list/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_from_list(item_id):
    item = UserBookList.query.get_or_404(item_id)
    user_id = get_jwt_identity()
    if item.user_id != user_id:
        return jsonify({"msg": "Not authorized"}), 403
    
    db.session.delete(item)
    db.session.commit()
    return jsonify({"msg": "Removed from list!"})

@userlist.route('/list', methods=['GET'])
@jwt_required()
def view_all():
    user_id = get_jwt_identity()
    items = UserBookList.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": i.id,
        "status": i.status,
        "book_id": i.book_id
    } for i in items])
