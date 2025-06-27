import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulate sending message
    toast.success("Message sent successfully!");

    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-semibold text-center text-blue-800 mb-6">Contact Us</h1>

      <p className="text-center text-gray-600 mb-8">
        Have questions, feedback, or need support? We'd love to hear from you!
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            name="message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700"
        >
          Send Message
        </button>
      </form>

      <div className="mt-8 text-center text-gray-500 text-sm">
        Or email us directly at{" "}
        <a href="mailto:support@reviewcorner.com" className="text-blue-600 hover:underline">
          support@reviewcorner.com
        </a>
      </div>
      <div className="mt-8 text-center text-gray-500 text-sm">
        Or maybe come see us at{" "}
        <p  className="text-blue-600 hover:underline">
          KICC Floor 5
        </p>
      </div>
    </div>
  );
}
