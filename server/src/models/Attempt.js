const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    type: {
      type: String,
      enum: ["MCQ", "DSA"],
      required: true,
    },

    // MCQ answer
    selectedOption: {
      type: Number,
      default: null,
    },

    // DSA answer
    code: {
      type: String,
      default: "",
    },

    isCorrect: {
      type: Boolean,
      default: false,
    },

    points: {
      type: Number,
      default: 0,
    },

    executionResult: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },

    answers: {
      type: [answerSchema],
      default: [],
    },

    score: {
      type: Number,
      default: 0,
    },

    totalScore: {
      type: Number,
      default: 0,
    },

    percentage: {
      type: Number,
      default: 0,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Attempt", attemptSchema);