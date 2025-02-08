import React, { useState, useEffect, useCallback } from "react";
import "../styles/ReportLogs.css";

const ReportLogs = () => {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    sector: "",
    identification: "",
    nameOrRfid: "",
    stillInside: false, // New filter for "Still Inside"
  });
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch logs from the backend
  const fetchLogs = useCallback(async () => {
    const params = new URLSearchParams({
      ...filters,
      stillInside: filters.stillInside ? "1" : "0", // Convert boolean to string (0 or 1)
      page: currentPage,
    });

    try {
      const response = await fetch(
        `http://localhost/ezmonitor/api/report/reportLogs.php?${params.toString()}`
      );
      const data = await response.json();
      setLogs(data.logs);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleExport = (format) => {
    const confirmExport = window.confirm("Are you sure you want to export the logs?");
    if (confirmExport) {
      const params = new URLSearchParams({
        ...filters,
        stillInside: filters.stillInside ? "1" : "0",
        format,
      });
      window.open(`http://localhost/ezmonitor/api/report/exportLogs.php?${params.toString()}`);
    }
  };

  return (
    <div className="report-logs-container">
      {/* Top Section: Filters */}
      <div className="filters">
        <input
          type="date"
          name="dateFrom"
          value={filters.dateFrom}
          onChange={handleFilterChange}
          placeholder="From Date"
        />
        <input
          type="date"
          name="dateTo"
          value={filters.dateTo}
          onChange={handleFilterChange}
          placeholder="To Date"
        />
        <select
          name="sector"
          value={filters.sector}
          onChange={handleFilterChange}
        >
          <option value="">All Sectors</option>
          <option value="entrance">Entrance</option>
          <option value="1">Sector 1</option>
          <option value="2">Sector 2</option>
          <option value="3">Sector 3</option>
          <option value="4">Sector 4</option>
          <option value="5">Sector 5</option>
        </select>
        <select
          name="identification"
          value={filters.identification}
          onChange={handleFilterChange}
        >
          <option value="">All</option>
          <option value="personnel">Personnel</option>
          <option value="visitor">Visitor</option>
          <option value="unauth_pers">Unauthorized Personnel</option>
          <option value="unauth_vis">Unauthorized Visitor</option>
        </select>
        <input
          type="text"
          name="nameOrRfid"
          value={filters.nameOrRfid}
          onChange={handleFilterChange}
          placeholder="Name or RFID"
        />
        <label>
          <input
            type="checkbox"
            name="stillInside"
            checked={filters.stillInside}
            onChange={handleFilterChange}
          />
          Unlogged Exits
        </label>
        <button onClick={fetchLogs} className="filter-button">Filter</button>
      </div>

      {/* Middle Section: Log Table */}
      <div className="log-table-container">
        <table className="log-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>RFID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Date</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Sector</th>
              <th>Identification</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.rfid_number}</td>
                  <td>{log.fullname}</td>
                  <td>{log.contact}</td>
                  <td>{log.date_entered}</td>
                  <td>{log.time_in}</td>
                  <td>{log.time_out ? log.time_out : "Still Inside"}</td>
                  <td>{log.sector}</td>
                  <td>{log.identification}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">No logs found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Section: Export and Pagination */}
      <div className="actions">
        <div className="export-buttons">
          <button onClick={() => handleExport("csv")}>Export CSV</button>
          <button onClick={() => handleExport("excel")}>Export Excel</button>
        </div>
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportLogs;
