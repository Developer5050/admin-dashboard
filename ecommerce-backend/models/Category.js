const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    slug: {
        type: String,   
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ["active", "inactive"],
        default: "active"
    }
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;