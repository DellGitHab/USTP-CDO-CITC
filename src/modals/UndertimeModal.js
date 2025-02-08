import React, { useState } from "react";
import "../styles/UndertimeModal.css";
import * as XLSX from "xlsx";

const UndertimeModal = ({ undertimeRecords, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 13;

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = undertimeRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(undertimeRecords.length / recordsPerPage);

  // Function to export the undertime records to Excel
  const exportToExcel = () => {
    const confirmed = window.confirm(
      "Are you sure you want to export the undertime records to Excel?"
    );
    if (confirmed) {
      const worksheet = XLSX.utils.json_to_sheet(undertimeRecords);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Undertime Records");
      XLSX.writeFile(workbook, "Undertime_Records.xlsx");
    } else {
      console.log("Export canceled.");
    }
  };

  return (
    <div className="undertime-modal">
      <div className="modal-content-undertime">
        <h2>Undertime Records</h2>

        <button onClick={exportToExcel} className="export-button">
          Export to Excel
        </button>

        <table>
          <thead>
            <tr>
              <th>RFID</th>
              <th>Name</th>
              <th>Date</th>
              <th>Total Time</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((record, index) => (
                <tr key={index}>
                  <td>{record.rfid_number}</td>
                  <td>{record.fullname}</td>
                  <td>{record.date_entered}</td>
                  <td>{record.total_time}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No undertime records found</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="footer-actions">
          <button onClick={onClose} className="close-button">
            Close
          </button>
          <div className="pagination">
            <button
              onClick={() =>
                setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)
              }
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>{`Page ${currentPage} of ${totalPages}`}</span>
            <button
              onClick={() =>
                setCurrentPage(
                  currentPage < totalPages ? currentPage + 1 : totalPages
                )
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UndertimeModal;
