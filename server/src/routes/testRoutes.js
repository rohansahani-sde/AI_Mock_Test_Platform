const express = require("express");

const {
    generateTest,
    getTestById,
    startTest,
    runCode,
    submitTest,
    getMyTests,
    getTestResult,
} = require("../controllers/testController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/generate", protect, generateTest);
router.get("/my-tests", protect, getMyTests);
router.get("/:id", protect, getTestById);
router.post("/:id/start", protect, startTest);
router.post("/:id/run-code", protect, runCode);
router.post("/:id/submit", protect, submitTest);
router.get("/:id/result", protect, getTestResult);

module.exports = router;