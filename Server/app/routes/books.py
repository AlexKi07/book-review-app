from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from datetime import datetime
from app.models.models import db, Book, Review, Rating, Comment

books = Blueprint('books', __name__)
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://book-review-app-psi.vercel.app"
]

def set_cors(response):
    origin = request.headers.get("Origin")
    if origin in ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    return response

@books.route('/books', methods=['OPTIONS'])
def books_options():
    return set_cors(jsonify({})), 204

@books.route('/books', methods=['POST'])
@jwt_required()
def create_book():
    data = request.get_json()
    title = data.get('title')
    author = data.get('author')
    genre = data.get('genre')
    summary = data.get('summary')
    cover_image_url = data.get('cover_image_url')

    if not all([title, author, genre]):
        return set_cors(jsonify({"error": "Title, author, and genre are required."})), 400

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

    return set_cors(jsonify(new_book.to_dict())), 201

@books.route('/books', methods=['GET'])
def get_books():
    search = request.args.get("search", "").strip().lower()
    if search:
        books_result = Book.query.filter(
            (Book.title.ilike(f"%{search}%")) |
            (Book.author.ilike(f"%{search}%")) |
            (Book.genre.ilike(f"%{search}%"))
        ).all()
    else:
        books_result = Book.query.all()

    return set_cors(jsonify([b.to_dict() for b in books_result])), 200

@books.route('/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    book = Book.query.get_or_404(book_id)
    avg_rating = (
        round(sum(r.score for r in book.ratings) / len(book.ratings), 1)
        if book.ratings else None
    )
    return set_cors(jsonify({
        **book.to_dict(),
        "average_rating": avg_rating,
        "reviews": [
            {
                "id": r.id,
                "content": r.content,
                "user_id": r.user_id,
                "username": r.user.username if r.user else "Unknown",
                "created_at": r.created_at,
                "comments": [
                    {
                        "id": c.id,
                        "content": c.content,
                        "username": c.user.username if c.user else "Unknown",
                        "created_at": c.created_at
                    } for c in r.comments
                ]
            } for r in book.reviews
        ]
    })), 200

@books.route('/books/<int:book_id>', methods=['PUT'])
@jwt_required()
def update_book(book_id):
    book = Book.query.get_or_404(book_id)
    data = request.get_json()

    for field in ['title', 'author', 'genre', 'summary']:
        if field in data:
            setattr(book, field, data[field])

    db.session.commit()
    return set_cors(jsonify({"message": "Book updated!"})), 200

@books.route('/books/<int:book_id>', methods=['DELETE'])
@jwt_required()
def delete_book(book_id):
    book = Book.query.get_or_404(book_id)
    db.session.delete(book)
    db.session.commit()
    return set_cors(jsonify({"message": "Book removed!"})), 200

@books.route('/books/<int:book_id>/reviews', methods=['POST'])
@jwt_required()
def post_review(book_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    content = data.get('content')

    if not content:
        return set_cors(jsonify({"error": "Content is required"})), 400

    review = Review(
        content=content,
        book_id=book_id,
        user_id=user_id,
        created_at=datetime.utcnow()
    )
    db.session.add(review)
    db.session.commit()

    return set_cors(jsonify(review.to_dict())), 201

@books.route('/reviews/<int:review_id>', methods=['PUT'])
@jwt_required()
def update_review(review_id):
    user_id = get_jwt_identity()
    review = Review.query.get_or_404(review_id)

    if review.user_id != user_id:
        return set_cors(jsonify({"error": "Unauthorized"})), 403

    data = request.get_json()
    content = data.get("content")
    if not content:
        return set_cors(jsonify({"error": "Content is required"})), 400

    review.content = content
    db.session.commit()
    return set_cors(jsonify({"message": "Review updated"})), 200

@books.route('/books/<int:book_id>/ratings', methods=['POST'])
@jwt_required()
def post_rating(book_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    score = data.get('score')

    if not isinstance(score, (int, float)):
        return set_cors(jsonify({"error": "Invalid rating value"})), 400

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
    return set_cors(jsonify({"message": "Rating submitted"})), 201

@books.route('/reviews/<int:review_id>/comments', methods=['POST'])
@jwt_required()
def post_review_comment(review_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    content = data.get("content")

    if not content:
        return set_cors(jsonify({"error": "Content is required"})), 400

    review = Review.query.get_or_404(review_id)
    book_id = review.book_id

    comment = Comment(
        content=content,
        user_id=user_id,
        book_id=book_id,
        review_id=review_id,
        created_at=datetime.utcnow()
    )

    db.session.add(comment)
    db.session.commit()
    return set_cors(jsonify({"message": "Comment added to review!"})), 201

@books.route('/reviews/<int:review_id>/comments', methods=['GET'])
def get_review_comments(review_id):
    review = Review.query.get_or_404(review_id)
    return set_cors(jsonify([
        {
            "id": c.id,
            "content": c.content,
            "username": c.user.username if c.user else "Unknown",
            "created_at": c.created_at
        } for c in review.comments
    ])), 200

@books.route('/books/<int:book_id>/reviews/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(book_id, review_id):
    user_id = get_jwt_identity()
    review = Review.query.filter_by(id=review_id, book_id=book_id).first_or_404()

    if review.user_id != user_id:
        return set_cors(jsonify({"error": "Unauthorized to delete this review"})), 403

    db.session.delete(review)
    db.session.commit()
    return set_cors(jsonify({"message": "Review deleted"})), 200

@books.route('/reviews/<int:review_id>/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_review_comment(review_id, comment_id):
    user_id = get_jwt_identity()
    comment = Comment.query.filter_by(id=comment_id, review_id=review_id).first_or_404()

    if comment.user_id != user_id:
        return set_cors(jsonify({"error": "Unauthorized to delete this comment"})), 403

    db.session.delete(comment)
    db.session.commit()
    return set_cors(jsonify({"message": "Comment deleted from review"})), 200
