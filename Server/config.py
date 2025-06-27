import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your_secret_key')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your_jwt_secret_key')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'postgresql://br_db_user:y05C1UCEXj5nD5rsxGHbXcFXorBXAqiq@dpg-d1f795adbo4c739mh5tg-a.oregon-postgres.render.com/br_db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    CORS_ORIGINS = ["http://localhost:5173"]

    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'examplesalex@gmail.com'
    MAIL_PASSWORD = 'zuol ijwg eeik uwix'  
    MAIL_DEFAULT_SENDER = 'examplesalex@gmail.com'

   
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ["access", "refresh"]
    
   
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)  # Access token expires in 24 hour
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)  # Refresh token expires in 30 days

    JWT_TOKEN_LOCATION = ['headers', 'cookies']
    JWT_COOKIE_SECURE = False  # True in production
    JWT_COOKIE_SAMESITE = 'Lax'
