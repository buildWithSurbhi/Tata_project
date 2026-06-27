const express = require("express");

const router = express.Router();

const {
  createViolation,
  getViolations,
  getStats,
  getRecentAlerts,
} = require("../controllers/violationController");

// Create violation
router.post("/", createViolation);

// Get all violations
router.get("/", getViolations);

// Get statistics
router.get("/stats", getStats);

// Get recent alerts
router.get("/recent-alerts", getRecentAlerts);


module.exports = router;