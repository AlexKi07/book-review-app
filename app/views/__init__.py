from .users_views import users
from .admin_views import admin

def register_views(app):
    """Register view blueprints to the main app."""
    app.register_blueprint(users)
    app.register_blueprint(admin)
