from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_jwt_extended import JWTManager
from config import Config
from .models.models import User

db = SQLAlchemy()
login_manager = LoginManager()
jwt = JWTManager()

def create_app():
    """Flask application factory."""
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)
    JWTManager(app)
    login_manager.init_app(app)
    jwt.init_app(app)  

    login_manager.login_view = 'auth.login'  

    with app.app_context():
        db.create_all()

    
    from .routes.views import register_views
    register_views(app)

    from .routes import register_blueprints
    register_blueprints(app)

    return app

@login_manager.user_loader
def load_user(user_id):
    """Flask-Login callback to reload a User by ID."""
    return User.query.get(int(user_id))
