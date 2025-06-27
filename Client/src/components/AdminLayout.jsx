
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-blue-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        {user && (
          <div className="text-sm">
            Logged in as <strong>{user.username}</strong>
            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-1 rounded bg-red-600 hover:bg-red-700 transition text-white text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-grow">
        <aside className="w-64 bg-white p-4 shadow-md hidden md:block">
          <nav className="space-y-2">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `block px-3 py-2 rounded ${
                  isActive ? "bg-blue-100 text-blue-800 font-semibold" : "text-blue-600 hover:underline"
                }`
              }
            >
              Overview
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `block px-3 py-2 rounded ${
                  isActive ? "bg-blue-100 text-blue-800 font-semibold" : "text-blue-600 hover:underline"
                }`
              }
            >
              Manage Users
            </NavLink>
            <NavLink
              to="/admin/books"
              className={({ isActive }) =>
                `block px-3 py-2 rounded ${
                  isActive ? "bg-blue-100 text-blue-800 font-semibold" : "text-blue-600 hover:underline"
                }`
              }
            >
              Manage Books
            </NavLink>
          </nav>
        </aside>

        <main className="flex-grow p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
