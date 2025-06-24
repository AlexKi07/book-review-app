// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../api";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const updated = await updateProfile(profile);
      setProfile(updated);
      alert("Profile updated successfully");
    } catch (err) {
      alert("Update failed");
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
      <input
        className="w-full mb-2 p-2 border"
        name="username"
        value={profile.username || ""}
        onChange={handleChange}
        placeholder="Username"
      />
      <input
        className="w-full mb-2 p-2 border"
        name="email"
        value={profile.email || ""}
        onChange={handleChange}
        placeholder="Email"
      />
      <textarea
        className="w-full mb-2 p-2 border"
        name="bio"
        value={profile.bio || ""}
        onChange={handleChange}
        placeholder="Bio"
      />
      <input
        className="w-full mb-2 p-2 border"
        name="profile_picture"
        value={profile.profile_picture || ""}
        onChange={handleChange}
        placeholder="Profile Picture URL"
      />
      <input
        className="w-full mb-2 p-2 border"
        name="favorite_genres"
        value={profile.favorite_genres || ""}
        onChange={handleChange}
        placeholder="Favorite Genres"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Update Profile
      </button>
    </form>
  );
}
