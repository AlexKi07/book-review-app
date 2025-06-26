// src/api.js

const API_BASE = "http://127.0.0.1:5000";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
}

export async function loginUser(credentials) {
  const res = await fetch("http://localhost:5000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");

  const userData = {
    ...data.user,
    access_token: data.access_token,
  };

  localStorage.setItem("user", JSON.stringify(userData));

  return userData;
}



export async function registerUser(formData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Registration failed");
  }

  return data;
}

export async function getProfile() {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to fetch profile");
  return data;
}

export async function updateProfile(updated) {
  const profile = await getProfile();
  const res = await fetch(`${API_BASE}/users/${profile.id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(updated),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to update profile");
  return data;
}

export async function logoutUser() {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: authHeaders(),
  });
  localStorage.removeItem("token");
}
