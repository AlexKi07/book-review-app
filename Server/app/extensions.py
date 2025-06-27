from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mail import Mail
from flask_jwt_extended import JWTManager
import redis

db = SQLAlchemy()
migrate = Migrate()
mail = Mail()
jwt = JWTManager()

redis_client = redis.Redis(
    host='localhost',  
    port=6379,        
    db=0,             
    decode_responses=True
)
jwt_blacklist = set()