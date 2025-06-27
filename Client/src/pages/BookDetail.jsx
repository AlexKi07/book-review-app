import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import CommentList from "../components/CommentList";
import ReviewEditor from "../components/ReviewEditor";
import RatingSelector from "../components/RatingSelector";

function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedReviewContent, setEditedReviewContent] = useState("");

  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.access_token;
  const currentUserId = userData?.user?.id;
  const currentUsername = userData?.user?.username;

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

  const refreshBook = async () => {
    const updated = await fetch(`http://localhost:5000/books/books/${id}`).then((r) => r.json());
    setBook(updated);
  };

  const handleAddToList = async () => {
    try {
      const res = await fetch("http://localhost:5000/list/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          book_id: book.id,
          status: "Want to Read",
        }),
      });

      if (!res.ok) throw new Error("Failed to add to list");
      toast.success("Book added to your list!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReviewSubmit = async (content) => {
    const res = await fetch(`http://localhost:5000/books/books/${id}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    if (res.ok) refreshBook();
  };

  const handleReviewDelete = async (reviewId) => {
    const res = await fetch(`http://localhost:5000/books/books/${id}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) refreshBook();
  };

  const handleReviewEdit = async () => {
    const res = await fetch(`http://localhost:5000/reviews/${editingReviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: editedReviewContent }),
    });

    if (res.ok) {
      setEditingReviewId(null);
      setEditedReviewContent("");
      refreshBook();
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

    if (res.ok) refreshBook();
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

  const handleCommentDelete = async (commentId) => {
    const res = await fetch(`http://localhost:5000/books/books/${id}/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const updatedComments = await fetch(`http://localhost:5000/books/books/${id}/comments`).then((res) =>
        res.json()
      );
      setComments(updatedComments);
    }
  };

  if (!book) return <p className="text-center text-gray-500 mt-10 text-lg">Loading book details...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Book Details */}
      <div className="bg-white shadow-md rounded-2xl p-6 mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{book.title}</h1>
        <p className="text-xl text-gray-600 mb-1">by {book.author}</p>
        <p className="text-sm italic text-blue-600 mb-4">{book.genre}</p>
        <p className="text-gray-700 mb-4">
          <span className="font-semibold">Summary:</span> {book.summary}
        </p>
        <p className="text-md">
          <strong className="text-gray-800">⭐ Average Rating:</strong>{" "}
          <span className="text-yellow-600 font-medium">
            {book.average_rating ? `${book.average_rating}/5` : "No ratings yet"}
          </span>
        </p>

        {token && (
          <button
            onClick={handleAddToList}
            className="mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition duration-200"
          >
            📚 Add to My List
          </button>
        )}
      </div>

      {/* Reviews */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Reviews</h2>
        {book.reviews?.length > 0 ? (
          book.reviews.map((r) => (
            <div key={r.id} className="bg-white border rounded-lg p-4 mb-3 shadow-sm">
              {editingReviewId === r.id ? (
                <>
                  <textarea
                    value={editedReviewContent}
                    onChange={(e) => setEditedReviewContent(e.target.value)}
                    className="w-full border rounded p-2 mb-2"
                  />
                  <button onClick={handleReviewEdit} className="mr-2 px-3 py-1 bg-green-600 text-white rounded">Save</button>
                  <button onClick={() => setEditingReviewId(null)} className="px-3 py-1 bg-gray-400 text-white rounded">Cancel</button>
                </>
              ) : (
                <>
                  <p>
                    <span className="font-semibold text-indigo-600">{r.username}</span>: {r.content}
                  </p>
                  {token && r.user_id === currentUserId && (
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={() => {
                          setEditingReviewId(r.id);
                          setEditedReviewContent(r.content);
                        }}
                        className="text-sm text-blue-600 underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleReviewDelete(r.id)}
                        className="text-sm text-red-600 underline"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </div>

      {/* User Interactions */}
      {token && (
        <div className="space-y-10">
          {/* Review */}
          <div className="bg-white p-6 rounded-xl shadow border">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Write a Review</h3>
            <ReviewEditor onSubmit={handleReviewSubmit} />
          </div>

          {/* Rating */}
          <div className="bg-white p-6 rounded-xl shadow border">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Rate this Book</h3>
            <RatingSelector value={rating} onChange={(val) => setRating(val)} />
            <button
              onClick={handleRatingSubmit}
              className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded-lg transition"
            >
              Submit Rating
            </button>
          </div>

          {/* Comments */}
          <div className="bg-white p-6 rounded-xl shadow border">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Comments</h3>
            {comments.map((c) => (
              <div key={c.id} className="border rounded-lg p-3 mb-2">
                <p>
                  <strong className="text-purple-700">{c.username}</strong>: {c.content}
                </p>
                {token && c.username === currentUsername && (
                  <button
                    onClick={() => handleCommentDelete(c.id)}
                    className="text-sm text-red-600 underline mt-1"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}

            <form onSubmit={handleCommentSubmit} className="mt-4">
              <textarea
                className="w-full border border-gray-300 p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
