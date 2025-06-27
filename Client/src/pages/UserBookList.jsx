import { useEffect, useState } from "react";

export default function UserBookList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.access_token;

  const fetchList = async () => {
    try {
      const res = await fetch("http://localhost:5000/list/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setList(data);
    } catch (err) {
      console.error("Failed to fetch list:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (itemId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/list/list/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchList();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      const res = await fetch(`http://localhost:5000/list/list/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) fetchList();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  if (loading) return <p>Loading your list...</p>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Your Book List</h2>
      {list.length === 0 ? (
        <p className="text-gray-600">Your list is empty.</p>
      ) : (
        <ul className="space-y-4">
          {list.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-4 p-4 border rounded shadow-sm"
            >
              <img
                src={item.book.cover_image}
                alt={item.book.title}
                className="w-16 h-24 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold">{item.book.title}</h3>
                <p className="text-sm text-gray-600">{item.book.author}</p>
                <p className="text-sm text-blue-600">Status: {item.status}</p>
                <select
                  value={item.status}
                  onChange={(e) => updateStatus(item.id, e.target.value)}
                  className="mt-2 p-1 border rounded"
                >
                  <option>Want to Read</option>
                  <option>Currently Reading</option>
                  <option>Read</option>
                </select>
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                className="text-red-600 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
