const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    image_url: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;