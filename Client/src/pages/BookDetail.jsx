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

  if (!book) return <p className="text-center text-gray-500 mt-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Book Info */}
      <div className="bg-white rounded-2xl shadow p-6 mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-1">{book.title}</h1>
        <p className="text-xl text-gray-600">by {book.author}</p>
        <p className="text-sm italic text-purple-500 mb-4">{book.genre}</p>

        <div className="text-gray-700">
          <h2 className="font-semibold mb-1">Summary:</h2>
          <p className="mb-3">{book.summary}</p>

          <p className="text-md">
            <strong>⭐ Average Rating:</strong>{" "}
            <span className="text-yellow-600 font-medium">
              {book.average_rating ? `${book.average_rating}/5` : "No ratings yet"}
            </span>
          </p>
        </div>
      </div>

      {/* Reviews */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Reviews</h2>
        {book.reviews?.length ? (
          book.reviews.map((r) => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm">
              <p>
                <span className="font-semibold text-purple-700">{r.username}</span>: {r.content}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </div>

      {/* Authenticated User Actions */}
      {token && (
        <div className="space-y-8">
          {/* Add Review */}
          <div className="bg-white p-5 rounded-xl shadow border">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Add a Review</h3>
            <ReviewEditor onSubmit={handleReviewSubmit} />
          </div>

          {/* Rate Book */}
          <div className="bg-white p-5 rounded-xl shadow border">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Rate this Book</h3>
            <RatingSelector value={rating} onChange={(val) => setRating(val)} />
            <button
              onClick={handleRatingSubmit}
              className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              Submit Rating
            </button>
          </div>

          {/* Comments */}
          <div className="bg-white p-5 rounded-xl shadow border">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Comments</h3>
            <CommentList comments={comments} />

            <form onSubmit={handleCommentSubmit} className="mt-4">
              <textarea
                className="w-full border border-gray-300 p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                placeholder="Write your comment..."
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition"
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
