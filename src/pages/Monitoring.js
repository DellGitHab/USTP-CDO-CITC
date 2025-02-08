import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Monitoring.css";

const MonitoringTab = () => {
  const [logs, setLogs] = useState([]); // All logs for the current sector
  const [sector, setSector] = useState("entrance"); // Default sector: Entrance
  const [loading, setLoading] = useState(false);
  const [filterStillInside, setFilterStillInside] = useState(false);
  const [filterUnauthorized, setFilterUnauthorized] = useState(false); // New filter state

  // Function to fetch logs for the selected sector
  const fetchLogs = async (sector) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost/ezmonitor/api/monitoring/retrieve_logs.php?sector=${sector}`
      );
      if (response.data.success) {
        const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD
        const todayLogs = response.data.logs.filter(
          (log) => log.date_entered === today
        );
  
        const sortedLogs = todayLogs.sort(
          (a, b) => new Date(b.time_in).getTime() - new Date(a.time_in).getTime()
        );
        setLogs(sortedLogs);
      } else {
        console.error(response.data.message);
        setLogs([]);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };
  
  // WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "update" && data.logs) {
        console.log("Real-time logs received:", data.logs);

        setLogs((prevLogs) => {
          let updatedLogs = [...prevLogs];

          data.logs.forEach((incomingLog) => {
            // Only process logs matching the selected sector or "entrance"
            if (
              (sector === "entrance" && incomingLog.device_id === "entrance") || // Allow logs from entrance
              (sector !== "entrance" && incomingLog.device_id.toString() === sector) // Allow logs from selected sector
            ) {
              const existingLogIndex = updatedLogs.findIndex(
                (log) =>
                  log.rfid_number === incomingLog.rfid_number &&
                  !log.time_out // Match ongoing logs without time_out
              );

              if (existingLogIndex !== -1) {
                // Update the existing log's time_out
                const updatedLog = {
                  ...updatedLogs[existingLogIndex],
                  time_out: incomingLog.time_out,
                };
                updatedLogs.splice(existingLogIndex, 1); // Remove old log
                updatedLogs = [updatedLog, ...updatedLogs]; // Add updated log to the top
              } else {
                // Add new log entry at the top
                updatedLogs = [incomingLog, ...updatedLogs];
              }
            }
          });

          // Sort logs by time_in in descending order
          updatedLogs.sort(
            (a, b) => new Date(b.time_in).getTime() - new Date(a.time_in).getTime()
          );

          return updatedLogs;
        });
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
    };

    return () => {
      if (ws) ws.close();
    };
  }, [sector]); // Reconnect WebSocket when the sector changes

  // Fetch logs whenever the sector changes
  useEffect(() => {
    fetchLogs(sector);
  }, [sector]);

  // Handle sector selection
  const handleSectorChange = (e) => {
    const newSector = e.target.value; // Use the string value from the dropdown
    setSector(newSector);
  };

  return (
    <div className="monitoring-container">
      <div className="monitoring-header">
        <h1 className="monitoring-title">Monitoring</h1>
        <div className="filter-container">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filterStillInside}
              onChange={(e) => setFilterStillInside(e.target.checked)}
            />
            Still Inside
          </label>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filterUnauthorized}
              onChange={(e) => setFilterUnauthorized(e.target.checked)} // Handle unauthorized filter toggle
            />
            Unauthorized Access
          </label>
          <select
            value={sector}
            onChange={handleSectorChange}
            className="monitoring-dropdown"
          >
            <option value="entrance">Entrance</option>
            <option value="1">Sector 1</option>
            <option value="2">Sector 2</option>
            <option value="3">Sector 3</option>
            <option value="4">Sector 4</option>
            <option value="5">Sector 5</option>
          </select>
        </div>
      </div>  

      {loading ? (
        <p className="loading-text">Loading logs...</p>
      ) : (
        <table className="monitoring-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>RFID Number</th>
              <th>Contact</th>
              <th>Date Entered</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Identification</th>
              <th>Sector</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs
                .filter((log) => {
                  // Apply both filters: still inside and unauthorized
                  return (
                    (!filterStillInside || !log.time_out) &&
                    (!filterUnauthorized || log.identification === "unauth_pers" || log.identification === "unauth_vis")
                  );
                })
                .map((log, index) => {
                  // Determine if the log is unauthorized
                  const isUnauthorized = log.identification === "unauth_pers" || log.identification === "unauth_vis";
                  
                  return (
                    <tr key={index} className={isUnauthorized ? "unauthorized" : ""}>
                      <td>{log.id}</td>
                      <td>{log.fullname}</td>
                      <td>{log.rfid_number}</td>
                      <td>{log.contact}</td>
                      <td>{log.date_entered}</td>
                      <td>{log.time_in}</td>
                      <td className={!log.time_out ? "still-inside" : ""}>
                        {log.time_out || "Still Inside"}
                      </td>
                      <td>{log.identification}</td>
                      <td>{log.sector}</td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan="9">No logs found for the selected sector.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MonitoringTab;
