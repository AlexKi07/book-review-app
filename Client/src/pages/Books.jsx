// src/pages/Books.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Books() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/books")
      .then((res) => res.json())
      .then(setBooks);
  }, []);

  return (
    <div>
      <h2>All Books</h2>
      <ul>
        {books.map((book) => (
          <li key={book.id}>
            <Link to={`/books/${book.id}`}>{book.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
