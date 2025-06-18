from flask import Blueprint, render_template
from flask_login import login_required, current_user

admin = Blueprint('admin_views', __name__)

def admin_required(function):
    """Decorator to restrict view to admins only."""
    from functools import wraps
    
    @wraps(function)
    def wrapper(*args, **kwargs):
        if not current_user.is_admin:
            return "Forbidden", 403
        return function(*args, **kwargs)

    return wrapper

@admin.route('/dashboard')
@login_required
@admin_required
def dashboard():
    """View for the admin dashboard."""
    return render_template('admin/dashboard.html')
