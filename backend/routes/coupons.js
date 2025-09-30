const express = require("express");
const db = require("../db");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const authenticate = require("../middleware/auth");

const router = express.Router();

//  Helper to format date for MySQL
function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toISOString().slice(0, 19).replace("T", " "); 
}


//helper function

async function expireOldCoupons() {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 19).replace("T", " ");

  try {
    await db.query(
      `UPDATE coupons 
       SET status = 'expired' 
       WHERE valid_to < ? 
         AND status NOT IN ('used', 'expired', 'disabled')`,
      [todayStr]
    );
  } catch (err) {
    console.error("Error expiring old coupons:", err);
  }
}

// Create a new coupon (by Creator, linked to Store User request)

router.post("/", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "creator") {
      return res.status(403).json({ msg: "Only creators can create coupons" });
    }

    const {
      name,
      discount,
      brandId,
      branchId,
      validFrom,
      validTo,
      storeUserId,
      requestId,
    } = req.body;

    const creatorId = req.user.id;

    if (
      !name ||
      !discount ||
      !brandId ||
      !branchId ||
      !validFrom ||
      !validTo ||
      !storeUserId ||
      !requestId
    ) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Generate QR string
    const qrString = Math.random().toString(36).substring(2, 12);
    const qrFolder = path.resolve("public/qrcodes");
    fs.mkdirSync(qrFolder, { recursive: true });
    const qrImagePath = path.join(qrFolder, `${qrString}.png`);

    // Save QR to file
    await QRCode.toFile(qrImagePath, qrString);

    const qrCodeUrl = `/qrcodes/${qrString}.png`;

    // Insert new coupon (status starts at waiting_for_approval)
    await db.query(
      `INSERT INTO coupons 
       (store_user_id, creator_id, brand_id, branch_id, name, discount, valid_from, valid_to, status, qr_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'waiting_for_approval', ?)`,
      [
        storeUserId,
        creatorId,
        brandId,
        branchId,
        name,
        discount,
        validFrom,
        validTo,
        qrCodeUrl,
      ]
    );

    // ✅ DO NOT update coupon_requests here anymore
    // requests stay 'requested' until admin explicitly approves/rejects them

    res.json({
      success: true,
      message: "Coupon created successfully! Waiting for Admin approval.",
      qrCode: qrCodeUrl,
    });
  } catch (err) {
    console.error("Error creating coupon:", err);
    res.status(500).json({ error: "Failed to create coupon" });
  }
});



// Get coupons for logged-in user
router.get("/my", authenticate, async (req, res) => {
  try {
    const [coupons] = await db.query(
      `SELECT c.id, c.name, c.discount, c.valid_from, c.valid_to, c.qr_code, c.status,
              b.name AS brandName, br.name AS branchName
       FROM coupons c
       JOIN branches br ON c.branch_id = br.id
       JOIN brands b ON br.brand_id = b.id
       WHERE c.store_user_id = ?`,
      [req.user.id]   // ✅ store user only sees their coupons
    );

    res.json(coupons);
  } catch (err) {
    console.error("Error fetching coupons:", err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});



//  Redeem coupon (user only)

router.put("/:id/redeem", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "store user") {
      return res.status(403).json({ msg: "Only store users can redeem coupons" });
    }

    const [coupon] = await db.query("SELECT * FROM coupons WHERE id = ?", [req.params.id]);
    if (!coupon[0]) return res.status(404).json({ msg: "Coupon not found" });

    if (coupon[0].status !== "active") {
      return res.status(400).json({ msg: "Coupon is not active" });
    }

    if (new Date(coupon[0].valid_to) < new Date()) {
      return res.status(400).json({ msg: "Coupon expired" });
    }

    await db.query("UPDATE coupons SET status = 'used' WHERE id = ?", [req.params.id]);

    res.json({ success: true, msg: "Coupon redeemed successfully!" });
  } catch (err) {
    console.error("Redeem error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update coupon (Admin only, Save Changes button)

router.put("/:id", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Only admin can update coupons" });
    }

    const { name, discount, validFrom, validTo, status } = req.body;

    let fields = [];
    let values = [];

    if (name) { fields.push("name = ?"); values.push(name); }
    if (discount) { fields.push("discount = ?"); values.push(discount); }
    if (validFrom) { fields.push("valid_from = ?"); values.push(validFrom); }
    if (validTo) { fields.push("valid_to = ?"); values.push(validTo); }
    if (status) { fields.push("status = ?"); values.push(status); }

    if (fields.length === 0) {
      return res.status(400).json({ msg: "No fields to update" });
    }

    values.push(req.params.id);

    await db.query(`UPDATE coupons SET ${fields.join(", ")} WHERE id = ?`, values);

    res.json({ success: true, msg: "Coupon updated" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update coupon" });
  }
});



// set active after approval
// Creator sets coupon active (only if admin has approved)
router.put("/:id/activate", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "creator") {
      return res.status(403).json({ msg: "Only creators can activate coupons" });
    }

    const { id } = req.params;

    // Check if coupon belongs to this creator and is approved
    const [coupon] = await db.query(
      `SELECT * FROM coupons WHERE id = ? AND creator_id = ? AND status = 'approved'`,
      [id, req.user.id]
    );

    if (coupon.length === 0) {
      return res.status(400).json({ msg: "Coupon not found or not approved yet" });
    }

    await db.query(
      `UPDATE coupons SET status = 'active' WHERE id = ?`,
      [id]
    );

    res.json({ msg: "Coupon set to active" });
  } catch (err) {
    console.error("Error activating coupon:", err);
    res.status(500).json({ msg: "Server error" });
  }
});




//  Update only status (optional, not used in EditCoupon anymore)

router.put("/:id/status", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Only admin can update status" });
    }

    const { status } = req.body;
    if (!["approved", "rejected", "disabled"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status for admin" });
    }

    await db.query("UPDATE coupons SET status = ? WHERE id = ?", [status, req.params.id]);

    res.json({ success: true, msg: `Coupon marked as ${status}` });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});



// Submit coupon request (Store User)
router.post("/request", authenticate, async (req, res) => {
  try {
    const storeUserId = req.user.id; // logged in store user
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Coupon name is required" });
    }

    await db.query(
      "INSERT INTO coupon_requests (store_user_id, name) VALUES (?, ?)",
      [storeUserId, name]
    );

    res.status(201).json({ msg: "Request submitted successfully" });
  } catch (err) {
    console.error("Error submitting request:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Creator fetches all coupon requests
router.get("/request/creator", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "creator") {
      return res.status(403).json({ msg: "Only creators can view requests" });
    }
// Show only pending requests
const [requests] = await db.query(
  "SELECT * FROM coupon_requests WHERE status = 'requested'"
);
res.json(requests);

  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});


// Get all coupon requests (Admin only)
router.get("/request/admin", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const [rows] = await db.query(
      `SELECT cr.id, cr.name, cr.status, cr.created_at,
              cr.store_user_id,        -- ✅ include numeric store_user_id
              u.username AS storeUser
       FROM coupon_requests cr
       JOIN users u ON cr.store_user_id = u.id
       ORDER BY cr.created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// all coupons for admin

router.get("/all", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    await expireOldCoupons(); 

    const [rows] = await db.query(
      `SELECT c.id, c.name, c.discount, c.valid_from, c.valid_to, c.qr_code, c.status,
              b.name AS brandName, br.name AS branchName,
              u.username, u.email
       FROM coupons c
       JOIN branches br ON c.branch_id = br.id
       JOIN brands b ON br.brand_id = b.id
       JOIN users su ON c.store_user_id = su.id
       JOIN users u ON c.creator_id = u.id`
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching all coupons:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


// Get all coupons created by this creator
router.get("/creator", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "creator") {
      return res.status(403).json({ msg: "Only creators can view their coupons" });
    }

    await expireOldCoupons(); // ✅ auto-expire before fetching

    const [rows] = await db.query(
      `SELECT c.id, c.name, c.discount, c.valid_from, c.valid_to, c.qr_code, c.status,
              b.name AS brandName, br.name AS branchName
       FROM coupons c
       JOIN branches br ON c.branch_id = br.id
       JOIN brands b ON br.brand_id = b.id
       WHERE c.creator_id = ? 
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching creator coupons:", err);
    res.status(500).json({ msg: "Server error" });
  }
});





module.exports = router;
