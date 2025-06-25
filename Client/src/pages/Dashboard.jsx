// src/pages/Dashboard.jsx
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <p>Loading user...</p>; // or redirect to login
  }

  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
    </div>
  );
}