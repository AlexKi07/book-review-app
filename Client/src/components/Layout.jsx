import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
