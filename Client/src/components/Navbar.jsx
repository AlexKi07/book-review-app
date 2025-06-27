import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiUser } from "react-icons/fi";

function Navbar({ isLoggedIn, user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Home" },
    ...(isLoggedIn
      ? [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/profile", label: "Profile" },
          { to: "/books", label: "Books" },
          { to: "/contact", label: "Contact" },
          ...(user?.is_admin
            ? [
                { to: "/admin", label: "Admin" },
                { to: "/admin/users", label: "Users" },
                { to: "/admin/books", label: "Books" },
              ]
            : []),
        ]
      : [{ to: "/register", label: "Register" }]),
  ];
  

  const handleLogout = () => {
    onLogout();
    setMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav className="bg-blue-900">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              <span className="sr-only">Toggle menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Logo and desktop menu */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-row gap-4 items-center">
              <img className="h-8 w-auto" src="/ReviewCornerLogo.jpg" alt="Logo" />
              <h1 className="text-white">ReviewCorner</h1>
            </div>

            {isLoggedIn && (
              <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname === item.to
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right actions: profile + logout */}
          {isLoggedIn && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-3">
              <Link
                to="/profile"
                className="text-white hover:text-gray-300 text-xl"
                title="Profile"
              >
                <FiUser />
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && isLoggedIn && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="space-y-1 px-2 pt-2 pb-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === item.to
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-700 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
