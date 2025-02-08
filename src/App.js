import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Visitors from "./pages/Visitors";
import Employees from "./pages/Employee";
import Monitoring from "./pages/Monitoring";
import ReportLogs from "./pages/ReportLogs";
import "./App.css";
import Users from "./pages/Users";

const SESSION_TIMEOUT = 10 * 60 * 60 * 1000; // 10 hours

const App = () => {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null; // Check if user is in sessionStorage
  });

  useEffect(() => {
    const checkSessionExpiration = () => {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        const { loginTime } = JSON.parse(storedUser);
        const currentTime = Date.now();

        if (currentTime - loginTime > SESSION_TIMEOUT) {
          alert("Session expired. Please log in again.");
          handleLogout();
        }
      }
    };

    // Check session expiration on app load
    checkSessionExpiration();

    // Set an interval to periodically check session expiration
    const interval = setInterval(checkSessionExpiration, 1000); // Check every second

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const handleLogin = (userData) => {
    const sessionData = { ...userData, loginTime: Date.now() }; // Add login timestamp
    setUser(sessionData);
    sessionStorage.setItem("user", JSON.stringify(sessionData)); // Store user data in sessionStorage
  };

  const handleLogout = () => {
    setUser(null); // Clear user data
    sessionStorage.clear(); // Remove user from sessionStorage
    window.location.href = "/"; // Redirect to login page
  };

  return (
    <Router>
      {user && <Sidebar userRole={user.role} handleLogout={handleLogout} />}
      <div className={user ? "main-content" : ""}>
        <Routes>
          {!user ? (
            <Route path="/" element={<Login onLogin={handleLogin} />} />
          ) : (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/visitors" element={<Visitors />} />
              {user.role === "admin" && (
                <>
                  <Route path="/employee" element={<Employees />} />
                  <Route path="/report-logs" element={<ReportLogs />} />
                  <Route path="/users" element={<Users />} />
                </>
              )}
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </>
          )}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
