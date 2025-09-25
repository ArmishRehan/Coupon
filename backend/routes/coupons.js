const express = require("express");
const db = require("../db");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.post("/", authenticate, async (req, res) => {
    try {
        const { name, discount, brandId, branchId, validFrom, validTo } = req.body;
        const userId = req.user.id;

        if (!name || !discount || !brandId || !branchId || !validFrom || !validTo) {
            return res.status(400).json({ error: "Missing fields" });
        }

        // Generate QR string
        const qrString = Math.random().toString(36).substring(2, 12);

        // QR folder
        const qrFolder = path.resolve("public/qrcodes"); 
        fs.mkdirSync(qrFolder, { recursive: true });  
        const qrImagePath = path.join(qrFolder, `${qrString}.png`);
        await QRCode.toFile(qrImagePath, qrString);   


        //qr url
        const qrCodeUrl = `/qrcodes/${qrString}.png`;

        // database ma coupon insert hoga
        await db.query(
            `INSERT INTO coupons
      (name, discount, brand_id, branch_id, valid_from, valid_to, qr_code, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, discount, brandId, branchId, validFrom, validTo, qrCodeUrl, userId]
        );

        res.json({ success: true, message: "Coupon created successfully!", qrCode: qrCodeUrl });
    } catch (err) {
        console.error("Error creating coupon:", err);
        res.status(500).json({ error: "Failed to create coupon" });
    }
});

// all coupons brand and branch names for specific user
// brand name k acc branch show hogi

router.get("/my", authenticate, async (req, res) => {
  try {
    const [coupons] = await db.query(
      `SELECT c.id, c.name, c.discount, c.valid_from, c.valid_to, c.qr_code, c.status,
       b.name AS brandName, 
       br.name AS branchName
FROM coupons c
JOIN branches br ON c.branch_id = br.id
JOIN brands b ON br.brand_id = b.id
WHERE c.user_id = ?;
`,
      [req.user.id]
    );

    res.json(coupons);
  } catch (err) {
    console.error("Error fetching coupons:", err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});


// routes/coupons.js
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


module.exports = router;
