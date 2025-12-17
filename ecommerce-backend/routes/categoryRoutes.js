const express = require("express");
const { createCategory, deleteCategory } = require("../controllers/categoryControllers");
const authMiddleware = require("../middleware/authMiddleware");
const categoryUpload = require("../middleware/categoryUploadMiddleware");
const router = express.Router();

// Add Category Route
router.post("/add-category", authMiddleware, categoryUpload.single("image"), createCategory);

// Delete Category Route
router.delete("/delete-category/:id", authMiddleware, deleteCategory);

module.exports = router;