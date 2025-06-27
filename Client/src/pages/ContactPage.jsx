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
    toast.success("Message sent successfully!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 mt-10 bg-white shadow-lg rounded-2xl">
      <h1 className="text-4xl font-bold text-center text-blue-800 mb-4">Contact Us</h1>

      <p className="text-center text-gray-600 mb-8">
        Have questions, feedback, or need support? We'd love to hear from you!
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Your name"
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            placeholder="you@example.com"
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            name="message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Write your message..."
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Send Message
        </button>
      </form>

      <div className="mt-10 text-center text-gray-600 text-sm">
        <p>
          Or email us directly at{" "}
          <a href="mailto:support@reviewcorner.com" className="text-blue-600 hover:underline">
            support@reviewcorner.com
          </a>
        </p>
        <p className="mt-3">
          Or visit us at{" "}
          <span className="text-blue-600 font-medium hover:underline"> Floor 5 KICC, Nairobi, Kenya!</span>
        </p>
        <p className="mt-3">
          Maybe even a call at{" "}
          <span className="text-blue-600 font-medium hover:underline"> +254-712-345-678  </span> 
        </p>
      </div>
    </div>
  );
}
