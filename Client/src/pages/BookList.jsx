import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import SearchBar from "../components/SearchBar";

function BookList() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBooks = async (query = "") => {
    try {
      const url = query
        ? `https://book-review-app-kgew.onrender.com/books/books?search=${encodeURIComponent(query)}`
        : "https://book-review-app-kgew.onrender.com/books";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch books");
      const data = await res.json();
      setBooks(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchBooks(query);
  };

  return (
    <div className="p-6">
      <SearchBar onSearch={handleSearch} />
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {books.length > 0 ? (
          books.map((book) => <BookCard key={book.id} book={book} />)
        ) : (
          <p className="text-gray-500">No books found.</p>
        )}
      </div>
    </div>
  );
}

export default BookList;
