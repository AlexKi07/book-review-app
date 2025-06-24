// src/components/LoginForm.jsx
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { loginUser } from "../api";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/dashboard" replace />; // already logged in

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await loginUser({ email, password });
      login(data);              // save to context + localStorage
      navigate("/dashboard");   // redirect after login
    } catch (err) {
      setError(err.message || "Login failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
