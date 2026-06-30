import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaUsers,
  FaShieldAlt,
  FaExclamationTriangle,
  FaBed
} from "react-icons/fa";

function Dashboard() {
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
              <p>ACTIVE OPERATORS</p>
              <h2>14</h2>
            </div>
          </div>

          <div className="cyber-card">
            <div className="card-icon yellow">
              <FaShieldAlt />
            </div>

            <div>
              <p>PPE COMPLIANCE RATE</p>
              <h2>94.2%</h2>
            </div>
          </div>

          <div className="cyber-card">
            <div className="card-icon red">
              <FaExclamationTriangle />
            </div>

            <div>
              <p>ACTIVE VIOLATIONS</p>
              <h2>2</h2>
            </div>
          </div>

          <div className="cyber-card">
            <div className="card-icon yellow">
              <FaBed />
            </div>

            <div>
              <p>FATIGUE ALERTS TODAY</p>
              <h2>5</h2>
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
                src="https://images.unsplash.com/photo-1517048676732-d65bc937f952"
                alt=""
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
            <div className="alert-item critical">
              <h4>CRITICAL</h4>
              <p>No Safety Vest Detected</p>
            </div>
            <div className="alert-item warning">
              <h4>WARNING</h4>
              <p>Forklift Proximity Alert</p>
            </div>
            <div className="alert-item warning">
              <h4>WARNING</h4>
              <p>Loose Chin Strap</p>
            </div>
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