from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mail import Mail
from flask_jwt_extended import JWTManager
import redis

db = SQLAlchemy()
migrate = Migrate()
mail = Mail()
jwt = JWTManager()

# Initialize Redis client
redis_client = redis.Redis(
    host='localhost',  # or your Redis server host
    port=6379,        # default Redis port
    db=0,             # default database
    decode_responses=True
)
jwt_blacklist = set()