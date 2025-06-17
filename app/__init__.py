from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from .config import Config  

db = SQLAlchemy()

def create_app():
    """Flask application factory."""
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)

    with app.app_context():
        db.create_all()
        
    from .routes import register_blueprints
    register_blueprints(app)

    return app
