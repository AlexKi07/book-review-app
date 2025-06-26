import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function EditProfileForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    profile_picture: "",
    favorite_genres: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.access_token;
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error("Please log in first.");
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();
        setFormData({
          username: data.username || "",
          email: data.email || "",
          bio: data.bio || "",
          profile_picture: data.profile_picture || "",
          favorite_genres: Array.isArray(data.favorite_genres)
            ? data.favorite_genres.join(", ")
            : data.favorite_genres || "",
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile. Please try again.");
        navigate("/profile");
      }
    };

    fetchUserData();
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setServerError(null); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      // Convert genres to array if string
      const genres = typeof formData.favorite_genres === 'string'
        ? formData.favorite_genres.split(',').map(g => g.trim()).filter(Boolean)
        : formData.favorite_genres;
  
      const response = await fetch("http://localhost:5000/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          favorite_genres: genres
        })
      });
  
      // Handle non-JSON responses
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(text || "Update failed");
      }
  
      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }
  
      toast.success("Profile updated!");
      navigate("/profile");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.message.includes('DOCTYPE') 
        ? "Server error - check backend configuration"
        : error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      
      {serverError && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            minLength={3}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Favorite Genres (comma separated)</label>
          <input
            type="text"
            name="favorite_genres"
            value={formData.favorite_genres}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="e.g., Fantasy, Sci-Fi, Mystery"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Profile Picture URL</label>
          <input
            type="url"
            name="profile_picture"
            value={formData.profile_picture}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="https://example.com/photo.jpg"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 rounded text-white ${
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