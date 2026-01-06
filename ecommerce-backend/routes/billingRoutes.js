const express = require("express");
const router = express.Router();
const { addBilling, getAllBilling, getBillingById, updateBilling, deleteBilling } = require("../controllers/billingControllers");
const validateRequest = require("../validation/validateRequest");
const { addBillingSchema } = require("../validation/billingSchemas");
const authMiddleware = require("../middleware/authMiddleware");

// Add Billing Route
router.post("/add-billing", authMiddleware, validateRequest(addBillingSchema), addBilling);

// Get All Billing Route
router.get("/get-all-billing", authMiddleware, getAllBilling);

// Get Billing By ID Route
router.get("/get-billing-by-id/:id", authMiddleware, getBillingById);

// Update Billing Route
router.put("/update-billing/:id", authMiddleware, validateRequest(addBillingSchema), updateBilling);

// Delete Billing Route
router.delete("/delete-billing/:id", authMiddleware, deleteBilling);

module.exports = router;