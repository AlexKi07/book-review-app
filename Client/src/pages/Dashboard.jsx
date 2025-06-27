import { useState } from "react";

export function BookForm() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    summary: "",
  });
  const [coverImage, setCoverImage] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.access_token;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setCoverImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("title", formData.title);
    form.append("author", formData.author);
    form.append("genre", formData.genre);
    form.append("summary", formData.summary);
    if (coverImage) form.append("cover_image", coverImage);

    const res = await fetch("http://localhost:5000/books/books", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Don't set Content-Type manually
      },
      body: form,
    });

    if (res.ok) {
      alert("Book added successfully!");
      setFormData({ title: "", author: "", genre: "", summary: "" });
      setCoverImage(null);
    } else {
      const err = await res.json();
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded shadow mt-6">
      <h2 className="text-xl font-semibold mb-4">Add a New Book</h2>
      <form onSubmit={handleSubmit} className="space-y-3" encType="multipart/form-data">
        <input type="text" name="title" placeholder="Title" className="w-full border p-2 rounded" value={formData.title} onChange={handleChange} required />
        <input type="text" name="author" placeholder="Author" className="w-full border p-2 rounded" value={formData.author} onChange={handleChange} required />
        <input type="text" name="genre" placeholder="Genre" className="w-full border p-2 rounded" value={formData.genre} onChange={handleChange} required />
        <textarea name="summary" placeholder="Summary" className="w-full border p-2 rounded" rows={4} value={formData.summary} onChange={handleChange}></textarea>
        <input type="file" name="cover_image" accept="image/*" onChange={handleFileChange} />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Submit Book
        </button>
      </form>
    </div>
  );
}


export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-700">
        Welcome to your dashboard! Here you can see a summary of your activity and manage your books.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Books Summary</h2>
          <p>You have 0 books added.</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Profile Info</h2>
          <p>Edit your account or see your details here.</p>
        </div>
      </div>

      {/* Add Book Submission Form */}
      <BookForm />
    </div>
  );
}
