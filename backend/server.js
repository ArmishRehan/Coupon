const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const brandsRouter = require("./routes/brands");
const couponRoutes = require("./routes/coupons");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
  res.send("Coupon Generator Backend Running ");
});

app.use("/qrcodes", express.static("public/qrcodes"));



// auth routes
app.use("/api/auth", require("./routes/auth"));

// coupons routes

app.use("/api/coupons", couponRoutes);

// brands routes

app.use("/api/brands", brandsRouter );


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
