import React, { useState } from "react";

function ReviewEditor({ onSubmit }) {
  const [reviewContent, setReviewContent] = useState("");

  const handleSubmit = () => {
    if (reviewContent.trim()) {
      onSubmit(reviewContent);
      setReviewContent("");
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-2">Add a Review</h3>
      <textarea
        className="w-full border p-2 rounded"
        value={reviewContent}
        onChange={(e) => setReviewContent(e.target.value)}
        rows={3}
        placeholder="Write your review..."
      ></textarea>
      <button
        onClick={handleSubmit}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit Review
      </button>
    </div>
  );
}

export default ReviewEditor;
