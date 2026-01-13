const express = require("express");
const router = express.Router();
const { trackOrder } = require("../controllers/trackControllers");

// Track Order By Invoice Number or Billing Email (Combined Route)
// Usage: GET /api/track?invoice_no=INV-20240101-12345 OR GET /api/track?email=xxx@example.com
router.get("/", trackOrder);

module.exports = router;
