const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      },
      fullName: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      phone: String,
      comment: {
        type: String,
        required: true
      },
      isApproved: {
        type: Boolean,
        default: false
      },
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;