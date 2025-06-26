from .auth import auth
from .books import books
from .comments import comments
from .email import email_bp
from .reviews import reviews
from .ratings import ratings
from .users import users
from .userlist import userlist
from app.routes.users import users as users_blueprint


def register_blueprints(app):
    app.register_blueprint(auth, url_prefix='/auth')
    app.register_blueprint(books, url_prefix='/books')
    app.register_blueprint(comments, url_prefix='/comments')
    app.register_blueprint(reviews, url_prefix='/reviews')
    app.register_blueprint(ratings, url_prefix='/ratings')
    app.register_blueprint(users, url_prefix='/users')
    app.register_blueprint(userlist, url_prefix='/list')
    app.register_blueprint(email_bp, url_prefix='/email')
    app.register_blueprint(users_blueprint, url_prefix="/users")
   

