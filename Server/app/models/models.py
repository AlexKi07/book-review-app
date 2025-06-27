from flask_login import UserMixin
from datetime import datetime
from app.extensions import db 


class User(db.Model, UserMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    bio = db.Column(db.Text)
    profile_picture = db.Column(db.String(200))
    favorite_genres = db.Column(db.Text)
    is_admin = db.Column(db.Boolean, default=False)
    is_banned = db.Column(db.Boolean, default=False)

    reviews = db.relationship('Review', back_populates='user', cascade='all, delete-orphan')
    ratings = db.relationship('Rating', back_populates='user', cascade='all, delete-orphan')
    comments = db.relationship('Comment', back_populates='user', cascade='all, delete-orphan')
    book_lists = db.relationship('UserBookList', back_populates='user', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.username}>'

    def to_json(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "bio": self.bio,
            "profile_picture": self.profile_picture,
            "favorite_genres": self.favorite_genres,
            "is_admin": self.is_admin
        }


class Book(db.Model):
    __tablename__ = 'books'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    genre = db.Column(db.String(50))
    summary = db.Column(db.Text)
    cover_image = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    reviews = db.relationship('Review', back_populates='book', cascade='all, delete-orphan')
    ratings = db.relationship('Rating', back_populates='book', cascade='all, delete-orphan')
    comments = db.relationship('Comment', back_populates='book', cascade='all, delete-orphan')
    user_lists = db.relationship('UserBookList', back_populates='book', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Book {self.title}>'

    @property
    def average_rating(self):
        if not self.ratings:
            return None
        return round(sum(r.score for r in self.ratings) / len(self.ratings), 2)

    def to_dict(self, include_reviews=False):
        data = {
            "id": self.id,
            "title": self.title,
            "author": self.author,
            "genre": self.genre,
            "summary": self.summary,
            "cover_image": self.cover_image,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

        if include_reviews:
            data["reviews"] = [
                {
                    "id": review.id,
                    "content": review.content,
                    "username": review.user.username
                } for review in self.reviews
            ]
        return data


class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    content = db.Column(db.Text, nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    book = db.relationship('Book', back_populates='reviews')
    user = db.relationship('User', back_populates='reviews')
    comments = db.relationship('Comment', back_populates='review', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Review {self.id} by User {self.user_id}>'

    def to_dict(self, include_user=False, include_comments=False):
        data = {
            "id": self.id,
            "content": self.content,
            "book_id": self.book_id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

        if include_user and self.user:
            data["user"] = {
                "id": self.user.id,
                "username": self.user.username,
                "profile_picture": self.user.profile_picture
            }

        if include_comments:
            data["comments"] = [comment.to_dict() for comment in self.comments]

        return data


class Rating(db.Model):
    __tablename__ = 'ratings'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    score = db.Column(db.Integer, nullable=False)  # 1-5
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    book = db.relationship('Book', back_populates='ratings')
    user = db.relationship('User', back_populates='ratings')

    def __repr__(self):
        return f'<Rating {self.score} by User {self.user_id}>'

    def to_dict(self, include_user=False):
        data = {
            "id": self.id,
            "score": self.score,
            "book_id": self.book_id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

        if include_user and self.user:
            data["user"] = {
                "id": self.user.id,
                "username": self.user.username,
                "profile_picture": self.user.profile_picture
            }

        return data


class Comment(db.Model):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    review_id = db.Column(db.Integer, db.ForeignKey('reviews.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    review = db.relationship('Review', back_populates='comments')
    book = db.relationship('Book', back_populates='comments')
    user = db.relationship('User', back_populates='comments')

    def __repr__(self):
        return f'<Comment {self.id} by User {self.user_id}>'

    def to_dict(self, include_user=False):
        data = {
            "id": self.id,
            "content": self.content,
            "user_id": self.user_id,
            "book_id": self.book_id,
            "review_id": self.review_id,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

        if include_user and self.user:
            data["user"] = {
                "id": self.user.id,
                "username": self.user.username,
                "profile_picture": self.user.profile_picture
            }

        return data


class UserBookList(db.Model):
    __tablename__ = 'user_book_lists'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # "Want to Read", "Currently Reading", "Read"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='book_lists')
    book = db.relationship('Book', back_populates='user_lists')

    def __repr__(self):
        return f'<UserBookList {self.user_id} - {self.book_id} - {self.status}>'

    def to_dict(self, include_book=False):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "book_id": self.book_id,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

        if include_book and self.book:
            data["book"] = {
                "id": self.book.id,
                "title": self.book.title,
                "author": self.book.author,
                "genre": self.book.genre,
            }

        return data
