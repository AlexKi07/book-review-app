import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your_secret_key')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your_jwt_secret_key')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///bookreviewdb.sqlite')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

   
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
