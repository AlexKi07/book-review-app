from flask import Blueprint, request, jsonify
from app.models.models import Rating, db
from flask_jwt_extended import jwt_required, get_jwt_identity

ratings = Blueprint('ratings', __name__)

@ratings.route('/ratings', methods=['POST'])
@jwt_required()
def create_rating():
    """Rate a book (1-5) by the authenticated user."""
    data = request.json
    user_id = get_jwt_identity()
    book_id = data['book_id']
    score = data['score']

    existing = Rating.query.filter_by(user_id=user_id, book_id=book_id).first()
    if existing:
        return jsonify({"msg": "Rating already exists. Please update instead."}), 400

    rating = Rating(score=score, book_id=book_id, user_id=user_id)
    db.session.add(rating)
    db.session.commit()
    return jsonify({"msg": "Rating added!", "id": rating.id})

@ratings.route('/ratings/<int:rating_id>', methods=['PUT'])
@jwt_required()
def update_rating(rating_id):
    """Update a book's rating by its owner."""
    rating = Rating.query.get_or_404(rating_id)
    user_id = get_jwt_identity()
    if rating.user_id != user_id:
        return jsonify({"msg": "Not authorized"}), 403
    
    data = request.json
    rating.score = data['score']

    db.session.commit()
    return jsonify({"msg": "Rating updated!"})

@ratings.route('/ratings/<int:rating_id>', methods=['DELETE'])
@jwt_required()
def delete_rating(rating_id):
    """Remove a book's rating by its owner."""
    rating = Rating.query.get_or_404(rating_id)
    user_id = get_jwt_identity()
    if rating.user_id != user_id:
        return jsonify({"msg": "Not authorized"}), 403
    
    db.session.delete(rating)
    db.session.commit()
    return jsonify({"msg": "Rating removed!"})

@ratings.route('/ratings', methods=['GET'])
def view_all_ratings():
    """View all ratings in the database."""
    all_ratings = Rating.query.all()
    return jsonify([{
        "id": r.id,
        "score": r.score,
        "book_id": r.book_id,
        "user_id": r.user_id
    } for r in all_ratings])

@ratings.route('/ratings/<int:rating_id>', methods=['GET'])
def view_single_rating(rating_id):
    """View a single rating by its id."""
    rating = Rating.query.get_or_404(rating_id)
    return jsonify({"id": rating.id, "score": rating.score, "book_id": rating.book_id, "user_id": rating.user_id})
