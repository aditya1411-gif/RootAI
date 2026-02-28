// ─────────────────────────────────────────────────────
// Sensor Data Routes
// ─────────────────────────────────────────────────────
const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const {
    uploadCSV,
    addSensorReading,
    getTrends,
    getLatestAnalysis,
} = require("../controllers/sensorController");

// Multer config for CSV uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `csv-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "text/csv" || path.extname(file.originalname).toLowerCase() === ".csv") {
            cb(null, true);
        } else {
            cb(new Error("Only CSV files are allowed"), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

// CSV upload endpoint
router.post("/upload/:fieldId", upload.single("csv"), uploadCSV);

// Manual single reading endpoint
router.post("/:fieldId", addSensorReading);

// Trend data for charts
router.get("/:fieldId/trends", getTrends);

// Latest analysis (score, alerts, recommendations)
router.get("/:fieldId/latest", getLatestAnalysis);

module.exports = router;
