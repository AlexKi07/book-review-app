import { useState, useRef, useEffect } from "react";
import { registerUser } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await registerUser(formData);
      if (isMounted.current) {
        toast.success("Registration successful!");
        navigate("/login");
      }
    } catch (err) {
      if (isMounted.current) {
        toast.error(err.message || "Registration failed.");
      }
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-12 p-6 max-w-2xl mx-auto bg-white rounded-md shadow-md">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-xl font-semibold text-gray-900">Register</h2>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

            <div className="sm:col-span-3">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-900">First name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                className="mt-2 block w-full rounded-md px-3 py-1.5 outline outline-1 outline-gray-300 focus:outline-indigo-600" required />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-900">Last name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                className="mt-2 block w-full rounded-md px-3 py-1.5 outline outline-1 outline-gray-300 focus:outline-indigo-600" required />
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-900">Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange}
                className="mt-2 block w-full rounded-md px-3 py-1.5 outline outline-1 outline-gray-300 focus:outline-indigo-600" required />
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="mt-2 block w-full rounded-md px-3 py-1.5 outline outline-1 outline-gray-300 focus:outline-indigo-600" required />
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange}
                className="mt-2 block w-full rounded-md px-3 py-1.5 outline outline-1 outline-gray-300 focus:outline-indigo-600" required />
            </div>

          </div>
        </div>

        <div className="mt-6 flex justify-end gap-x-6">
          <button type="button" disabled={isSubmitting} className="text-sm font-semibold text-gray-900">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`rounded-md px-3 py-2 text-sm font-semibold text-white ${
              isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </div>
      </form>

      <p className="mt-4 text-sm text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-500 hover:underline">
          Login here
        </Link>
      </p>
    </>
  );
}
