import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import CommentList from "../components/CommentList";
import ReviewEditor from "../components/ReviewEditor";
import RatingSelector from "../components/RatingSelector";

function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.access_token;

  useEffect(() => {
    fetch(`http://localhost:5000/books/books/${id}`)
      .then((res) => res.json())
      .then(setBook);
  }, [id]);

  useEffect(() => {
    fetch(`http://localhost:5000/books/books/${id}/comments`)
      .then((res) => res.json())
      .then(setComments);
  }, [id]);

  const handleReviewSubmit = async (content) => {
    const res = await fetch(`http://localhost:5000/books/books/${id}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      const updated = await fetch(`http://localhost:5000/books/books/${id}`).then((r) => r.json());
      setBook(updated);
    }
  };

  const handleRatingSubmit = async () => {
    const res = await fetch(`http://localhost:5000/books/books/${id}/ratings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ score: rating }),
    });

    if (res.ok) {
      const updated = await fetch(`http://localhost:5000/books/books/${id}`).then((r) => r.json());
      setBook(updated);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`http://localhost:5000/books/books/${id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: newComment }),
    });

    if (res.ok) {
      setNewComment("");
      const updatedComments = await fetch(`http://localhost:5000/books/books/${id}/comments`).then((res) =>
        res.json()
      );
      setComments(updatedComments);
    }
  };

  if (!book) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Book Info */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{book.title}</h1>
        <p className="text-gray-600 text-lg">By {book.author}</p>
        <p className="italic text-sm mb-2">{book.genre}</p>

        <div className="mt-2 text-base">
          <strong>Summary:</strong>
          <p>{book.summary}</p>
        </div>

        <div className="mt-2">
          <strong>⭐ Average Rating:</strong>{" "}
          {book.average_rating ? `${book.average_rating}/5` : "No ratings yet"}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-3">Reviews</h2>
        {book.reviews?.length ? (
          book.reviews.map((r) => (
            <div key={r.id} className="border p-3 mb-2 rounded shadow-sm">
              <p>
                <strong>{r.username}</strong>: {r.content}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </div>

      {/* Authenticated Actions */}
      {token && (
        <div className="mt-10">
          {/* Add Review */}
          <div className="mb-8 p-4 border rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Add a Review</h3>
            <ReviewEditor onSubmit={handleReviewSubmit} />
          </div>

          {/* Rate Book */}
          <div className="mb-8 p-4 border rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Rate this Book</h3>
            <RatingSelector value={rating} onChange={(val) => setRating(val)} />
            <button
              onClick={handleRatingSubmit}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Submit Rating
            </button>
          </div>

          {/* Comments */}
          <div className="p-4 border rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Comments</h3>
            <CommentList comments={comments} />

            <form onSubmit={handleCommentSubmit} className="mt-4">
              <textarea
                className="w-full border p-2 rounded mb-2"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                placeholder="Write your comment..."
              />
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
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

export default BookDetail;
