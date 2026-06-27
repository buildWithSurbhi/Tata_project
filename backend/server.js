const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const violationRoutes = require("./routes/violationRoutes");

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
  res.json({
    message: "Backend Running",
  });
});

// Violation Routes
app.use("/api/violations", violationRoutes);

// Test Route
app.get("/test", async (req, res) => {
  const Violation = require("./models/Violation");

  const data = await Violation.create({
    workerId: "101",
    violationType: "helmet_missing",
    confidence: 0.95,
    severity: "high",
  });

  res.json(data);
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});