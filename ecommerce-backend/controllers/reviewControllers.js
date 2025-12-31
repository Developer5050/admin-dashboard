const Review = require("../models/Review");
const Product = require("../models/Product");

// Add review Controller
const addReview = async (req, res) => {
    try {
        const { productId, rating, fullName, email, phone, comment } = req.body;

        // Validate required fields
        if (!productId || !rating || !fullName || !email || !comment) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
            });
        }

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }


        // Validate comment
        if (!comment) {
            return res.status(400).json({
                success: false,
                message: "Comment is required",
            });
        }

        // Validate product
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product is required",
            });
        }

        // Create Review 
        const newReview = await Review.create({
            productId,
            rating,
            comment,
            fullName,
            email,
            phone,
            isApproved: false
        });
        
        return res.status(201).json({
            success: true,
            message: "Review added successfully",
            review: newReview,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Get All Review 
const getAllReview = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });

    }
}

// GET REVIEWS BY PRODUCT (ADMIN - Only unapproved reviews)
const getReviewsByProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const reviews = await Review.find({
            productId: id,
            isApproved: false  // Only show unapproved reviews in admin panel
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            reviews,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// GET APPROVED REVIEWS (USER SIDE)
const getApprovedReviews = async (req, res) => {
    try {
        const { id } = req.params;

        const reviews = await Review.find({
            productId: id,
            isApproved: true
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

const approveReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        // Recalculate rating
        const approvedReviews = await Review.find({
            productId: review.productId,
            isApproved: true
        });

        if (approvedReviews.length > 0) {
            const totalRating = approvedReviews.reduce(
                (sum, r) => sum + r.rating, 0
            );

            const avgRating = totalRating / approvedReviews.length;

            await Product.findByIdAndUpdate(review.productId, {
                averageRating: avgRating.toFixed(1),
                totalReviews: approvedReviews.length
            });
        }

        res.status(200).json({
            success: true,
            message: "Review approved successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};



module.exports = {
    addReview, getAllReview, getReviewsByProduct, getApprovedReviews, approveReview
}