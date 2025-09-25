
const express = require("express");
const db = require("../db");
const router = express.Router();

// Getting all brands
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name FROM brands");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch brands" });
  }
});

// Get branches for a brand
router.get("/:brandId/branches", async (req, res) => {
  try {
    const brandId = req.params.brandId;
    const [rows] = await db.query(
      "SELECT id, name FROM branches WHERE brand_id = ?",
      [brandId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch branches" });
  }
});

module.exports = router;

