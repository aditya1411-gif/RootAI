// ─────────────────────────────────────────────────────
// RootAI Backend — Main Server
// ─────────────────────────────────────────────────────
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const fieldRoutes = require("./routes/fieldRoutes");
const sensorRoutes = require("./routes/sensorRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ───
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "RootAI Backend is running",
        timestamp: new Date().toISOString(),
    });
});

// ─── API Routes ───
app.use("/api/fields", fieldRoutes);
app.use("/api/sensor-data", sensorRoutes);

// ─── Global Error Handler ───
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);

    if (err.message === "Only CSV files are allowed") {
        return res.status(400).json({ success: false, error: err.message });
    }

    res.status(500).json({
        success: false,
        error: "Internal server error",
    });
});

// ─── Start Server ───
app.listen(PORT, () => {
    console.log(`\n🌱  RootAI Backend running on http://localhost:${PORT}`);
    console.log(`📡  Health check:  http://localhost:${PORT}/api/health`);
    console.log(`📂  API Fields:    http://localhost:${PORT}/api/fields`);
    console.log(`📊  API Sensor:    http://localhost:${PORT}/api/sensor-data\n`);
});
