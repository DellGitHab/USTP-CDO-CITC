// src/components/Visitors.js

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AddVisitorModal from "../modals/AddVisitors";
import "../styles/Styles.css";

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [isAddVisitorModalOpen, setIsAddVisitorModalOpen] = useState(false);
  const location = useLocation();

  // Fetch visitors from the database
  const fetchVisitors = async () => {
    try {
      const response = await fetch("http://localhost/ezmonitor/api/visitors/get_visitors.php");
      const data = await response.json();

      console.log("API Data:", data); // Log the response to debug

      if (data.success && Array.isArray(data.visitors) && data.visitors.length > 0) {
        setVisitors(data.visitors);
      } else {
        console.error("Invalid or empty visitors data:", data);
        setVisitors([]); // If the data is invalid, set an empty array
      }
    } catch (error) {
      console.error("Error fetching visitors:", error);
      setVisitors([]); // Set empty array if there's an error
    }
  };

  // Re-fetch visitors when the route changes to /visitors
  useEffect(() => {
    if (location.pathname === "/visitors") {
      fetchVisitors();
    }
  }, [location.pathname]);

  // Open the Add Visitor modal
  const handleOpenAddVisitorModal = () => {
    setIsAddVisitorModalOpen(true);
  };

  // Close the Add Visitor modal
  const handleCloseAddVisitorModal = () => {
    setIsAddVisitorModalOpen(false);
  };

  // Callback after successfully adding a new visitor
  const handleVisitorAdded = () => {
    fetchVisitors(); // Refresh the visitors list
  };

  return (
    <div className="visitors-container">
      <div className="visitors-header">
        <h1 className="visitors-title">Visitors</h1>
        <button className="add-visitor-button" onClick={handleOpenAddVisitorModal}>
          Add Visitor
        </button>
      </div>
      <table className="visitors-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>RFID Number</th>
            <th>Contact</th>
            <th>Address</th>
            <th>Sector</th>
          </tr>
        </thead>
        <tbody>
          {visitors.length > 0 ? (
            visitors.map((visitor) => (
              <tr key={visitor.id}>
                <td>{visitor.id}</td>
                <td>{visitor.fullname}</td>
                <td>{visitor.rfid_number}</td>
                <td>{visitor.contact}</td>
                <td>{visitor.address}</td>
                <td>{visitor.sector}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No visitors found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add Visitor Modal */}
      {isAddVisitorModalOpen && (
        <AddVisitorModal
          onClose={handleCloseAddVisitorModal}
          onVisitorAdded={handleVisitorAdded}
        />
      )}
    </div>
  );
};

export default Visitors;
