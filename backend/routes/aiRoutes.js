const express = require("express");

const router = express.Router();

const controller = require("../controllers/aiController");

router.get("/health", controller.health);

router.get("/detect", controller.detect);

module.exports = router;