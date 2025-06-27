import { useState, useEffect } from "react";

export default function BookForm() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    summary: "",
    cover_image_url: "",
  });

  const [userList, setUserList] = useState([]);
  const [editItemId, setEditItemId] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.access_token;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchUserList = async () => {
    try {
      const res = await fetch("https://book-review-app-kgew.onrender.com/list/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUserList(data);
    } catch (err) {
      console.error("Failed to load book list", err);
    }
  };

  useEffect(() => {
    if (token) fetchUserList();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bookData = { ...formData };

    try {
      const res = await fetch("https://book-review-app-kgew.onrender.com/books/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add book.");
      }

      const newBook = await res.json();

      await fetch("https://book-review-app-kgew.onrender.com/list/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          book_id: newBook.id,
          status: "Want to Read",
        }),
      });

      alert("Book added and added to your list as 'Want to Read'!");
      setFormData({
        title: "",
        author: "",
        genre: "",
        summary: "",
        cover_image_url: "",
      });
      fetchUserList();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this book from your list?")) return;

    const res = await fetch(`https://book-review-app-kgew.onrender.com/list/list/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      fetchUserList();
    } else {
      alert("Failed to delete book from your list.");
    }
  };

  const handleStatusUpdate = async (id) => {
    const res = await fetch(`https://book-review-app-kgew.onrender.com/list/list/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      setEditItemId(null);
      setNewStatus("");
      fetchUserList();
    } else {
      alert("Failed to update status.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow mt-6">
      <h2 className="text-xl font-semibold mb-4">Add a New Book</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="title"
          placeholder="Title"
          className="w-full border p-2 rounded"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="author"
          placeholder="Author"
          className="w-full border p-2 rounded"
          value={formData.author}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="genre"
          placeholder="Genre"
          className="w-full border p-2 rounded"
          value={formData.genre}
          onChange={handleChange}
          required
        />
        <textarea
          name="summary"
          placeholder="Summary"
          className="w-full border p-2 rounded"
          rows={4}
          value={formData.summary}
          onChange={handleChange}
        ></textarea>
        <input
          type="text"
          name="cover_image_url"
          placeholder="Cover Image URL"
          value={formData.cover_image_url}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {formData.cover_image_url && (
        <img
          src={formData.cover_image_url}
          alt="Preview"
          className="w-32 h-auto border mt-2 rounded"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/150x220.png?text=No+Cover";
          }}
  />
)}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Book
        </button>
      </form>

      {/* Book List Section */}
      <div className="mt-10">
        <h3 className="text-lg font-bold mb-4">Your Book List</h3>
        {userList.length === 0 ? (
          <p className="text-gray-500">No books in your list yet.</p>
        ) : (
          <div className="space-y-4">
            {userList.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 border rounded p-3 bg-gray-50"
              >
                {item.book.cover_image && (
                  <img
                    src={item.book.cover_image}
                    alt={item.book.title}
                    className="w-24 h-32 object-cover rounded"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
                <div className="flex-1">
                  <h4 className="text-md font-semibold">{item.book.title}</h4>
                  <p className="text-sm text-gray-700">by {item.book.author}</p>
                  <p className="text-sm text-gray-500">Genre: {item.book.genre}</p>
                  <p className="text-sm italic mt-1 text-blue-600">{item.status}</p>

                  {editItemId === item.id ? (
                    <div className="mt-2 space-x-2">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="border px-2 py-1 rounded"
                      >
                        <option value="">Select status</option>
                        <option value="Want to Read">Want to Read</option>
                        <option value="Currently Reading">Currently Reading</option>
                        <option value="Read">Read</option>
                      </select>
                      <button
                        onClick={() => handleStatusUpdate(item.id)}
                        className="bg-green-600 text-white px-2 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditItemId(null)}
                        className="text-sm text-gray-600 underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 space-x-3">
                      <button
                        onClick={() => {
                          setEditItemId(item.id);
                          setNewStatus(item.status);
                        }}
                        className="text-sm text-blue-600 underline"
                      >
                        Edit Status
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-sm text-red-600 underline"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
