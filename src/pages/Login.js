// src/components/Login.js
import React, { useState } from "react";
import axios from "axios";
import "../styles/Login.css";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Send login data to the backend
      const response = await axios.post("http://localhost/ezmonitor/api/auth/login.php", {
        username,
        password,
      });

      // Handle the backend response
      if (response.data.success) {
        const { username, role, fullname } = response.data.user;

        // Store user info and timestamp in sessionStorage
        const sessionData = {
          username,
          role,
          fullname,
          loginTime: Date.now(), // Store the current timestamp
        };
        sessionStorage.setItem("user", JSON.stringify(sessionData));

        onLogin(sessionData); // Pass user info to parent
      } else {
        setError(response.data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("An error occurred while logging in. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
