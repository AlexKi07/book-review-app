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
    book_id = data.get('book_id')
    score = data.get('score')

    if book_id is None or score is None:
        return jsonify({"msg": "Missing book_id or score"}), 400

    if not (1 <= score <= 5):
        return jsonify({"msg": "Rating must be between 1 and 5"}), 400

    existing = Rating.query.filter_by(user_id=user_id, book_id=book_id).first()
    if existing:
        return jsonify({"msg": "Rating already exists. Please update instead."}), 400

    rating = Rating(score=score, book_id=book_id, user_id=user_id)
    db.session.add(rating)
    db.session.commit()
    return jsonify({"msg": "Rating added!", "id": rating.id}), 201

@ratings.route('/ratings/<int:rating_id>', methods=['PUT'])
@jwt_required()
def update_rating(rating_id):
    """Update a book's rating by its owner."""
    rating = Rating.query.get_or_404(rating_id)
    user_id = get_jwt_identity()
    if rating.user_id != user_id:
        return jsonify({"msg": "Not authorized"}), 403
    
    data = request.json
    score = data.get('score')
    if score is None or not (1 <= score <= 5):
        return jsonify({"msg": "Invalid or missing score"}), 400

    rating.score = score
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
    return jsonify({
        "id": rating.id,
        "score": rating.score,
        "book_id": rating.book_id,
        "user_id": rating.user_id
    })

@ratings.route('/books/<int:book_id>/ratings', methods=['GET'])
def get_ratings_for_book(book_id):
    """Get all ratings for a specific book and the average."""
    ratings = Rating.query.filter_by(book_id=book_id).all()
    average = round(sum(r.score for r in ratings) / len(ratings), 2) if ratings else None

    return jsonify({
        "average_rating": average,
        "ratings": [{
            "id": r.id,
            "score": r.score,
            "user_id": r.user_id
        } for r in ratings]
    })
