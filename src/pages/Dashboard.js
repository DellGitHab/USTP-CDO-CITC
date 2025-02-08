import React, { useEffect, useState } from 'react';
import '../styles/Dashboard.css';
import UndertimeModal from '../modals/UndertimeModal'; // Import the modal component

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalVisitors: 0,
    logsToday: {
      employees: 0,
      visitors: 0,
    },
    sectors: {
      1: { employees: 0, visitors: 0 },
      2: { employees: 0, visitors: 0 },
      3: { employees: 0, visitors: 0 },
      4: { employees: 0, visitors: 0 },
      5: { employees: 0, visitors: 0 },
    },
  });

  const [undertimeRecords, setUndertimeRecords] = useState([]);
  const [showUndertime, setShowUndertime] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost/ezmonitor/api/dashboard/dashboard.php');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  const fetchUndertime = async () => {
    try {
      const response = await fetch('http://localhost/ezmonitor/api/dashboard/getUndertime.php');
      const data = await response.json();
      setUndertimeRecords(data.logs);
      setShowUndertime(true);
    } catch (error) {
      console.error('Error fetching undertime records:', error);
    }
  };

  const closeUndertimeModal = () => {
    setShowUndertime(false);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="dashboard-item">
          <img src="/employe.png" alt="Total Employees" />
          <div className="dashboard-item-text">
            <h3>Total Personnel</h3>
            <p className="dashboard-item-number">{stats.totalEmployees}</p>
          </div>
        </div>

        <div className="dashboard-item">
          <img src="/employe.png" alt="Total Visitors" />
          <div className="dashboard-item-text">
            <h3>Total Visitors</h3>
            <p className="dashboard-item-number">{stats.totalVisitors}</p>
          </div>
        </div>

        <div className="dashboard-item">
          <img src="/logs.png" alt="Total Logs" />
          <div className="dashboard-item-text">
            <h3>Entrance</h3>
            <p>
              Personnel: <span className="dashboard-item-number">{stats.logsToday.employees}</span>
            </p>
            <p>
              Visitors: <span className="dashboard-item-number">{stats.logsToday.visitors}</span>
            </p>
          </div>
        </div>

        {Object.entries(stats.sectors).map(([sector, counts]) => (
          <div key={sector} className="dashboard-item">
            <img src="/sector.png" alt={`Sector ${sector}`} />
            <div className="dashboard-item-text">
              <h3>Sector {sector}</h3>
              <p>
                Personnel: <span className="dashboard-item-number">{counts.employees}</span>
              </p>
              <p>
                Visitors: <span className="dashboard-item-number">{counts.visitors}</span>
              </p>
            </div>
          </div>
        ))}

        {/* Add the Undertime box */}
        <div className="dashboard-item undertime-box" onClick={fetchUndertime}>
          <img src="/undertime.png" alt="Undertime" />
          <div className="dashboard-item-text">
            <h3>Undertime</h3>
            <p className="dashboard-undertime">Click to View</p>
          </div>
        </div>
      </div>

      {/* Render the background overlay and the UndertimeModal */}
      {showUndertime && (
        <>
          {/* Background overlay for darken/blur effect */}
          <div className="undertime-modal-overlay"></div>
          <UndertimeModal
            undertimeRecords={undertimeRecords}
            onClose={closeUndertimeModal}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
