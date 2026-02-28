// ─────────────────────────────────────────────────────
// Sensor Data Controller — CSV Upload & Processing
// ─────────────────────────────────────────────────────
const fs = require("fs");
const csv = require("csv-parser");
const prisma = require("../lib/prisma");
const {
    calculateHealthScore,
    generateAlerts,
    getCropRecommendations,
} = require("../utils/soilHealth");

/**
 * POST /api/upload/:fieldId
 * Upload a CSV file and process soil sensor data for a field
 *
 * Expected CSV columns: date, pH, moisture, nitrogen, phosphorus, potassium, temperature
 */
async function uploadCSV(req, res) {
    try {
        const { fieldId } = req.params;

        // Verify field exists
        const field = await prisma.field.findUnique({ where: { id: fieldId } });
        if (!field) {
            return res.status(404).json({ success: false, error: "Field not found" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: "No CSV file uploaded" });
        }

        const filePath = req.file.path;
        const readings = [];

        // Parse CSV file
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on("data", (row) => {
                    // Normalize column names (case-insensitive, trim spaces)
                    const normalized = {};
                    for (const [key, value] of Object.entries(row)) {
                        normalized[key.trim().toLowerCase()] = value.trim();
                    }

                    const reading = {
                        recordedAt: new Date(normalized.date || normalized.recorded_at || normalized.timestamp),
                        pH: parseFloat(normalized.ph || normalized["p.h"] || normalized["ph_value"] || 0),
                        moisture: parseFloat(normalized.moisture || normalized["moisture_%"] || normalized["moisture_percent"] || 0),
                        nitrogen: parseFloat(normalized.nitrogen || normalized.n || normalized["nitrogen_mg"] || 0),
                        phosphorus: parseFloat(normalized.phosphorus || normalized.p || normalized["phosphorus_mg"] || 0),
                        potassium: parseFloat(normalized.potassium || normalized.k || normalized["potassium_mg"] || 0),
                        temperature: parseFloat(normalized.temperature || normalized.temp || normalized["temp_c"] || 0),
                    };

                    // Skip invalid rows
                    if (!isNaN(reading.recordedAt.getTime()) && !isNaN(reading.pH)) {
                        readings.push(reading);
                    }
                })
                .on("end", resolve)
                .on("error", reject);
        });

        if (readings.length === 0) {
            // Clean up uploaded file
            fs.unlinkSync(filePath);
            return res.status(400).json({
                success: false,
                error: "No valid data rows found in CSV. Expected columns: date, pH, moisture, nitrogen, phosphorus, potassium, temperature",
            });
        }

        // Store readings in database
        const createdReadings = await prisma.sensorReading.createMany({
            data: readings.map((r) => ({
                fieldId,
                recordedAt: r.recordedAt,
                pH: r.pH,
                moisture: r.moisture,
                nitrogen: r.nitrogen,
                phosphorus: r.phosphorus,
                potassium: r.potassium,
                temperature: r.temperature,
            })),
        });

        // Calculate health score from the latest reading
        const latestReading = readings.sort((a, b) => b.recordedAt - a.recordedAt)[0];
        const healthResult = calculateHealthScore(latestReading);

        // Store health score
        const healthScore = await prisma.healthScore.create({
            data: {
                fieldId,
                score: healthResult.score,
                status: healthResult.status,
                details: healthResult.details,
            },
        });

        // Generate and store alerts
        const alertsData = generateAlerts(latestReading);
        if (alertsData.length > 0) {
            await prisma.alert.createMany({
                data: alertsData.map((a) => ({
                    fieldId,
                    parameter: a.parameter,
                    severity: a.severity,
                    value: a.value,
                    threshold: a.threshold,
                    message: a.message,
                    fix: a.fix,
                    timeline: a.timeline,
                })),
            });
        }

        // Generate crop recommendations
        const cropRec = getCropRecommendations(healthResult);
        const recommendation = await prisma.cropRecommendation.create({
            data: {
                healthScoreId: healthScore.id,
                plantingStatus: cropRec.plantingStatus,
                reason: cropRec.reason,
                crops: cropRec.crops,
            },
        });

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.status(201).json({
            success: true,
            data: {
                readingsCount: createdReadings.count,
                healthScore: {
                    score: healthResult.score,
                    status: healthResult.status,
                    details: healthResult.details,
                },
                alerts: alertsData,
                recommendation: cropRec,
            },
        });
    } catch (error) {
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error("Error processing CSV upload:", error);
        res.status(500).json({ success: false, error: "Failed to process CSV upload" });
    }
}

/**
 * POST /api/sensor-data/:fieldId
 * Submit a single sensor reading via JSON body
 */
async function addSensorReading(req, res) {
    try {
        const { fieldId } = req.params;
        const { date, pH, moisture, nitrogen, phosphorus, potassium, temperature } = req.body;

        // Verify field exists
        const field = await prisma.field.findUnique({ where: { id: fieldId } });
        if (!field) {
            return res.status(404).json({ success: false, error: "Field not found" });
        }

        // Store reading
        const reading = await prisma.sensorReading.create({
            data: {
                fieldId,
                recordedAt: new Date(date || Date.now()),
                pH: parseFloat(pH),
                moisture: parseFloat(moisture),
                nitrogen: parseFloat(nitrogen),
                phosphorus: parseFloat(phosphorus),
                potassium: parseFloat(potassium),
                temperature: parseFloat(temperature),
            },
        });

        // Calculate health score
        const healthResult = calculateHealthScore({
            pH: parseFloat(pH),
            moisture: parseFloat(moisture),
            nitrogen: parseFloat(nitrogen),
            phosphorus: parseFloat(phosphorus),
            potassium: parseFloat(potassium),
            temperature: parseFloat(temperature),
        });

        // Store health score
        await prisma.healthScore.create({
            data: {
                fieldId,
                score: healthResult.score,
                status: healthResult.status,
                details: healthResult.details,
            },
        });

        // Generate alerts
        const alertsData = generateAlerts({
            pH: parseFloat(pH),
            moisture: parseFloat(moisture),
            nitrogen: parseFloat(nitrogen),
            phosphorus: parseFloat(phosphorus),
            potassium: parseFloat(potassium),
            temperature: parseFloat(temperature),
        });

        if (alertsData.length > 0) {
            await prisma.alert.createMany({
                data: alertsData.map((a) => ({
                    fieldId,
                    parameter: a.parameter,
                    severity: a.severity,
                    value: a.value,
                    threshold: a.threshold,
                    message: a.message,
                    fix: a.fix,
                    timeline: a.timeline,
                })),
            });
        }

        res.status(201).json({
            success: true,
            data: {
                reading,
                healthScore: healthResult,
                alerts: alertsData,
            },
        });
    } catch (error) {
        console.error("Error adding sensor reading:", error);
        res.status(500).json({ success: false, error: "Failed to add sensor reading" });
    }
}

/**
 * GET /api/sensor-data/:fieldId/trends
 * Get trend data for chart visualization
 */
async function getTrends(req, res) {
    try {
        const { fieldId } = req.params;
        const { limit = 30 } = req.query;

        const readings = await prisma.sensorReading.findMany({
            where: { fieldId },
            orderBy: { recordedAt: "asc" },
            take: parseInt(limit),
            select: {
                recordedAt: true,
                pH: true,
                moisture: true,
                nitrogen: true,
                phosphorus: true,
                potassium: true,
                temperature: true,
            },
        });

        res.json({ success: true, data: readings });
    } catch (error) {
        console.error("Error fetching trends:", error);
        res.status(500).json({ success: false, error: "Failed to fetch trend data" });
    }
}

/**
 * GET /api/sensor-data/:fieldId/latest
 * Get the latest sensor reading and health analysis
 */
async function getLatestAnalysis(req, res) {
    try {
        const { fieldId } = req.params;

        const latestReading = await prisma.sensorReading.findFirst({
            where: { fieldId },
            orderBy: { recordedAt: "desc" },
        });

        if (!latestReading) {
            return res.status(404).json({ success: false, error: "No readings found for this field" });
        }

        const latestHealth = await prisma.healthScore.findFirst({
            where: { fieldId },
            orderBy: { createdAt: "desc" },
        });

        const latestAlerts = await prisma.alert.findMany({
            where: { fieldId },
            orderBy: { createdAt: "desc" },
            take: 10,
        });

        // Get crop recommendation
        const healthResult = latestHealth
            ? { score: latestHealth.score, status: latestHealth.status, details: latestHealth.details }
            : calculateHealthScore(latestReading);

        const cropRec = getCropRecommendations(healthResult);

        res.json({
            success: true,
            data: {
                reading: latestReading,
                healthScore: latestHealth,
                alerts: latestAlerts,
                recommendation: cropRec,
            },
        });
    } catch (error) {
        console.error("Error fetching latest analysis:", error);
        res.status(500).json({ success: false, error: "Failed to fetch latest analysis" });
    }
}

module.exports = {
    uploadCSV,
    addSensorReading,
    getTrends,
    getLatestAnalysis,
};
