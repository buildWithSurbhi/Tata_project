import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { saveAs } from "file-saver";

import {
  FaUsers,
  FaShieldAlt,
  FaExclamationTriangle,
  FaBed
} from "react-icons/fa";

function Dashboard() {
  const audioRef = useRef(new Audio("/alarm.mp3"));

  const [stats, setStats] = useState({
    totalViolations: 0,
    helmet: 0,
    mask: 0,
    vest: 0,
    fatigue: 0
  });

  const [alerts, setAlerts] = useState([]);
  const [lastAlertId, setLastAlertId] = useState(null);
  const [violations, setViolations] = useState([]);
  const [cameraOn, setCameraOn] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await API.get("/violations/stats");
      setStats(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await API.get("/violations/recent-alerts");
      setAlerts(response.data);

      const latest = response.data[0];

      if (
        latest &&
        latest._id !== lastAlertId &&
        latest.violationType === "fatigue" &&
        latest.severity === "high"
      ) {
        setLastAlertId(latest._id);
        toast.error("🚨 FATIGUE DETECTED!");
        try {
          audioRef.current.play();
        } catch (err) {
          console.warn("Audio play blocked:", err);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchViolations = async () => {
    try {
      const response = await API.get("/violations");
      setViolations(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const startCamera = async () => {
    try {
      await fetch("http://localhost:5001/camera/start", {
        method: "POST"
      });
      setCameraOn(true);
      toast.success("Camera Started");
    } catch (error) {
      console.log(error);
    }
  };

  const stopCamera = async () => {
    try {
      await fetch("http://localhost:5001/camera/stop", {
        method: "POST"
      });
      setCameraOn(false);
      toast.error("Camera Stopped");
    } catch (error) {
      console.log(error);
    }
  };

  const exportCSV = () => {
    const headers = ["Worker ID", "Violation", "Severity", "Confidence", "Time"];
    const rows = violations.map(v => [
      v.workerId,
      v.violationType,
      v.severity,
      `${(v.confidence * 100).toFixed(0)}%`,
      new Date(v.createdAt).toLocaleString()
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "violations_report.csv");
  };

  useEffect(() => {
    fetchStats();
    fetchAlerts();
    fetchViolations();

    const interval = setInterval(() => {
      fetchStats();
      fetchAlerts();
      fetchViolations();
    }, 5000);

    return () => clearInterval(interval);
  }, [lastAlertId]);

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

          <div className="cyber-card red">
            <div className="card-icon">
              <FaExclamationTriangle />
            </div>
            <div>
              <p>MASK VIOLATIONS</p>
              <h2>{stats.mask}</h2>
            </div>
          </div>

          <div className="cyber-card yellow">
            <div className="card-icon">
              <FaBed />
            </div>
            <div>
              <p>FATIGUE VIOLATIONS</p>
              <h2>{stats.fatigue}</h2>
            </div>
          </div>
        </div>

        {/* MAIN SECTION */}
        <div className="dashboard-grid">
          {/* LEFT */}
          <div className="camera-panel">
            <div className="panel-header">
              <div style={{ marginTop: "10px" }}>
                <div className="camera-controls">
                  <button onClick={startCamera} className="camera-btn start-btn">
                    ▶ Start
                  </button>
                  <button onClick={stopCamera} className="camera-btn stop-btn">
                    ⏹ Stop
                  </button>
                  <span
                    className={
                      cameraOn ? "camera-status online" : "camera-status offline"
                    }
                  >
                    {cameraOn ? "🟢 Camera Online" : "🔴 Camera Offline"}
                  </span>
                </div>
                <h2>📹 Live Edge Feed</h2>
                <div className="camera-tags">
                  <span>CAMERA : NORTH-02</span>
                  <span className="recording">RECORDING</span>
                </div>
              </div>
            </div>
            <div className="camera-container">
              <img src="http://localhost:5001/video_feed" alt="Live AI Feed" />
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
            {alerts.map(alert => (
              <div
                key={alert._id}
                className={`alert-item ${
                  alert.severity === "high" ? "critical" : "warning"
                }`}
              >
                <h4>{alert.severity.toUpperCase()}</h4>
                <p>
                  {alert.violationType
                    .replace("_", " ")
                    .replace(/\b\w/g, c => c.toUpperCase())}
                </p>
              </div>
            ))}
            <button className="export-btn" onClick={exportCSV}>
              Export Session Logs
            </button>
          </div>

          {/* HISTORY PANEL */}
          <div className="history-panel">
            <h2>📋 Violation History</h2>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Violation</th>
                  <th>Severity</th>
                  <th>Confidence</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {violations.map(v => (
                  <tr key={v._id}>
                    <td>{v.workerId}</td>
                    <td>{v.violationType.replaceAll("_", " ")}</td>
                    <td>
                      <span className={`severity ${v.severity}`}>
                        {v.severity}
                      </span>
                    </td>
                    <td>{(v.confidence * 100).toFixed(0)}%</td>
                    <td>{new Date(v.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
