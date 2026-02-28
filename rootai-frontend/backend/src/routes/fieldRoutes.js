// ─────────────────────────────────────────────────────
// Field Routes
// ─────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const {
    getAllFields,
    createField,
    getFieldById,
    deleteField,
} = require("../controllers/fieldController");

router.get("/", getAllFields);
router.post("/", createField);
router.get("/:id", getFieldById);
router.delete("/:id", deleteField);

module.exports = router;
