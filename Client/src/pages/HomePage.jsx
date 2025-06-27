import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-blue-600 text-white py-6 shadow-md">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-bold">📚 BookNook</h1>
          <p className="text-sm mt-1">Your go-to hub for book lovers and reviewers</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <section className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-3">Discover, Review, and Share Your Favorite Books</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Browse the latest books, read community reviews, and build your personal book list.
          </p>
          <div className="mt-6 space-x-4">
            <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">
              Get Started
            </Link>
            <Link to="/books" className="bg-gray-200 px-5 py-2 rounded hover:bg-gray-300">
              Browse Books
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4 bg-white rounded shadow hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-2">📖 Book Catalog</h3>
            <p className="text-sm text-gray-600">Explore a wide range of genres and authors.</p>
          </div>
          <div className="p-4 bg-white rounded shadow hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-2">⭐ Ratings & Reviews</h3>
            <p className="text-sm text-gray-600">Read and share honest opinions about books.</p>
          </div>
          <div className="p-4 bg-white rounded shadow hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-2">📝 Personal Book Lists</h3>
            <p className="text-sm text-gray-600">Keep track of what you want to read next.</p>
          </div>
        </section>
      </main>

      <footer className="bg-white text-center py-4 mt-10 text-sm text-gray-500 border-t">
        © {new Date().getFullYear()} BookNook. All rights reserved.
      </footer>
    </div>
  );
}
