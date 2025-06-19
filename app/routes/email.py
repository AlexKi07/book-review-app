from flask import Blueprint, jsonify
from flask_mail import Message
from app.extensions import mail

email_bp = Blueprint('email', __name__, url_prefix='/email')

@email_bp.route('/send-test-email')
def send_test_email():
    try:
        msg = Message(
            subject='Test Email',
            recipients=['examplesalex@gmail.com'],
            body='This is a test email from Flask app.'
        )
        mail.send(msg)
        return jsonify({"message": "Email sent successfully!"})
    except Exception as e:
        print("EMAIL ERROR:", str(e))
        return jsonify({"error": str(e)}), 500
