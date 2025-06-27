// CommentList.jsx
import React from "react";

function CommentList({ comments }) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>
      {comments.length ? (
        comments.map((c) => (
          <div key={c.id} className="border p-2 my-2 rounded">
            <strong>{c.user}</strong>: {c.content}
          </div>
        ))
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
}

export default CommentList;