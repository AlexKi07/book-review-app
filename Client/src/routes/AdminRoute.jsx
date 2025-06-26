import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user?.is_admin) {
    return <Navigate to="/login" />;
  }

  return children;
}
