// ─────────────────────────────────────────────────────
// Field Controller
// ─────────────────────────────────────────────────────
const prisma = require("../lib/prisma");

// GET /api/fields — List all fields
async function getAllFields(req, res) {
    try {
        const fields = await prisma.field.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { sensorReadings: true },
                },
            },
        });
        res.json({ success: true, data: fields });
    } catch (error) {
        console.error("Error fetching fields:", error);
        res.status(500).json({ success: false, error: "Failed to fetch fields" });
    }
}

// POST /api/fields — Create a new field
async function createField(req, res) {
    try {
        const { name, location } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: "Field name is required" });
        }

        const field = await prisma.field.create({
            data: { name, location },
        });

        res.status(201).json({ success: true, data: field });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({ success: false, error: "Field name already exists" });
        }
        console.error("Error creating field:", error);
        res.status(500).json({ success: false, error: "Failed to create field" });
    }
}

// GET /api/fields/:id — Get single field with latest readings
async function getFieldById(req, res) {
    try {
        const { id } = req.params;

        const field = await prisma.field.findUnique({
            where: { id },
            include: {
                sensorReadings: {
                    orderBy: { recordedAt: "desc" },
                    take: 30, // Last 30 readings for trends
                },
                healthScores: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
                alerts: {
                    orderBy: { createdAt: "desc" },
                    take: 10,
                },
            },
        });

        if (!field) {
            return res.status(404).json({ success: false, error: "Field not found" });
        }

        res.json({ success: true, data: field });
    } catch (error) {
        console.error("Error fetching field:", error);
        res.status(500).json({ success: false, error: "Failed to fetch field" });
    }
}

// DELETE /api/fields/:id — Delete a field and all related data
async function deleteField(req, res) {
    try {
        const { id } = req.params;

        await prisma.field.delete({ where: { id } });

        res.json({ success: true, message: "Field deleted successfully" });
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, error: "Field not found" });
        }
        console.error("Error deleting field:", error);
        res.status(500).json({ success: false, error: "Failed to delete field" });
    }
}

module.exports = {
    getAllFields,
    createField,
    getFieldById,
    deleteField,
};
