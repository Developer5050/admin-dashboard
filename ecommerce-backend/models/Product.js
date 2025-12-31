const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    averageRating: {
        type: Number,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    costPrice: {
        type: Number,
        required: true
    },
    salesPrice: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    minStockThreshold: {
        type: Number,
        required: true
    },
    slug: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: true,
        enum: ["selling", "out of stock", "draft"],
        default: "draft"
    }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;