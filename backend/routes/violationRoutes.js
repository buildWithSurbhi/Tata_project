const express = require("express");
const router = express.Router();
const Violation = require("../models/Violation");

// Create violation
router.post("/", async (req, res) => {
  try {
    const violation = await Violation.create(req.body);
    res.status(201).json(violation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all violations
router.get("/", async (req, res) => {
  try {
    const violations = await Violation.find()
      .sort({ createdAt: -1 });

    res.json(violations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Stats API
router.get("/stats", async (req, res) => {
  try {
    const totalViolations =
      await Violation.countDocuments();

    const helmet =
      await Violation.countDocuments({
        violationType: "helmet_missing"
      });

    const mask =
      await Violation.countDocuments({
        violationType: "mask_missing"
      });

    const vest =
      await Violation.countDocuments({
        violationType: "vest_missing"
      });

    const fatigue =
      await Violation.countDocuments({
        violationType: "fatigue"
      });

    res.json({
      totalViolations,
      helmet,
      mask,
      vest,
      fatigue
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});
router.get("/recent-alerts", async (req, res) => {
  try {

    const alerts = await Violation.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(alerts);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;