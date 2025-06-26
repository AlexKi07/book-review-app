import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [reviewContent, setReviewContent] = useState("");
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.access_token;

  // Fetch book details
  useEffect(() => {
    fetch(`http://localhost:5000/books/${id}`)
      .then((res) => res.json())
      .then(setBook);
  }, [id]);

  // Fetch comments
  useEffect(() => {
    fetch(`http://localhost:5000/books/${id}/comments`)
      .then((res) => res.json())
      .then(setComments);
  }, [id]);

  // Submit a review
  const handleReviewSubmit = async () => {
    const res = await fetch(`http://localhost:5000/books/${id}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: reviewContent }),
    });

    if (res.ok) {
      setReviewContent("");
      const updated = await fetch(`http://localhost:5000/books/${id}`).then((r) =>
        r.json()
      );
      setBook(updated);
    }
  };

  // Submit a rating
  const handleRatingSubmit = async () => {
    const res = await fetch(`http://localhost:5000/books/${id}/ratings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ score: rating }),
    });

    if (res.ok) {
      const updated = await fetch(`http://localhost:5000/books/${id}`).then((r) =>
        r.json()
      );
      setBook(updated);
    }
  };

  // Submit a comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`http://localhost:5000/books/${id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: newComment }),
    });

    if (res.ok) {
      setNewComment("");
      const updatedComments = await fetch(`http://localhost:5000/books/${id}/comments`).then((res) =>
        res.json()
      );
      setComments(updatedComments);
    }
  };

  if (!book) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">{book.title}</h1>
      <p className="text-gray-600">By {book.author}</p>
      <p className="mb-4 italic">{book.genre}</p>

      <div className="mb-4">
        <strong>Summary:</strong>
        <p>{book.summary}</p>
      </div>

      <div className="mb-4">
        <strong>⭐ Average Rating:</strong>{" "}
        {book.average_rating ? `${book.average_rating}/5` : "No ratings yet"}
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Reviews</h2>
        {book.reviews?.length ? (
          book.reviews.map((r) => (
            <div key={r.id} className="border p-2 my-2 rounded">
              <p>
                <strong>{r.username}</strong>: {r.content}
              </p>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>

      {token && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Add a Review</h3>
          <textarea
            className="w-full border p-2 rounded"
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            rows={3}
          ></textarea>
          <button
            onClick={handleReviewSubmit}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit Review
          </button>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Rate this Book</h3>
            <select
              className="border p-2 rounded"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
            >
              <option value={0}>Select Rating</option>
              {[1, 2, 3, 4, 5].map((star) => (
                <option key={star} value={star}>
                  {star} Star{star > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <button
              onClick={handleRatingSubmit}
              className="ml-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Submit Rating
            </button>
          </div>

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

            <form onSubmit={handleCommentSubmit} className="mt-4">
              <textarea
                className="w-full border p-2 rounded"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                placeholder="Write your comment..."
              />
              <button
                type="submit"
                className="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Post Comment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookDetail