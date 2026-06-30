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
  Cell
} from "recharts";
function Analytics() {

  const [stats, setStats] = useState({
    totalViolations: 0,
    helmet: 0,
    fatigue: 0,
    phone: 0
  });
  const [violations, setViolations] = useState([]);

  useEffect(() => {
  fetchStats();
  fetchViolations();
}, []);

  
 
  const fetchStats = async () => {
  try {
    const response =
      await API.get("/violations/stats");

    console.log(response.data);

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

  const chartData = [
    {
      name: "Helmet",
      value: stats.helmet
    },
    {
      name: "Fatigue",
      value: stats.fatigue
    },
    {
      name: "Phone",
      value: stats.phone
    }
  ];
  const pieData = [
  {
    name: "Helmet",
    value: stats.helmet
  },
  {
    name: "Fatigue",
    value: stats.fatigue
  },
  {
    name: "Phone",
    value: stats.phone
  }
];
const COLORS = [
  "#f59e0b",
  "#ef4444",
  "#3b82f6"
];

  return (
    <div style={{ padding: "30px" }}>

      <h1>Violation Analytics</h1>

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
      <div
  style={{
    width: "100%",
    height: "350px",
    marginTop: "40px",
    background: "#13263a",
    borderRadius: "10px",
    padding: "20px"
  }}
>

  <h2>Violation Distribution</h2>

  <ResponsiveContainer>

    <PieChart>

      <Pie
        data={pieData}
        cx="50%"
        cy="50%"
        outerRadius={100}
        dataKey="value"
      >

        {pieData.map((entry, index) => (
          <Cell
            key={index}
            fill={COLORS[index % COLORS.length]}
          />
        ))}

      </Pie>

      <Tooltip />

    </PieChart>

  </ResponsiveContainer>

</div>

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
    <h3>Fatigue Alerts</h3>
    <h2>{stats.fatigue}</h2>
  </div>

        <div className="stat-card">
    <h3>Phone Usage</h3>
    <h2>{stats.phone}</h2>
  </div>

      </div>
      <ViolationTable
  violations={violations}
  onDelete={deleteViolation}
/>
    </div>
  );
}

export default Analytics;