import { useState, useEffect } from "react";
import API from "../services/api";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaUsers,
  FaShieldAlt,
  FaExclamationTriangle,
  FaBed
} from "react-icons/fa";

function Dashboard() {
  const [stats, setStats] = useState({
  totalViolations: 0,
  helmet: 0,
  mask: 0,
  vest: 0
});
const fetchStats = async () => {
  try {
    const response =
      await API.get("/violations/stats");

    setStats(response.data);

  } catch (error) {
    console.log(error);
  }
};

const fetchAlerts = async () => {
  try {

    const response =
      await API.get("/violations/recent-alerts");

    setAlerts(response.data);

  } catch (error) {
    console.log(error);
  }
};

const [alerts, setAlerts] = useState([]);
useEffect(() => {

  fetchStats();
  fetchAlerts();

  const interval = setInterval(() => {

    fetchStats();
    fetchAlerts();

  }, 5000);

  return () => clearInterval(interval);

}, []);
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        {/* TOP STATS */}
<div className="top-stats">

  <div className="cyber-card">
    <div className="card-icon">
      <FaUsers />
    </div>

    <div>
      <p>TOTAL VIOLATIONS</p>
      <h2>{stats.totalViolations}</h2>
    </div>
  </div>

  <div className="cyber-card">
    <div className="card-icon yellow">
      <FaShieldAlt />
    </div>

    <div>
      <p>HELMET VIOLATIONS</p>
      <h2>{stats.helmet}</h2>
    </div>
  </div>

  <div className="cyber-card">
    <div className="card-icon red">
      <FaExclamationTriangle />
    </div>

    <div>
      <p>MASK VIOLATIONS</p>
      <h2>{stats.mask}</h2>
    </div>
  </div>

  <div className="cyber-card">
    <div className="card-icon yellow">
      <FaBed />
    </div>

    <div>
      <p>VEST VIOLATIONS</p>
      <h2>{stats.vest}</h2>
    </div>
  </div>

</div>

        {/* MAIN SECTION */}

        <div className="dashboard-grid">
          {/* LEFT */}
          <div className="camera-panel">
            <div className="panel-header">
              <h2>📹 Live Edge Feed</h2>
              <div className="camera-tags">
                <span>CAMERA : NORTH-02</span>
                <span className="recording">
                  RECORDING
                </span>
              </div>
            </div>
            <div className="camera-container">
              <img
  src="http://localhost:5001/video_feed"
  alt="Live AI Feed"
/>
              <div className="fps-box">

                <p>FPS: 60.2</p>
                <p>LATENCY: 42ms</p>
                <p>STREAM: 4K_UHD</p>

              </div>
            </div>
          </div>
          {/* RIGHT */}
          <div className="alert-feed">
            <div className="alert-header">
              <h2>📢 Real-Time Alert Feed</h2>
            </div>
            {alerts.map((alert) => (

  <div
    key={alert._id}
    className={`alert-item ${
  alert.severity === "high"
    ? "critical"
    : "warning"
}`}
  >

    <h4>
      {alert.severity.toUpperCase()}
    </h4>

   <p>
  {alert.violationType
    .replace("_", " ")
    .replace(/\b\w/g, c => c.toUpperCase())
  }
</p>

  </div>

))}
            <button className="export-btn">
              Export Session Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;