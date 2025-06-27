import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";

function BookList() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/books/books")
      .then((res) => res.json())
      .then(setBooks);
  }, []);

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}

export default BookList;
