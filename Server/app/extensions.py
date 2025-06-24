from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from flask_mail import Mail

mail = Mail()

from flask_jwt_extended import JWTManager

jwt = JWTManager()


jwt_blacklist = set()
