const express = require("express");
const { createCategory, getAllCategories, deleteCategory, editCategory, bulkDeleteCategories } = require("../controllers/categoryControllers");
const authMiddleware = require("../middleware/authMiddleware");
const categoryUpload = require("../middleware/categoryUploadMiddleware");
const router = express.Router();



// Add Category Route
router.post("/add-category", authMiddleware, categoryUpload.single("image"), createCategory);

// Get All Categories Route
router.get("/get-all-categories", authMiddleware, getAllCategories);

// Edit Category Route
router.put("/edit-category/:id", authMiddleware, categoryUpload.single("image"), editCategory);

// Delete Category Route
router.delete("/delete-category/:id", authMiddleware, deleteCategory);

// Bulk Delete Categories Route
router.delete("/bulk-delete-categories", authMiddleware, bulkDeleteCategories);

module.exports = router;