const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["MCQ", "DSA"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
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

    topics: {
      type: [String],
      default: [],
    },

    // MCQ-specific
    options: {
      type: [String],
      default: [],
    },

    correctAnswer: {
      type: Number,
      default: null,
    },

    explanation: {
      type: String,
      default: "",
    },

    // DSA-specific
    constraints: {
      type: [String],
      default: [],
    },

    examples: {
      type: [
        {
          input: String,
          output: String,
          explanation: String,
        },
      ],
      default: [],
    },

    testCases: {
      type: [
        {
          input: String,
          expectedOutput: String,
          isHidden: {
            type: Boolean,
            default: false,
          },
        },
      ],
      default: [],
    },

    starterCode: {
      javascript: {
        type: String,
        default: "",
      },

      python: {
        type: String,
        default: "",
      },

      java: {
        type: String,
        default: "",
      },
    },

    // AI information
    generatedByAI: {
      type: Boolean,
      default: true,
    },

    aiModel: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Question", questionSchema);