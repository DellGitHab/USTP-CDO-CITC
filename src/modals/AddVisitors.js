import React, { useState } from "react";
import axios from "axios";
import "../styles/Modal.css";
const AddVisitorModal = ({ onClose, onVisitorAdded }) => {
  const [visitorDetails, setVisitorDetails] = useState({
    fullname: "",
    rfid_number: "",
    contact: "",
    address: "",
    sector: "",
  });
  const [isFetchingRFID, setIsFetchingRFID] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVisitorDetails({
      ...visitorDetails,
      [name]: value,
    });
  };

  const fetchRfidTag = async () => {
    try {
      setIsFetchingRFID(true);
      const response = await axios.get("http://localhost/ezmonitor/rfid/rfid_endpoint.php"); // Adjust the URL if needed
      if (response.data !== "No RFID") {
        setVisitorDetails((prevDetails) => ({
          ...prevDetails,
          rfid_number: response.data, // Update RFID field with scanned tag
        }));
        setErrorMessage("");
      } else {
        setErrorMessage("No RFID detected. Please scan again.");
      }
    } catch (error) {
      console.error("Error fetching RFID tag:", error);
      setErrorMessage("Error fetching RFID tag. Please check the scanner.");
    } finally {
      setIsFetchingRFID(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!visitorDetails.rfid_number) {
      setErrorMessage("RFID tag is required. Please scan an RFID.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost/ezmonitor/api/visitors/add_visitors.php",
        visitorDetails,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // If the registration is successful, call the onVisitorAdded callback
        onVisitorAdded(visitorDetails);
        onClose(); // Close the form after submitting
      } else {
        alert("Failed to register visitor");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error registering visitor");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add Visitor</h2>
        <form onSubmit={handleSubmit}>
          <div>
          <label>Full Name <span className="required-indicator">*</span></label>
            <input
              type="text"
              name="fullname"
              value={visitorDetails.fullname}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
          <label>Contact <span className="required-indicator">*</span></label>
            <input
              type="text"
              name="contact"
              value={visitorDetails.contact}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
          <label>Address <span className="required-indicator">*</span></label>
            <input
              type="text"
              name="address"
              value={visitorDetails.address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
          <label>Assigned sector <span className="required-indicator">*</span></label>
            <select
              name="sector"
              className="sector"
              value={visitorDetails.sector}
              onChange={handleInputChange}
              required
            >
              <option value="1">Sector 1</option>
              <option value="2">Sector 2</option>
              <option value="3">Sector 3</option>
              <option value="4">Sector 4</option>
              <option value="5">Sector 5</option>
            </select>
          </div>
          <div>
          <label>RFID Number <span className="required-indicator">*</span></label>
              <div className=" rfid-field">
                <input
                  type="text"
                  name="rfid_number"
                  value={visitorDetails.rfid_number}
                  onChange={handleInputChange}
                  readOnly 
                />
                <button
                  type="button"
                  onClick={fetchRfidTag}
                  disabled={isFetchingRFID}
                  className="rfid-button"
                >
                  {isFetchingRFID ? "Fetching..." : "Scan RFID"}
                </button>
              </div>
            </div>
          <div className="button-group">
            <button type="submit">Register Visitor</button>
            <button onClick={onClose} className="close-modal">Close</button>
          </div>
        </form>
        
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default AddVisitorModal;
