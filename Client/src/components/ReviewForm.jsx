import { useState } from 'react';
import StarRating from './StarRating';

export default function ReviewForm({ bookId, onSubmit }) {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ bookId, content, rating });
    setContent('');
    setRating(0);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-3">Write a Review</h3>
      <form onSubmit={handleSubmit}>
        <StarRating rating={rating} setRating={setRating} />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts about this book..."
          className="w-full p-2 border rounded mt-2"
          rows="4"
          required
        />
        <button
          type="submit"
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
}