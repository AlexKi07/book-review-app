from .users import users
from .admin import admin

def register_views(app):
    """Register view blueprints to the main app."""
    app.register_blueprint(users)
    app.register_blueprint(admin)
