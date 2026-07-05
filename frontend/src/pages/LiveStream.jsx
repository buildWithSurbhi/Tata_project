import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import API from "../services/api";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function LiveStream() {
  const [alerts, setAlerts] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const webcamRef = useRef(null);

  const fetchAlerts = async () => {
    try {
      const response = await API.get("/violations/recent-alerts");
      setAlerts(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const sendFrameToAI = async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const response = await fetch("https://edge-ai-operator-safety-system-3.onrender.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: imageSrc })
      });

      const data = await response.json();
      setAiResult(data);
      console.log("AI RESPONSE:", data);   // <-- Added console log here
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => {
      fetchAlerts();
    }, 5000);

    const aiInterval = setInterval(() => {
      sendFrameToAI();
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(aiInterval);
    };
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
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              style={{
                width: "100%",
                borderRadius: "10px"
              }}
            />
          </div>

          {/* AI Detection Panel */}
          {aiResult && (
            <div
              style={{
                marginTop: "20px",
                background: "#0d1b2a",
                padding: "15px",
                borderRadius: "10px",
                color: "white"
              }}
            >
              <h2>🤖 Live AI Analysis</h2>

              {aiResult.workers?.length > 0 ? (
                aiResult.workers.map((worker) => (
                  <div
                    key={worker.id}
                    style={{
                      marginTop: "15px",
                      padding: "10px",
                      border: "1px solid #333",
                      borderRadius: "8px"
                    }}
                  >
                    <h3>👷 Worker #{worker.id}</h3>
                    <p>
                      {worker.helmet
                        ? "🟢 Helmet Detected"
                        : "🔴 Helmet Missing"}
                    </p>
                    <p>
                      {worker.mask
                        ? "🟢 Mask Detected"
                        : "🔴 Mask Missing"}
                    </p>
                    <p>
                      {worker.vest
                        ? "🟢 Safety Vest Detected"
                        : "🔴 Safety Vest Missing"}
                    </p>
                  </div>
                ))
              ) : (
                <p>⚠ No Worker Detected</p>
              )}

              <h3 style={{ marginTop: "15px" }}>
                😴 Fatigue Status :{" "}
                {aiResult.fatigue === "HIGH" ? "🔴 HIGH" : "🟢 NORMAL"}
              </h3>
            </div>
          )}

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
        {alerts.map((alert) => (
          <div key={alert._id} className="alert-card">
            <strong>
              {alert.violationType
                .replace("_", " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </strong>
            <p>Severity: {alert.severity}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LiveStream;
