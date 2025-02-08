import React, { useState } from "react";
import axios from "axios";
import "../styles/Modal.css";

const AddEmployeeModal = ({ onClose, onEmployeeAdded }) => {
  const [employeeDetails, setEmployeeDetails] = useState({
    fullname: "",
    rfid_number: "",
    contact: "",
    address: "",
    sector: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFetchingRFID, setIsFetchingRFID] = useState(false);

  // Function to fetch the latest RFID tag
  const fetchRfidTag = async () => {
    try {
      setIsFetchingRFID(true); // Indicate RFID fetching in progress
      const response = await axios.get(
        "http://localhost/ezmonitor/rfid/rfid_endpoint.php"
      );
      if (response.data !== "No RFID") {
        setEmployeeDetails((prevDetails) => ({
          ...prevDetails,
          rfid_number: response.data, // Update RFID number
        }));
      } else {
        setErrorMessage("No RFID detected. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching RFID tag:", error);
      setErrorMessage("Error fetching RFID tag. Please check the scanner.");
    } finally {
      setIsFetchingRFID(false); // Reset fetching status
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeDetails({
      ...employeeDetails,
      [name]: value,
    });
    setErrorMessage(""); // Clear error message when input changes
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate if RFID tag is missing
    if (!employeeDetails.rfid_number) {
      setErrorMessage("RFID tag is required. Please scan an RFID.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost/ezmonitor/api/employees/add_employees.php",
        employeeDetails,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // If registration is successful, trigger callback and close modal
        onEmployeeAdded(employeeDetails);
        onClose();
      } else {
        setErrorMessage("Failed to register employee. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Error registering employee. Please check the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add Employee</h2>
        <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name <span className="required-indicator">*</span></label>
          <input
            type="text"
            name="fullname"
            value={employeeDetails.fullname}
            onChange={handleInputChange}
            required
          />
        </div>
          <div>
          <label>Contact <span className="required-indicator">*</span></label>
            <input
              type="text"
              name="contact"
              value={employeeDetails.contact}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
          <label>Address <span className="required-indicator">*</span></label>
            <input
              type="text"
              name="address"
              value={employeeDetails.address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
          <label>Assigned sector <span className="required-indicator">*</span></label>
            <select
              name="sector"
              className="sector"
              value={employeeDetails.sector}
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
            <div className="rfid-field">
            <input
              type="text"
              name="rfid_number"
              value={employeeDetails.rfid_number}
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
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register Employee"}
              </button>
              <button onClick={onClose} className="close-modal">
              Close
             </button>
            </div>
        </form>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

      </div>
    </div>
  );
};

export default AddEmployeeModal;