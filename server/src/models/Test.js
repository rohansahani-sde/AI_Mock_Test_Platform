const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      required: true,
    },

    testType: {
      type: String,
      enum: ["MCQ", "DSA", "MCQ_DSA"],
      required: true,
    },

    questionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],

    questionCount: {
      type: Number,
      required: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "CREATED",
        "IN_PROGRESS",
        "SUBMITTED",
        "EXPIRED",
      ],
      default: "CREATED",
    },

    startedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Test", testSchema);