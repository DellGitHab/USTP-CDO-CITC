import React from "react";
import { NavLink } from "react-router-dom";
import DashboardIcon from '@mui/icons-material/Dashboard';
import MonitorIcon from '@mui/icons-material/Monitor';
import BadgeIcon from '@mui/icons-material/Badge';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import ReportIcon from '@mui/icons-material/Report';
import GroupIcon from '@mui/icons-material/Group';
import "../styles/Sidebar.css";

const Sidebar = ({ userRole, handleLogout }) => {
  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon className="sidebar-icon" /> },
    { label: "Monitoring", path: "/monitoring", icon: <MonitorIcon className="sidebar-icon" /> },
    { label: "Visitors", path: "/visitors", icon: <PermIdentityIcon className="sidebar-icon" /> },
    { label: "Personnel", path: "/employee", roles: ["admin"], icon: <BadgeIcon className="sidebar-icon" /> },
    { label: "Report Logs", path: "/report-logs", roles: ["admin"], icon: <ReportIcon className="sidebar-icon" /> },
    { label: "Users", path: "/users", roles: ["admin"], icon: <GroupIcon /> },

  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src="/pnp.png" alt="EzMonitoring Logo" className="logo-image" />
        <h2>EzMonitoring</h2>
      </div>
      <ul className="sidebar-menu">
        {menuItems
          .filter((item) => !item.roles || item.roles.includes(userRole))
          .map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active-link" : ""}`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
      </ul>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
