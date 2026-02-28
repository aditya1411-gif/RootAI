// ─────────────────────────────────────────────────────
// Soil Health Scoring Algorithm
// ─────────────────────────────────────────────────────
// Rule-based scoring: each parameter is scored 0–100
// and combined into a weighted average.
// ─────────────────────────────────────────────────────

// Optimal ranges for each parameter
const THRESHOLDS = {
    pH: { min: 5.5, max: 7.5, idealMin: 6.0, idealMax: 7.0, critMin: 4.5, critMax: 8.5 },
    moisture: { min: 20, max: 75, idealMin: 30, idealMax: 60, critMin: 10, critMax: 85 },
    nitrogen: { min: 50, max: 200, idealMin: 80, idealMax: 150, critMin: 30, critMax: 250 },
    phosphorus: { min: 10, max: 50, idealMin: 15, idealMax: 40, critMin: 5, critMax: 60 },
    potassium: { min: 40, max: 200, idealMin: 60, idealMax: 150, critMin: 20, critMax: 250 },
    temperature: { min: 10, max: 35, idealMin: 15, idealMax: 30, critMin: 5, critMax: 40 },
};

// Weights for each parameter in total score
const WEIGHTS = {
    pH: 0.20,
    moisture: 0.20,
    nitrogen: 0.20,
    phosphorus: 0.10,
    potassium: 0.15,
    temperature: 0.15,
};

/**
 * Score a single parameter value (0–100)
 */
function scoreParameter(value, threshold) {
    const { idealMin, idealMax, critMin, critMax } = threshold;

    // Inside ideal range → 100
    if (value >= idealMin && value <= idealMax) return 100;

    // Below ideal but above critical
    if (value < idealMin && value >= critMin) {
        return Math.max(0, ((value - critMin) / (idealMin - critMin)) * 100);
    }

    // Above ideal but below critical
    if (value > idealMax && value <= critMax) {
        return Math.max(0, ((critMax - value) / (critMax - idealMax)) * 100);
    }

    // Outside critical range
    return 0;
}

/**
 * Calculate overall soil health score from a reading
 * @param {Object} reading - { pH, moisture, nitrogen, phosphorus, potassium, temperature }
 * @returns {{ score: number, status: string, details: Object }}
 */
function calculateHealthScore(reading) {
    const details = {};
    let totalScore = 0;

    for (const [param, weight] of Object.entries(WEIGHTS)) {
        const value = reading[param];
        const paramScore = scoreParameter(value, THRESHOLDS[param]);
        details[param] = {
            value,
            score: Math.round(paramScore),
            weight,
        };
        totalScore += paramScore * weight;
    }

    const score = Math.round(totalScore);

    let status;
    if (score >= 75) status = "GOOD";
    else if (score >= 45) status = "MODERATE";
    else status = "CRITICAL";

    return { score, status, details };
}

/**
 * Generate alerts for threshold breaches
 * @param {Object} reading - sensor reading values
 * @returns {Array<Object>} alerts
 */
function generateAlerts(reading) {
    const alerts = [];

    const checks = [
        {
            parameter: "pH",
            value: reading.pH,
            threshold: THRESHOLDS.pH,
            lowFix: "Apply agricultural lime at 2 to 3 tonnes per hectare",
            highFix: "Apply elemental sulfur at 200 to 300 kg per hectare",
        },
        {
            parameter: "moisture",
            value: reading.moisture,
            threshold: THRESHOLDS.moisture,
            lowFix: "Increase irrigation frequency and apply mulch to retain moisture",
            highFix: "Clear all field drainage channels and check for blockages",
        },
        {
            parameter: "nitrogen",
            value: reading.nitrogen,
            threshold: THRESHOLDS.nitrogen,
            lowFix: "Apply urea fertilizer at 100 to 120 kg per hectare",
            highFix: "Reduce nitrogen fertilizer application and plant nitrogen-fixing cover crops",
        },
        {
            parameter: "phosphorus",
            value: reading.phosphorus,
            threshold: THRESHOLDS.phosphorus,
            lowFix: "Apply single super phosphate at 150 to 200 kg per hectare",
            highFix: "Stop phosphorus fertilizer application and grow phosphorus-scavenging crops",
        },
        {
            parameter: "potassium",
            value: reading.potassium,
            threshold: THRESHOLDS.potassium,
            lowFix: "Apply muriate of potash at 60 to 80 kg per hectare",
            highFix: "Reduce potassium fertilizer and ensure proper leaching with irrigation",
        },
        {
            parameter: "temperature",
            value: reading.temperature,
            threshold: THRESHOLDS.temperature,
            lowFix: "Apply dark-colored mulch or plastic covers to warm the soil",
            highFix: "Apply a mulch layer of 5 to 7 cm on the soil surface",
        },
    ];

    for (const check of checks) {
        const { parameter, value, threshold, lowFix, highFix } = check;
        const { min, max, critMin, critMax } = threshold;

        if (value < critMin) {
            alerts.push({
                parameter,
                severity: "CRITICAL",
                value,
                threshold: critMin,
                message: `${parameter} is critically low at ${value}. Safe minimum is ${min}.`,
                fix: lowFix,
                timeline: "Do this within 3 to 5 days",
            });
        } else if (value < min) {
            alerts.push({
                parameter,
                severity: "WARNING",
                value,
                threshold: min,
                message: `${parameter} is below optimal range at ${value}. Minimum recommended is ${min}.`,
                fix: lowFix,
                timeline: "Do this within 1 to 2 weeks",
            });
        } else if (value > critMax) {
            alerts.push({
                parameter,
                severity: "CRITICAL",
                value,
                threshold: critMax,
                message: `${parameter} is critically high at ${value}. Safe maximum is ${max}.`,
                fix: highFix,
                timeline: "Do this within 3 to 5 days",
            });
        } else if (value > max) {
            alerts.push({
                parameter,
                severity: "WARNING",
                value,
                threshold: max,
                message: `${parameter} is above optimal range at ${value}. Maximum recommended is ${max}.`,
                fix: highFix,
                timeline: "Do this within 1 to 2 weeks",
            });
        }
    }

    return alerts;
}

/**
 * Get crop recommendations based on soil health
 * @param {{ score: number, status: string, details: Object }} healthResult
 * @returns {{ plantingStatus: string, reason: string, crops: string[] }}
 */
function getCropRecommendations(healthResult) {
    const { score, status, details } = healthResult;

    // Crop suitability mapping based on soil conditions
    const allCrops = [
        { name: "Wheat", minScore: 50, prefpH: [6.0, 7.5], prefTemp: [10, 25] },
        { name: "Rice", minScore: 40, prefpH: [5.5, 7.0], prefTemp: [20, 35] },
        { name: "Maize", minScore: 55, prefpH: [5.8, 7.0], prefTemp: [18, 30] },
        { name: "Soybean", minScore: 50, prefpH: [6.0, 7.0], prefTemp: [15, 30] },
        { name: "Cotton", minScore: 60, prefpH: [6.0, 8.0], prefTemp: [20, 35] },
        { name: "Sugarcane", minScore: 55, prefpH: [6.0, 7.5], prefTemp: [20, 35] },
        { name: "Potato", minScore: 45, prefpH: [5.0, 6.5], prefTemp: [10, 25] },
        { name: "Tomato", minScore: 55, prefpH: [6.0, 7.0], prefTemp: [15, 30] },
        { name: "Groundnut", minScore: 50, prefpH: [5.5, 7.0], prefTemp: [20, 35] },
        { name: "Millet", minScore: 35, prefpH: [5.5, 7.5], prefTemp: [20, 35] },
    ];

    if (status === "CRITICAL") {
        return {
            plantingStatus: "NOT RECOMMENDED",
            reason: "Soil conditions are critical. Fix the issues before planting.",
            crops: [],
        };
    }

    const pHValue = details.pH?.value;
    const tempValue = details.temperature?.value;

    const suitable = allCrops.filter((crop) => {
        if (score < crop.minScore) return false;
        if (pHValue && (pHValue < crop.prefpH[0] || pHValue > crop.prefpH[1])) return false;
        if (tempValue && (tempValue < crop.prefTemp[0] || tempValue > crop.prefTemp[1])) return false;
        return true;
    });

    if (suitable.length === 0) {
        return {
            plantingStatus: "CONDITIONAL",
            reason: "No ideal crop match found. Improve soil parameters for better suitability.",
            crops: [],
        };
    }

    return {
        plantingStatus: "RECOMMENDED",
        reason: `${suitable.length} crop(s) are suitable for current soil conditions.`,
        crops: suitable.map((c) => c.name),
    };
}

module.exports = {
    THRESHOLDS,
    calculateHealthScore,
    generateAlerts,
    getCropRecommendations,
};
