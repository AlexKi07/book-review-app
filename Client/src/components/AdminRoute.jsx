import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, isAuthenticated } = useAuth();
  return isAuthenticated && user?.is_admin ? children : <Navigate to="/login" />;
}
