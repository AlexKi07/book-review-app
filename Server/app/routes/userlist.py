from flask import Blueprint, request, jsonify
from app.models.models import UserBookList, db
from flask_jwt_extended import jwt_required, get_jwt_identity

userlist = Blueprint('userlist', __name__)

@userlist.route('/list', methods=['POST'])
@jwt_required()
def add_to_list():
    data = request.json
    user_id = get_jwt_identity()
    book_id = data.get('book_id')
    status = data.get('status')

    if not book_id or not status:
        return jsonify({"msg": "book_id and status are required"}), 400

    existing = UserBookList.query.filter_by(user_id=user_id, book_id=book_id).first()

    if existing:
        existing.status = status
        msg = "Book status updated in your list!"
    else:
        item = UserBookList(user_id=user_id, book_id=book_id, status=status)
        db.session.add(item)
        msg = "Book added to your list!"

    db.session.commit()
    return jsonify({"msg": msg}), 200


@userlist.route('/list/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_list(item_id):
    item = UserBookList.query.get_or_404(item_id)
    user_id = get_jwt_identity()
    if item.user_id != user_id:
        return jsonify({"msg": "Not authorized"}), 403
    
    data = request.json
    status = data.get('status')
    if not status:
        return jsonify({"msg": "status is required"}), 400

    item.status = status
    db.session.commit()
    return jsonify({"msg": "List updated!"}), 200


@userlist.route('/list/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_from_list(item_id):
    item = UserBookList.query.get_or_404(item_id)
    user_id = get_jwt_identity()
    if item.user_id != user_id:
        return jsonify({"msg": "Not authorized"}), 403
    
    db.session.delete(item)
    db.session.commit()
    return jsonify({"msg": "Removed from list!"}), 200


@userlist.route('/list', methods=['GET'])
@jwt_required()
def view_all():
    user_id = get_jwt_identity()
    items = UserBookList.query.filter_by(user_id=user_id).all()
    return jsonify([
        {
            "id": i.id,
            "status": i.status,
            "book_id": i.book_id,
            "book": {
                "title": i.book.title,
                "author": i.book.author,
                "genre": i.book.genre,
                "cover_image": i.book.cover_image
            }
        } for i in items
    ]), 200
