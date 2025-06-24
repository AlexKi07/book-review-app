// src/pages/Dashboard.jsx
export default function Dashboard({ user }) {
    return (
      <div>
        <h1>Welcome, {user.username}!</h1>
        <p>User ID: {user.user_id}</p>
      </div>
    );
  }
  