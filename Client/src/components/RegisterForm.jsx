// src/components/RegisterForm.jsx
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { registerUser, loginUser } from "../api";
import { useAuth } from "../context/AuthContext";

export default function RegisterForm() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/dashboard" replace />; // prevent access if logged in

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await registerUser({ username, email, password });
      const data = await loginUser({ email, password }); // auto-login after register
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
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
      <button type="submit">Register</button>
    </form>
  );
}
