const express = require("express");
const router = express.Router();
const { addOrder, getAllOrders, getOrderById, getOrdersByBillingId, updateOrder, deleteOrder, changeOrderStatus, getOrderStatistics, getSalesStatistics, getWeeklySales, getBestSellers } = require("../controllers/orderControllers");
const validateRequest = require("../validation/validateRequest");
const { addOrderSchema, updateOrderSchema, changeStatusSchema } = require("../validation/orderSchemas");
const { authMiddleware } = require("../middleware/authMiddleware");

// Add Order Route
router.post("/add-order", authMiddleware, validateRequest(addOrderSchema), addOrder);

// Get All Orders Route
router.get("/get-all-orders", authMiddleware, getAllOrders);

// Get Order By ID Route
router.get("/get-order-by-id/:id", authMiddleware, getOrderById);

// Get Orders By Billing ID Route
router.get("/get-orders-by-billing-id/:id", authMiddleware, getOrdersByBillingId);

// Update Order Route
router.put("/update-order/:id", authMiddleware, validateRequest(updateOrderSchema), updateOrder);

// Delete Order Route
router.delete("/delete-order/:id", authMiddleware, deleteOrder);

// Change Order Status Route
router.patch("/change-status/:id", authMiddleware, validateRequest(changeStatusSchema), changeOrderStatus);

// Get Order Statistics Route
router.get("/statistics", authMiddleware, getOrderStatistics);

// Get Sales Statistics Route
router.get("/sales-statistics", authMiddleware, getSalesStatistics);

// Get Weekly Sales Route
router.get("/weekly-sales", authMiddleware, getWeeklySales);

// Get Best Sellers Route
router.get("/best-sellers", authMiddleware, getBestSellers);

module.exports = router;

