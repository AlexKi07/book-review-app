from flask import Flask
from flask_login import LoginManager
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from app.extensions import db, mail
from app.models.models import User  
from datetime import timedelta

login_manager = LoginManager()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    app.config.from_object(Config)
    
    if 'JWT_ACCESS_TOKEN_EXPIRES' not in app.config:
        app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    if 'JWT_REFRESH_TOKEN_EXPIRES' not in app.config:
        app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

    db.init_app(app)
    mail.init_app(app)
    
    
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    
    jwt = JWTManager(app)
    
    from app.extensions import jwt_blacklist
    
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        return jwt_payload["jti"] in jwt_blacklist

 
    from app.views import register_views
    from app.routes import register_blueprints
    register_views(app)
    register_blueprints(app)

    with app.app_context():
        db.create_all()

    @app.route('/debug/jwt-config')
    def debug_jwt_config():
        return {
            'access_expires': str(app.config['JWT_ACCESS_TOKEN_EXPIRES']),
            'refresh_expires': str(app.config['JWT_REFRESH_TOKEN_EXPIRES']),
            'jwt_secret_set': bool(app.config['JWT_SECRET_KEY'])
        }

    return app