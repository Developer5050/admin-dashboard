const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { addProduct, getAllProducts, editProduct, deleteProduct, getProductById, bulkDeleteProducts } = require("../controllers/productControllers");

// Add Product Route
router.post("/add-product", authMiddleware, upload.array("images", 20), addProduct);

// Get All Products Route
router.get("/get-all-products", authMiddleware, getAllProducts);

// Get Product By ID Route
router.get("/get-product/:id", authMiddleware, getProductById);

// Edit Product Route
router.put("/edit-product/:id", authMiddleware, upload.array("images", 20), editProduct);

// Delete Product Route
router.delete("/delete-product/:id", authMiddleware, deleteProduct);

// Bulk Delete Products Route
router.delete("/bulk-delete", authMiddleware, bulkDeleteProducts);

module.exports = router;    
