const express = require("express");
const db = require("../db");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const authenticate = require("../middleware/auth");

const router = express.Router();

// 📌 Helper to format date for MySQL
function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toISOString().slice(0, 19).replace("T", " "); // "YYYY-MM-DD HH:MM:SS"
}

// 📌 Create a new coupon
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, discount, brandId, branchId, validFrom, validTo } = req.body;
    const userId = req.user.id;

    if (!name || !discount || !brandId || !branchId || !validFrom || !validTo) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Generate QR string & file
    const qrString = Math.random().toString(36).substring(2, 12);
    const qrFolder = path.resolve("public/qrcodes");
    fs.mkdirSync(qrFolder, { recursive: true });
    const qrImagePath = path.join(qrFolder, `${qrString}.png`);
    await QRCode.toFile(qrImagePath, qrString);

    const qrCodeUrl = `/qrcodes/${qrString}.png`;

    await db.query(
      `INSERT INTO coupons 
       (name, discount, brand_id, branch_id, valid_from, valid_to, qr_code, user_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [name, discount, brandId, branchId, validFrom, validTo, qrCodeUrl, userId]
    );

    res.json({ success: true, message: "Coupon created successfully!", qrCode: qrCodeUrl });
  } catch (err) {
    console.error("Error creating coupon:", err);
    res.status(500).json({ error: "Failed to create coupon" });
  }
});

// 📌 Get coupons for logged-in user
router.get("/my", authenticate, async (req, res) => {
  try {
    const [coupons] = await db.query(
      `SELECT c.id, c.name, c.discount, c.valid_from, c.valid_to, c.qr_code, c.status,
              b.name AS brandName, br.name AS branchName
       FROM coupons c
       JOIN branches br ON c.branch_id = br.id
       JOIN brands b ON br.brand_id = b.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    res.json(coupons);
  } catch (err) {
    console.error("Error fetching coupons:", err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

// 📌 Get all coupons (Admin only)
router.get("/all", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const [rows] = await db.query(
      `SELECT c.id, c.name, c.discount, c.valid_from, c.valid_to, c.qr_code, c.status,
              b.name AS brandName, br.name AS branchName,
              u.username, u.email
       FROM coupons c
       JOIN branches br ON c.branch_id = br.id
       JOIN brands b ON br.brand_id = b.id
       JOIN users u ON c.user_id = u.id`
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching all coupons:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 📌 Redeem coupon (user only)
router.put("/:id/redeem", authenticate, async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE coupons 
       SET status = 'used' 
       WHERE id = ? AND user_id = ? AND status = 'pending'`,
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ msg: "Coupon not found or already used" });
    }

    res.json({ success: true, msg: "Coupon redeemed successfully!" });
  } catch (err) {
    console.error("Error redeeming coupon:", err);
    res.status(500).json({ error: "Failed to redeem coupon" });
  }
});

// 📌 Update coupon (Admin only, Save Changes button)
// Update coupon (Admin only)
router.put("/:id", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const { id } = req.params;
    let { name, discount, valid_from, valid_to, status } = req.body;

    // ✅ Format only if provided
    valid_from = valid_from ? formatDate(valid_from) : null;
    valid_to = valid_to ? formatDate(valid_to) : null;

    // ✅ Get existing coupon first
    const [existing] = await db.query("SELECT * FROM coupons WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ msg: "Coupon not found" });
    }

    const current = existing[0];

    // ✅ Use provided values OR fallback to current ones
    const updatedName = name ?? current.name;
    const updatedDiscount = discount ?? current.discount;
    const updatedValidFrom = valid_from ?? current.valid_from;
    const updatedValidTo = valid_to ?? current.valid_to;
    const updatedStatus = status ?? current.status;

    // ✅ Run update
    await db.query(
      `UPDATE coupons 
       SET name = ?, discount = ?, valid_from = ?, valid_to = ?, status = ? 
       WHERE id = ?`,
      [updatedName, updatedDiscount, updatedValidFrom, updatedValidTo, updatedStatus, id]
    );

    res.json({ msg: "Coupon updated successfully" });
  } catch (err) {
    console.error("Update error:", err.sqlMessage || err.message);
    res.status(500).json({ msg: "Server error", error: err.sqlMessage || err.message });
  }
});


// 📌 Get single coupon (Admin only)
router.get("/:id", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT c.id, c.name, c.discount, c.valid_from, c.valid_to, c.qr_code, c.status,
              b.name AS brandName, br.name AS branchName,
              u.username
       FROM coupons c
       JOIN branches br ON c.branch_id = br.id
       JOIN brands b ON br.brand_id = b.id
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ msg: "Coupon not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching coupon:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 📌 Update only status (optional, not used in EditCoupon anymore)
router.patch("/:id/status", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const couponId = req.params.id;

    const [result] = await db.query(
      "UPDATE coupons SET status = ? WHERE id = ?",
      [status, couponId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Coupon not found" });
    }

    res.json({ msg: "Status updated successfully", id: couponId, status });
  } catch (err) {
    console.error("Error updating coupon status:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
