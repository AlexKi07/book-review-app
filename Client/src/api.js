// src/api.js
export async function loginUser(credentials) {
  const response = await fetch("http://127.0.0.1:5000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  return await response.json(); // returns { access_token, username, user_id }
}
