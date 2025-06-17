from flask import Blueprint

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['POST'])
def login():
    # NOT COMPLETE
    return "Login route"

@auth.route('/register', methods=['POST'])
def register():
    # NOT YET COMPLETE
    return "Register route"
