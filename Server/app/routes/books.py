from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import cross_origin
from werkzeug.utils import secure_filename
import os

from app.models.models import db, Book, Review, Rating, Comment

books = Blueprint('books', __name__)
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# CORS Preflight
@books.route('/books', methods=['OPTIONS'])
@cross_origin(origins=["http://localhost:5173"], supports_credentials=True)
def books_options():
    return '', 200


# Create a Book
@books.route('/books', methods=['POST'])
@cross_origin(origins=["http://localhost:5173"], supports_credentials=True)
@jwt_required()
def create_book():
    title = request.form.get('title')
    author = request.form.get('author')
    genre = request.form.get('genre')
    summary = request.form.get('summary')
    cover_image = request.files.get('cover_image')

    if not all([title, author, genre]):
        return jsonify({"error": "Title, author, and genre are required."}), 400

    filename = None
    if cover_image:
        filename = secure_filename(cover_image.filename)
        path = os.path.join(UPLOAD_FOLDER, filename)
        cover_image.save(path)

    new_book = Book(
        title=title,
        author=author,
        genre=genre,
        summary=summary,
        cover_image=filename
    )

    db.session.add(new_book)
    db.session.commit()

    return jsonify(new_book.to_dict()), 201


# Get all Books
@books.route('/books', methods=['GET'])
@cross_origin(origins=["http://localhost:5173"], supports_credentials=True)
def get_books():
    books = Book.query.all()
    return jsonify([b.to_dict() for b in books]), 200


# Get Single Book with Reviews and Rating
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
                "username": r.user.username
            } for r in book.reviews
        ]
    }), 200


# Update a Book
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


# Delete a Book
@books.route('/books/<int:book_id>', methods=['DELETE'])
@jwt_required()
def delete_book(book_id):
    book = Book.query.get_or_404(book_id)
    db.session.delete(book)
    db.session.commit()
    return jsonify({"message": "Book removed!"}), 200


# Post a Review
@books.route('/books/<int:book_id>/reviews', methods=['POST'])
@jwt_required()
def post_review(book_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    content = data.get('content')
    if not content:
        return jsonify({"error": "Content is required"}), 400

    review = Review(content=content, book_id=book_id, user_id=user_id)
    db.session.add(review)
    db.session.commit()

    return jsonify(review.to_dict()), 201


# Post a Rating
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
        rating = Rating(score=score, book_id=book_id, user_id=user_id)
        db.session.add(rating)

    db.session.commit()
    return jsonify({"message": "Rating submitted"}), 201


# Post a Comment
@books.route('/books/<int:book_id>/comments', methods=['POST'])
@jwt_required()
def post_book_comment(book_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    content = data.get("content")
    if not content:
        return jsonify({"error": "Content is required"}), 400

    comment = Comment(content=content, user_id=user_id, book_id=book_id)
    db.session.add(comment)
    db.session.commit()

    return jsonify({"message": "Comment added!"}), 201


# Get Comments for a Book
@books.route('/books/<int:book_id>/comments', methods=['GET'])
def get_book_comments(book_id):
    book = Book.query.get_or_404(book_id)
    return jsonify([
        {
            "id": c.id,
            "content": c.content,
            "user": c.user.username
        } for c in book.comments
    ]), 200
