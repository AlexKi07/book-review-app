// src/pages/BookDetail.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/books/${id}`)
      .then((res) => res.json())
      .then(setBook);
  }, [id]);

  if (!book) return <p>Loading book...</p>;

  return (
    <div>
      <h2>{book.title}</h2>
      <p>{book.description}</p>
      <p>Author: {book.author}</p>
    </div>
  );
}