// src/components/LoginForm.jsx
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { loginUser } from "../api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function LoginForm() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await loginUser(formData);
      login(data); // saves to context
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Login failed.");
    }
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <>
    <div className="border border-black-400 p-5">
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-12 p-6">
      <div className="border-b border-gray-900/10 pb-12">
        <h2 className="text-base font-semibold text-gray-900">Login</h2>
        <p className="mt-1 text-sm text-gray-600">Access your account below.</p>

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-2 block w-full rounded-md px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
            />
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-2 block w-full rounded-md px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          Login
        </button>
      </div>
    </form>
    </div>
    <p className="mt-4 text-sm">
    Don't have an account?{" "}
    <Link to="/register" className="text-blue-500 hover:underline">
      Register here
    </Link>
  </p>
  
  </>
  );
}
