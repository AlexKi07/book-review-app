import { useState } from "react";

function ReviewList({ reviews, onCommentSubmit, commentContent, setCommentContent }) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold">Reviews</h2>
      {reviews?.length ? (
        reviews.map((r) => (
          <div key={r.id} className="border p-2 my-2 rounded">
            <p>
              <strong>{r.username}</strong>: {r.content}
            </p>

            <form onSubmit={(e) => onCommentSubmit(e, r.id)} className="mt-2">
              <textarea
                className="w-full border p-2 rounded"
                value={commentContent[r.id] || ""}
                onChange={(e) => setCommentContent({ ...commentContent, [r.id]: e.target.value })}
                rows={2}
                placeholder="Write your comment..."
              />
              <button
                type="submit"
                className="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Comment on Review
              </button>
            </form>
          </div>
        ))
      ) : (
        <p>No reviews yet.</p>
      )}
    </div>
  );
}

export default ReviewList;