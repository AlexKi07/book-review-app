// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Profile() {
  const [profile, setProfile] = useState(null);
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.access_token;

  useEffect(() => {
    fetch("http://localhost:5000/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch((err) => console.error("Failed to fetch profile:", err));
  }, []);

  if (!profile) return <p className="text-center mt-8">Loading profile...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <div className="flex items-center gap-4">
        <img
          src={profile.profile_picture || "/default-avatar.png"}
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover border"
        />
        <div>
          <h2 className="text-xl font-bold">{profile.username}</h2>
          <p className="text-gray-600">{profile.email}</p>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-1">Bio:</h3>
        <p className="text-gray-700">{profile.bio || "No bio yet."}</p>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-1">Favorite Genres:</h3>
        <p className="text-gray-700">{profile.favorite_genres || "None listed."}</p>
      </div>
      <div className="mt-6 flex justify-end">
        <Link to="/edit-profile" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 justify-end">
          Edit Profile
        </Link>
      </div>
    </div>
  );
}

export default Profile;