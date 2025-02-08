import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AddEmployeeModal from "../modals/AddEmployee";
import "../styles/Styles.css";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const location = useLocation();

  // Fetch employees from the database
  const fetchEmployees = async () => {
    try {
      const response = await fetch("http://localhost/ezmonitor/api/employees/get_employees.php");
      const data = await response.json();

      if (data.success && Array.isArray(data.employees)) {
        setEmployees(data.employees);
      } else {
        console.error("Invalid or empty employees data:", data);
        setEmployees([]); // Reset to an empty array if data is invalid
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]); // Reset to an empty array on error
    }
  };

  // Re-fetch employees when the route changes to /employee
  useEffect(() => {
    if (location.pathname === "/employee") {
      fetchEmployees();
    }
  }, [location.pathname]);

  // Open the Add Employee modal
  const handleOpenAddEmployeeModal = () => {
    setIsAddEmployeeModalOpen(true);
  };

  // Close the Add Employee modal
  const handleCloseAddEmployeeModal = () => {
    setIsAddEmployeeModalOpen(false);
  };

  // Callback after successfully adding a new employee
  const handleEmployeeAdded = () => {
    fetchEmployees(); // Refresh the employees list
  };

  return (
    <div className="visitors-container">
      <div className="visitors-header">
        <h1 className="visitors-title">Personnel</h1>
        <button className="add-visitor-button" onClick={handleOpenAddEmployeeModal}>
          Add Personnel
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
          {employees.length > 0 ? (
            employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.id}</td>
                <td>{employee.fullname}</td>
                <td>{employee.rfid_number}</td>
                <td>{employee.contact}</td>
                <td>{employee.address}</td>
                <td>{employee.sector}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No employees found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add Employee Modal */}
      {isAddEmployeeModalOpen && (
        <AddEmployeeModal
          onClose={handleCloseAddEmployeeModal}
          onEmployeeAdded={handleEmployeeAdded}
        />
      )}
    </div>
  );
};

export default Employee;
