const Violation = require("../models/Violation");

// Create violation
const createViolation = async (req, res) => {
  try {
    const violation = await Violation.create(req.body);

    res.status(201).json(violation);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all violations
const getViolations = async (req, res) => {
  try {
    const violations = await Violation.find().sort({
      createdAt: -1,
    });

    res.status(200).json(violations);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get statistics
const getStats = async (req, res) => {
  try {
    const totalViolations = await Violation.countDocuments();

    const helmet = await Violation.countDocuments({
      violationType: "helmet_missing",
    });

    const fatigue = await Violation.countDocuments({
      violationType: "fatigue",
    });

    const phone = await Violation.countDocuments({
      violationType: "phone_usage",
    });

    res.json({
      totalViolations,
      helmet,
      fatigue,
      phone,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get recent alerts
const getRecentAlerts = async (req, res) => {
  try {
    const alerts = await Violation.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



module.exports = {
  createViolation,
  getViolations,
  getStats,
  getRecentAlerts,
};