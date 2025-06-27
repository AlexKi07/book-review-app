import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function EditProfileForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    profile_picture: "",
    favorite_genres: "",
  });
  const [token, setToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const isMounted = useRef(true);
  const navigate = useNavigate();

  useEffect(() => {
    isMounted.current = true;

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("Please log in first.");
      navigate("/login");
      return;
    }

    let parsedUser;
    try {
      parsedUser = JSON.parse(storedUser);
    } catch (e) {
      localStorage.removeItem("user");
      toast.error("Corrupted login data. Please log in again.");
      navigate("/login");
      return;
    }

    const accessToken = parsedUser?.access_token;

    if (!accessToken) {
      toast.error("Invalid token. Please log in.");
      navigate("/login");
      return;
    }

    setToken(accessToken);

    const fetchUserData = async () => {
      try {
        await delay(300);
        const res = await fetch("https://book-review-app-kgew.onrender.com/users/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();

        if (isMounted.current) {
          setFormData({
            username: data.username || "",
            email: data.email || "",
            bio: data.bio || "",
            profile_picture: data.profile_picture || "",
            favorite_genres: Array.isArray(data.favorite_genres)
              ? data.favorite_genres.join(", ")
              : data.favorite_genres || "",
          });
        }
      } catch (err) {
        toast.error("Failed to load profile. Please try again.");
        navigate("/profile");
      }
    };

    fetchUserData();

    return () => {
      isMounted.current = false;
    };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cleanedGenres = formData.favorite_genres
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean)
        .join(", ");

      await delay(500);

      const res = await fetch("https://book-review-app-kgew.onrender.com/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, favorite_genres: cleanedGenres }),
      });

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(text || "Update failed");
      }

      if (!res.ok) throw new Error(data.error || "Update failed");

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const updatedUser = { ...storedUser, ...data };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile updated!");
      navigate("/profile");
    } catch (error) {
      toast.error(
        error.message.includes("DOCTYPE")
          ? "Server error - check backend configuration"
          : error.message
      );
    } finally {
      if (isMounted.current) setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Edit Profile</h1>

      {serverError && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-semibold">Username</label>
          <input
            type="text"
            name="username"
            required
            minLength={3}
            value={formData.username}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">
            Favorite Genres (comma separated)
          </label>
          <input
            type="text"
            name="favorite_genres"
            value={formData.favorite_genres}
            onChange={handleChange}
            placeholder="e.g., Fantasy, Sci-Fi, Mystery"
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Profile Picture URL</label>
          <input
            type="url"
            name="profile_picture"
            value={formData.profile_picture}
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
            className="w-full border p-2 rounded"
          />
          {formData.profile_picture && (
            <img
              src={formData.profile_picture}
              alt="Profile preview"
              className="mt-3 w-32 h-32 object-cover rounded-full border"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded text-white font-semibold ${
            isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default EditProfileForm;
