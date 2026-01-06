const express = require("express");
const router = express.Router();
const { addOrder, getAllOrders, getOrderById, updateOrder, deleteOrder, changeOrderStatus } = require("../controllers/orderControllers");
const validateRequest = require("../validation/validateRequest");
const { addOrderSchema, updateOrderSchema, changeStatusSchema } = require("../validation/orderSchemas");
const authMiddleware = require("../middleware/authMiddleware");

// Add Order Route
router.post("/add-order", authMiddleware, validateRequest(addOrderSchema), addOrder);

// Get All Orders Route
router.get("/get-all-orders", authMiddleware, getAllOrders);

// Get Order By ID Route
router.get("/get-order-by-id/:id", authMiddleware, getOrderById);

// Update Order Route
router.put("/update-order/:id", authMiddleware, validateRequest(updateOrderSchema), updateOrder);

// Delete Order Route
router.delete("/delete-order/:id", authMiddleware, deleteOrder);

// Change Order Status Route
router.patch("/change-status/:id", authMiddleware, validateRequest(changeStatusSchema), changeOrderStatus);

module.exports = router;

