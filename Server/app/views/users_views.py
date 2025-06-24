from flask import Blueprint, render_template
from flask_login import login_required, current_user

users = Blueprint('users_views', __name__)

@users.route('/profile')
@login_required
def profile():
    """View the profile of the currently authenticated user."""
    return render_template('profile.html', user=current_user)
