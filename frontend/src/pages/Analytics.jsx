import { useEffect, useState } from "react";
import API from "../services/api";
import ViolationTable from "../components/ViolationTable";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

function Analytics() {

  const [stats, setStats] = useState({
    totalViolations: 0,
    helmet: 0,
    mask: 0,
    vest: 0
  });

  const [violations, setViolations] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {

    fetchStats();
    fetchViolations();

    const interval = setInterval(() => {

      fetchStats();
      fetchViolations();

    }, 5000);

    return () => clearInterval(interval);

  }, []);

  const fetchStats = async () => {
    try {

      const response =
        await API.get("/violations/stats");

      setStats(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  const fetchViolations = async () => {
    try {

      const response =
        await API.get("/violations");

      setViolations(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  const deleteViolation = async (id) => {
    try {

      await API.delete(`/violations/${id}`);

      fetchViolations();
      fetchStats();

    } catch (error) {
      console.log(error);
    }
  };

  const exportCSV = () => {

    const headers = [
      "Worker ID",
      "Violation Type",
      "Severity",
      "Confidence",
      "Created At"
    ];

    const rows = violations.map((item) => [
      item.workerId,
      item.violationType,
      item.severity,
      item.confidence,
      item.createdAt
    ]);

    const csvContent = [
      headers,
      ...rows
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(
      [csvContent],
      { type: "text/csv" }
    );

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "violations-report.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  };

  const chartData = [
    {
      name: "Helmet",
      value: stats.helmet
    },
    {
      name: "Mask",
      value: stats.mask
    },
    {
      name: "Vest",
      value: stats.vest
    }
  ];

  const pieData = [
    {
      name: "Helmet",
      value: stats.helmet
    },
    {
      name: "Mask",
      value: stats.mask
    },
    {
      name: "Vest",
      value: stats.vest
    }
  ];

  const COLORS = [
    "#ff4d4d",
    "#ffc400",
    "#00c853"
  ];

  const filteredViolations =
    violations.filter((item) =>
      item.workerId
        .toString()
        .includes(search)
    );

  return (
    <div style={{ padding: "30px" }}>

      <h1>Violation Analytics</h1>

      {/* SEARCH */}

      <input
        type="text"
        placeholder="Search Worker ID"
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        style={{
          width: "300px",
          padding: "12px",
          marginTop: "20px",
          borderRadius: "8px",
          border: "1px solid #2d4963",
          background: "#13263a",
          color: "white"
        }}
      />

      {/* EXPORT BUTTON */}

      <button
        onClick={exportCSV}
        style={{
          marginLeft: "15px",
          padding: "12px 20px",
          background: "#ffc400",
          color: "black",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Export CSV
      </button>

      {/* BAR CHART */}

      <div
        style={{
          width: "100%",
          height: "400px",
          marginTop: "30px"
        }}
      >
        <ResponsiveContainer>

          <BarChart data={chartData}>

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="value" />

          </BarChart>

        </ResponsiveContainer>
      </div>

      {/* PIE CHART */}

      <div
        style={{
          width: "100%",
          height: "400px",
          marginTop: "40px"
        }}
      >
        <h2>PPE Violation Distribution</h2>

        <ResponsiveContainer>

          <PieChart>

            <Pie
              data={pieData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label
            >

              {pieData.map((entry, index) => (

                <Cell
                  key={index}
                  fill={
                    COLORS[index % COLORS.length]
                  }
                />

              ))}

            </Pie>

            <Tooltip />

            <Legend />

          </PieChart>

        </ResponsiveContainer>
      </div>

      {/* STAT CARDS */}

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "30px"
        }}
      >

        <div className="stat-card">
          <h3>Total Violations</h3>
          <h2>{stats.totalViolations}</h2>
        </div>

        <div className="stat-card">
          <h3>Helmet Missing</h3>
          <h2>{stats.helmet}</h2>
        </div>

        <div className="stat-card">
          <h3>Mask Missing</h3>
          <h2>{stats.mask}</h2>
        </div>

        <div className="stat-card">
          <h3>Vest Missing</h3>
          <h2>{stats.vest}</h2>
        </div>

      </div>

      {/* TABLE */}

      <ViolationTable
        violations={filteredViolations}
        onDelete={deleteViolation}
      />

    </div>
  );
}

export default Analytics;