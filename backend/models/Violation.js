const mongoose = require("mongoose");

const violationSchema = new mongoose.Schema(
  {
    workerId: {
      type: String,
      required: true,
    },

    violationType: {
      type: String,
      required: true,
    },

    confidence: {
      type: Number,
      default: 0,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Violation", violationSchema);