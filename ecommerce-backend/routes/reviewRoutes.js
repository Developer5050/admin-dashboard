const express = require("express");
const router = express.Router();
const { addReview, getAllReview, getApprovedReviews, getReviewsByProduct, approveReview } = require("../controllers/reviewControllers");
const authMiddleware = require("../middleware/authMiddleware");


// Add review Route
router.post("/add-review", authMiddleware, addReview);

// Get All Reviews
router.get("/get-all-reviews", authMiddleware, getAllReview);

// Get Reviews By Product (Admin - all reviews)
router.get("/product/:id", authMiddleware, getReviewsByProduct);

// Get Approved Reviews (User Side - public route)
router.get("/get-reviews/:id", getApprovedReviews);

// Approve Review Route
router.put("/approve/:id", authMiddleware, approveReview);

module.exports = router;