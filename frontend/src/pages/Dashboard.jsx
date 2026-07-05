import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
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
  const audioRef = useRef(
  new Audio("/alarm.mp3")
);

  const [stats, setStats] = useState({
    totalViolations: 0,
    helmet: 0,
    mask: 0,
    vest: 0,
    fatigue: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const webcamRef = useRef(null);

const [cameraOn, setCameraOn] = useState(true);
const [violations, setViolations] = useState([]);
const [lastAlertId, setLastAlertId] = useState(null);

const [helmetCount, setHelmetCount] = useState(0);
const [maskCount, setMaskCount] = useState(0);
const [vestCount, setVestCount] = useState(0);
const [fatigueCount, setFatigueCount] = useState(0);
const [totalViolations, setTotalViolations] = useState(0);
  
useEffect(() => {
  fetchStats();
  fetchAlerts();
  fetchViolations();

  const interval = setInterval(() => {
    fetchStats();
    fetchAlerts();
    fetchViolations();
  }, 5000);

  const aiInterval = setInterval(() => {
    sendFrameToAI();
  }, 1000);

  return () => {
    clearInterval(interval);
    clearInterval(aiInterval);
  };
}, []);
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
const sendFrameToAI = async () => {

  if (!cameraOn) return;
  if (!webcamRef.current) return;

  const imageSrc = webcamRef.current.getScreenshot();

  if (!imageSrc) {
    console.log("No frame captured");
    return;
  }

  try {

    const response = await fetch(
      "http://localhost:5001/detect-frame",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image: imageSrc
        })
      }
    );

    if (!response.ok) {
      console.error(
        "Backend Error:",
        response.status
      );
      return;
    }

    const data = await response.json();

    setAiResult(data);
let helmets = 0;
let masks = 0;
let vests = 0;

data.workers?.forEach((worker) => {

  if (!worker.helmet) helmets++;

  if (!worker.mask) masks++;

  if (!worker.vest) vests++;

});

setHelmetCount(helmets);
setMaskCount(masks);
setVestCount(vests);

const fatigueViolations =
  data.fatigue === "HIGH" ? 1 : 0;

setFatigueCount(fatigueViolations);

setTotalViolations(
  helmets +
  masks +
  vests +
  fatigueViolations
);
    console.log("========== AI RESPONSE ==========");
    console.log(data);

    console.log(
      "Workers Count:",
      data.workers?.length || 0
    );

    console.log(
      "FIRST WORKER:",
      data.workers?.[0]
    );

    console.log(
      "Fatigue Status:",
      data.fatigue
    );

  } catch (error) {

    console.error(
      "AI Detection Error:",
      error
    );

  }
};
const startCamera = () => {
  setCameraOn(true);
  toast.success("Camera Started");
};

  const stopCamera = () => {
  setCameraOn(false);
  toast.error("Camera Stopped");
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

  // Send webcam frame to AI every second
  const aiInterval = setInterval(() => {
    sendFrameToAI();
  }, 1000);

  return () => {
    clearInterval(interval);
    clearInterval(aiInterval);
  };

}, [lastAlertId]);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        {/* <h1 style={{ color: "red" }}>
          TEST DASH
        </h1> */}
        <Navbar />

        {/* TOP STATS */}
        <div className="top-stats">
          <div className="cyber-card">
            <div className="card-icon">
              <FaUsers />
            </div>
            <div>
              <p>TOTAL VIOLATIONS</p>
<h2>{totalViolations}</h2>
            </div>
          </div>

          <div className="cyber-card">
            <div className="card-icon yellow">
              <FaShieldAlt />
            </div>
            <div>
              <p>HELMET VIOLATIONS</p>
<h2>{helmetCount}</h2>
            </div>
          </div>

          <div className="cyber-card red">
            <div className="card-icon">
              <FaExclamationTriangle />
            </div>
            <div>
              <p>MASK VIOLATIONS</p>
<h2>{maskCount}</h2>
            </div>
          </div>

          <div className="cyber-card yellow">
            <div className="card-icon">
              <FaBed />
            </div>
            <div>
              <p>FATIGUE VIOLATIONS</p>
<h2>{fatigueCount}</h2>
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

  {cameraOn ? (
    <>
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{
          width: "100%",
          borderRadius: "12px"
        }}
      />
<div
  style={{
    color: aiResult ? "#00ff88" : "#ff4444",
    marginTop: "10px",
    fontWeight: "bold"
  }}
>
  AI Status:
  {aiResult ? " Connected" : " Disconnected"}
</div>

<div
  style={{
    color: "white",
    marginTop: "10px"
  }}
>
  Workers Detected:
  {aiResult?.workers?.length || 0}
</div>

    </>
  ) : (
    <div
      style={{
        height: "500px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontSize: "24px"
      }}
    >
      Camera Off
    </div>
  )}
           <div className="fps-box">
            
                <p>FPS: 60.2</p>
                <p>LATENCY: 42ms</p>
                <p>STREAM: 4K_UHD</p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
       <div className="alert-feed">

  <h2>📢 Real-Time Alert Feed</h2>

  {!aiResult && (
    <div className="alert-item">
      Waiting for AI data...
    </div>
  )}

  {aiResult?.fatigue === "HIGH" && (
    <div className="alert-item critical">
      <h4>😴 FATIGUE ALERT</h4>
      <p>Operator Drowsiness Detected</p>
    </div>
  )}

  {aiResult?.workers?.map((worker) => (
    <div
      key={worker.id}
      className="alert-item critical"
    >
      <h4>⚠ Worker #{worker.id}</h4>

      <p>
        {worker.violations.join(", ")}
      </p>
    </div>
  ))}

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
