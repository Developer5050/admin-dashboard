const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const couponUpload = require("../middleware/couponMiddleware");
const { addCoupon, getAllCoupons, editCoupon, deleteCoupon, bulkDeleteCoupons, validateCoupon } = require("../controllers/couponControllers");

// Add Coupon Route
router.post("/add-coupon", authMiddleware, couponUpload.single("image"), addCoupon);

// Get All Coupons Route
router.get("/get-all-coupons", authMiddleware, getAllCoupons);

// Edit Coupon Route
router.put("/edit-coupon/:id", authMiddleware, couponUpload.single("image"), editCoupon);

// Delete Coupon Route
router.delete("/delete-coupon/:id", authMiddleware, deleteCoupon);

// Bulk Delete Coupons Route
router.delete("/bulk-delete-coupons", authMiddleware, bulkDeleteCoupons);

// Validate Coupon Route (Public - no auth required)
router.get("/validate-coupon", validateCoupon);   

module.exports = router;