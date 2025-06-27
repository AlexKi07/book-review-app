from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import cross_origin
import os
from datetime import datetime

from app.models.models import db, Book, Review, Rating, Comment

books = Blueprint('books', __name__)
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@books.route('/books', methods=['OPTIONS'])
@cross_origin(origins=["http://localhost:5173"], supports_credentials=True)
def books_options():
    return '', 200


@books.route('/books', methods=['POST'])
@cross_origin(origins=["http://localhost:5173"], supports_credentials=True)
@jwt_required()
def create_book():
    data = request.get_json()
    title = data.get('title')
    author = data.get('author')
    genre = data.get('genre')
    summary = data.get('summary')
    cover_image_url = data.get('cover_image_url')

    if not all([title, author, genre]):
        return jsonify({"error": "Title, author, and genre are required."}), 400

    new_book = Book(
        title=title,
        author=author,
        genre=genre,
        summary=summary,
        cover_image=cover_image_url,
        created_at=datetime.utcnow()
    )

    db.session.add(new_book)
    db.session.commit()

    return jsonify(new_book.to_dict()), 201


@books.route('/books', methods=['GET'])
@cross_origin(origins=["http://localhost:5173"], supports_credentials=True)
def get_books():
    search = request.args.get("search", "").strip().lower()

    if search:
        books = Book.query.filter(
            (Book.title.ilike(f"%{search}%")) |
            (Book.author.ilike(f"%{search}%")) |
            (Book.genre.ilike(f"%{search}%"))
        ).all()
    else:
        books = Book.query.all()

    return jsonify([b.to_dict() for b in books]), 200


@books.route('/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    book = Book.query.get_or_404(book_id)

    avg_rating = (
        round(sum(r.score for r in book.ratings) / len(book.ratings), 1)
        if book.ratings else None
    )

    return jsonify({
        **book.to_dict(),
        "average_rating": avg_rating,
        "reviews": [
            {
                "id": r.id,
                "content": r.content,
                "user_id": r.user_id,
                "username": r.user.username if r.user else "Unknown",
                "created_at": r.created_at
            } for r in book.reviews
        ]
    }), 200


@books.route('/books/<int:book_id>', methods=['PUT'])
@jwt_required()
def update_book(book_id):
    book = Book.query.get_or_404(book_id)
    data = request.get_json()

    for field in ['title', 'author', 'genre', 'summary']:
        if field in data:
            setattr(book, field, data[field])

    db.session.commit()
    return jsonify({"message": "Book updated!"}), 200


@books.route('/books/<int:book_id>', methods=['DELETE'])
@jwt_required()
def delete_book(book_id):
    book = Book.query.get_or_404(book_id)
    db.session.delete(book)
    db.session.commit()
    return jsonify({"message": "Book removed!"}), 200


@books.route('/books/<int:book_id>/reviews', methods=['POST'])
@jwt_required()
def post_review(book_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    content = data.get('content')
    if not content:
        return jsonify({"error": "Content is required"}), 400

    review = Review(
        content=content,
        book_id=book_id,
        user_id=user_id,
        created_at=datetime.utcnow()
    )
    db.session.add(review)
    db.session.commit()

    return jsonify(review.to_dict()), 201


@books.route('/reviews/<int:review_id>', methods=['PUT'])
@jwt_required()
def update_review(review_id):
    user_id = get_jwt_identity()
    review = Review.query.get_or_404(review_id)

    if review.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    content = data.get("content")
    if not content:
        return jsonify({"error": "Content is required"}), 400

    review.content = content
    db.session.commit()

    return jsonify({"message": "Review updated"}), 200


@books.route('/books/<int:book_id>/ratings', methods=['POST'])
@jwt_required()
def post_rating(book_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    score = data.get('score')

    if not isinstance(score, (int, float)):
        return jsonify({"error": "Invalid rating value"}), 400

    existing = Rating.query.filter_by(book_id=book_id, user_id=user_id).first()
    if existing:
        existing.score = score
    else:
        rating = Rating(
            score=score,
            book_id=book_id,
            user_id=user_id,
            created_at=datetime.utcnow()
        )
        db.session.add(rating)

    db.session.commit()
    return jsonify({"message": "Rating submitted"}), 201


@books.route('/books/<int:book_id>/comments', methods=['POST'])
@jwt_required()
def post_book_comment(book_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    content = data.get("content")
    if not content:
        return jsonify({"error": "Content is required"}), 400

    comment = Comment(
        content=content,
        user_id=user_id,
        book_id=book_id,
        created_at=datetime.utcnow()
    )
    db.session.add(comment)
    db.session.commit()

    return jsonify({"message": "Comment added!"}), 201


@books.route('/books/<int:book_id>/comments', methods=['GET'])
def get_book_comments(book_id):
    book = Book.query.get_or_404(book_id)
    return jsonify([
        {
            "id": c.id,
            "content": c.content,
            "user_id": c.user_id,
            "username": c.user.username if c.user else "Unknown",
            "created_at": c.created_at
        } for c in book.comments
    ]), 200


@books.route('/books/<int:book_id>/reviews/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(book_id, review_id):
    user_id = get_jwt_identity()
    review = Review.query.filter_by(id=review_id, book_id=book_id).first_or_404()

    if review.user_id != user_id:
        return jsonify({"error": "Unauthorized to delete this review"}), 403

    db.session.delete(review)
    db.session.commit()
    return jsonify({"message": "Review deleted"}), 200


@books.route('/books/<int:book_id>/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(book_id, comment_id):
    user_id = get_jwt_identity()
    comment = Comment.query.filter_by(id=comment_id, book_id=book_id).first_or_404()

    if comment.user_id != user_id:
        return jsonify({"error": "Unauthorized to delete this comment"}), 403

    db.session.delete(comment)
    db.session.commit()
    return jsonify({"message": "Comment deleted"}), 200
