from flask import Blueprint, request, jsonify
from app.models.models import Book, db
from flask_jwt_extended import jwt_required

books = Blueprint('books', __name__)

@books.route('/books', methods=['POST'])
@jwt_required()
def create_book():
    data = request.json
    book = Book(title=data['title'], author=data['author'], genre=data['genre'])
    db.session.add(book)
    db.session.commit()
    return jsonify({"msg": "Book added!", "id": book.id})

@books.route('/books', methods=['GET'])
def get_books():
    all_books = Book.query.all()
    return jsonify([{
        "id": b.id, "title": b.title, "author": b.author, "genre": b.genre
    } for b in all_books])

@books.route('/books/<int:book_id>', methods=['PUT'])
@jwt_required()
def update_book(book_id):
    book = Book.query.get_or_404(book_id)
    data = request.json
    book.title = data['title']
    book.author = data['author']
    book.genre = data['genre']

    db.session.commit()
    return jsonify({"msg": "Book updated!"})

@books.route('/books/<int:book_id>', methods=['DELETE'])
@jwt_required()
def delete_book(book_id):
    book = Book.query.get_or_404(book_id)
    db.session.delete(book)
    db.session.commit()
    return jsonify({"msg": "Book removed!"})
