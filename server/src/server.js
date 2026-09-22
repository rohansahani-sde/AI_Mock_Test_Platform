const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tests", testRoutes);
// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "AI Mock Test API is running",
  });
});

connectDB()

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});