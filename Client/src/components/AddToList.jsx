import { useState, useEffect } from "react";

export default function AddToList({ bookId }) {
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const token = JSON.parse(localStorage.getItem("user"))?.access_token;

  const handleAdd = async () => {
    if (!status) return;

    const res = await fetch(`http://localhost:5000/users/book-list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ book_id: bookId, status }),
    });

    if (res.ok) {
      setMessage("Book added to your list.");
    } else {
      const err = await res.json();
      setMessage("Error: " + err.error);
    }
  };

  return (
    <div className="mt-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="p-2 border rounded mr-2"
      >
        <option value="">Add to list</option>
        <option value="Want to Read">Want to Read</option>
        <option value="Currently Reading">Currently Reading</option>
        <option value="Read">Read</option>
      </select>
      <button onClick={handleAdd} className="bg-green-600 text-white px-3 py-1 rounded">
        Save
      </button>
      {message && <p className="text-sm text-gray-600 mt-1">{message}</p>}
    </div>
  );
}
