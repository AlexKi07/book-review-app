import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      toast.error("Please log in to manage users");
      navigate("/login");
      return;
    }
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("https://book-review-app-kgew.onrender.com/users/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 403 || res.status === 401) {
        setTimeout(() => toast.error("Access denied. Please log in as admin."), 0);
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setTimeout(() => toast.error(err.message), 0);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`https://book-review-app-kgew.onrender.com/users/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setUsers(users.filter((u) => u.id !== id));
      setTimeout(() => toast.success("User deleted successfully"), 0);
    } catch (err) {
      setTimeout(() => toast.error(err.message), 0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>

      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Username</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Admin</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border px-4 py-2">{user.id}</td>
                <td className="border px-4 py-2">{user.username}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.is_admin ? "Yes" : "No"}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UsersManagement;
