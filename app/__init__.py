from flask import Flask
from flask_login import LoginManager
from flask_jwt_extended import JWTManager

from config import Config
from app.extensions import db, mail
from app.models.models import User  

login_manager = LoginManager()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    
    db.init_app(app)
    mail.init_app(app)
    login_manager.init_app(app)
    jwt.init_app(app)

    login_manager.login_view = 'auth.login'

   
    from app.views import register_views
    register_views(app)

    from app.routes import register_blueprints
    register_blueprints(app)

  
    with app.app_context():
        db.create_all()

    return app

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))
