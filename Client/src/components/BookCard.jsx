// src/components/BookCard.jsx
import { useNavigate } from "react-router-dom";

function BookCard({ book }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/books/${book.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-lg transition p-4"
    >
      <h2 className="text-lg font-bold">{book.title}</h2>
      <p className="text-sm text-gray-600">by {book.author}</p>
      <p className="text-xs text-gray-500">{book.genre}</p>
    </div>
  );
}

export default BookCard;
