const express = require("express");
const { createCategory, getAllCategories, deleteCategory } = require("../controllers/categoryControllers");
const authMiddleware = require("../middleware/authMiddleware");
const categoryUpload = require("../middleware/categoryUploadMiddleware");
const router = express.Router();

// Get All Categories Route
router.get("/get-all-categories", authMiddleware, getAllCategories);

// Add Category Route
router.post("/add-category", authMiddleware, categoryUpload.single("image"), createCategory);

// Delete Category Route
router.delete("/delete-category/:id", authMiddleware, deleteCategory);

module.exports = router;