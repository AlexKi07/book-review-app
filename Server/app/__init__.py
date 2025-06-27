from flask import Flask, jsonify, request
import os
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from app.extensions import db, mail
from datetime import timedelta

def create_app(config_class=Config):
    """Application factory function"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
    app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies']
    app.config['JWT_COOKIE_SECURE'] = not app.debug
    app.config['JWT_COOKIE_SAMESITE'] = 'Lax'
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False
    app.config['JWT_CSRF_IN_COOKIES'] = True

    CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173",  
    "https://book-review-app-psi.vercel.app"  
])

    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://br_db_user:y05C1UCEXj5nD5rsxGHbXcFXorBXAqiq@dpg-d1f795adbo4c739mh5tg-a.oregon-postgres.render.com/br_db'  # or PostgreSQL/MySQL URL

    db.init_app(app)
    mail.init_app(app)
    migrate = Migrate(app, db)
    jwt = JWTManager(app)

    login_manager = LoginManager(app)
    login_manager.login_view = 'auth.login'

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

    if app.debug:
        @app.route('/debug/jwt-config')
        def debug_jwt_config():
            return jsonify({
                'access_expires': str(app.config['JWT_ACCESS_TOKEN_EXPIRES']),
                'refresh_expires': str(app.config['JWT_REFRESH_TOKEN_EXPIRES']),
                'jwt_secret_set': bool(app.config.get('JWT_SECRET_KEY')),
                'jwt_token_location': app.config.get('JWT_TOKEN_LOCATION'),
                'debug_mode': app.debug,
                'cors_origins': FRONTEND_URL
            })

    @app.before_request
    def log_request():
        print(f">>> {request.method} {request.path}")

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500

    return app
