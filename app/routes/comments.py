from flask import Blueprint, request, jsonify
from app.models.models import Comment, db
from flask_jwt_extended import jwt_required, get_jwt_identity

comments = Blueprint('comments', __name__)

@comments.route('/comments', methods=['POST'])
@jwt_required()
def create_comment():
    data = request.json
    user_id = get_jwt_identity()
    comment = Comment(content=data['content'], review_id=data['review_id'], user_id=user_id)
    db.session.add(comment)
    db.session.commit()
    return jsonify({"msg": "Comment added!", "id": comment.id})

@comments.route('/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    user_id = get_jwt_identity()
    if comment.user_id != user_id:
        return jsonify({"msg": "Not authorized"}), 403
    
    data = request.json
    comment.content = data['content']

    db.session.commit()
    return jsonify({"msg": "Comment updated!"})

@comments.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    user_id = get_jwt_identity()
    if comment.user_id != user_id:
        return jsonify({"msg": "Not authorized"}), 403
    
    db.session.delete(comment)
    db.session.commit()
    return jsonify({"msg": "Comment removed!"})

@comments.route('/comments', methods=['GET'])
def get_all_comments():
    all_comments = Comment.query.all()
    return jsonify([{
        "id": c.id,
        "content": c.content,
        "review_id": c.review_id,
        "user_id": c.user_id
    } for c in all_comments])

@comments.route('/comments/<int:comment_id>', methods=['GET'])
def get_single_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    return jsonify({"id": comment.id, "content": comment.content, "review_id": comment.review_id, "user_id": comment.user_id})
