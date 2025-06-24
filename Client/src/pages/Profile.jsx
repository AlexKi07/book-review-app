// src/pages/Profile.jsx
import { useEffect, useState } from "react";

export default function Profile({ token }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setUser);
  }, [token]);

  if (!user) return <p>Loading profile...</p>;

  return (
    <div>
      <h2>{user.username}'s Profile</h2>
      <p>Email: {user.email}</p>
      <p>Bio: {user.bio}</p>
    </div>
  );
}