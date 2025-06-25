import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { loginUser } from "../api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";


export default function LoginForm() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await loginUser({ email, password });
      login(data);
      navigate("/dashboard");
    } catch (err) {
      toast.error("Login failed");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md space-y-6"
    >
      <h2 className="text-2xl font-semibold text-gray-800">Login to your account</h2>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 text-sm font-semibold"
        >
          Login
        </button>
        <a
          href="/register"
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          Register
        </a>
      </div>
    </form>
  );
}
