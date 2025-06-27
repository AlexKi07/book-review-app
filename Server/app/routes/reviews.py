from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import Review, User, db

reviews = Blueprint('reviews', __name__)

@reviews.route('/reviews', methods=['POST'])
@jwt_required()
def create_review():
    data = request.json
    user_id = get_jwt_identity()
    review = Review(content=data['content'], book_id=data['book_id'], user_id=user_id)
    db.session.add(review)
    db.session.commit()
    return jsonify({"msg": "Review added!", "id": review.id})

@reviews.route('/reviews/<int:review_id>', methods=['PUT'])
@jwt_required()
def update_review(review_id):
    review = Review.query.get_or_404(review_id)
    user_id = get_jwt_identity()
    if review.user_id != user_id:
        return jsonify({"msg": "Not authorized"}), 403

    data = request.json
    review.content = data['content']
    db.session.commit()
    return jsonify({"msg": "Review updated!"})

@reviews.route('/reviews/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(review_id):
    review = Review.query.get_or_404(review_id)
    user_id = get_jwt_identity()
    if review.user_id != user_id:
        return jsonify({"msg": "Not authorized"}), 403

    db.session.delete(review)
    db.session.commit()
    return jsonify({"msg": "Review removed!"})

@reviews.route('/admin/reviews/<int:review_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_review(review_id):
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)

    if not user.is_admin:
        return jsonify({"msg": "Admin access required"}), 403

    review = Review.query.get_or_404(review_id)

    db.session.delete(review)  
    db.session.commit()
    return jsonify({"msg": "Review and comments deleted by admin"})

@reviews.route('/reviews', methods=['GET'])
def get_all_reviews():
    all_reviews = Review.query.all()
    return jsonify([{
        "id": r.id,
        "content": r.content,
        "book_id": r.book_id,
        "user_id": r.user_id
    } for r in all_reviews])

@reviews.route('/reviews/<int:review_id>', methods=['GET'])
def get_single_review(review_id):
    review = Review.query.get_or_404(review_id)
    return jsonify({
        "id": review.id,
        "content": review.content,
        "book_id": review.book_id,
        "user_id": review.user_id
    })
