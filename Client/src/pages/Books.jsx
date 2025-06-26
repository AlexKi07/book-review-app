// src/pages/Books.jsx
import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";

function Books() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/books/books")
      .then((res) => res.json())
      .then(setBooks)
      .catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}

export default Books;
