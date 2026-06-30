import { useState, useEffect } from "react";
import API from "../services/api";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function LiveStream() {
  const [alerts, setAlerts] = useState([]);
  const fetchAlerts = async () => {

  try {

    const response =
      await API.get("/violations/recent-alerts");

    setAlerts(response.data);

  } catch (error) {

    console.log(error);

  }

};
useEffect(() => {
  fetchAlerts();
  const interval = setInterval(() => {
    fetchAlerts();
  }, 5000);
  return () => clearInterval(interval);

}, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div style={{ padding: "20px" }}>
          <h1>Live Monitoring</h1>
          <div
            style={{
              background: "#13263a",
              padding: "20px",
              borderRadius: "10px"
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1567789884554-0b844b597180"
              alt="Live Feed"
              style={{
                width: "100%",
                borderRadius: "10px"
              }}
            />
          </div>

          <div
            style={{
              marginTop: "20px",
              background: "#13263a",
              padding: "20px",
              borderRadius: "10px"
            }}
          >
            <h2>System Status</h2>

<div
  style={{
    display: "flex",
    gap: "20px",
    marginTop: "20px"
  }}
>
  <div className="stat-card">
    <h3>Camera</h3>
    <p>🟢 Online</p>
  </div>

  <div className="stat-card">
    <h3>AI Detection</h3>
    <p>🟢 Active</p>
  </div>

  <div className="stat-card">
    <h3>Backend</h3>
    <p>🟢 Connected</p>
  </div>
</div>
          </div>

        </div>

      </div>
      <div
  style={{
    marginTop: "20px",
    background: "#13263a",
    padding: "20px",
    borderRadius: "10px"
  }}
>
  <h2>Recent Detections</h2>

  {
  alerts.map((alert) => (

    <div
      key={alert._id}
      className="alert-card"
    >

      <strong>
        {
  alert.violationType
    .replace("_", " ")
    .replace(/\b\w/g, c => c.toUpperCase())
}
      </strong>

      <p>
        Severity:
        {" "}
        {alert.severity}
      </p>

    </div>

  ))
}
</div>

    </div>
  );
}

export default LiveStream;