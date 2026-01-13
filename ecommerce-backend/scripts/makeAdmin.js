/**
 * Script to make a user admin by email
 * Usage: node scripts/makeAdmin.js <email>
 */

const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");

async function makeAdmin(email) {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce");
        console.log("Connected to database");

        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            console.error(`User with email ${email} not found`);
            process.exit(1);
        }

        // Update user role to admin
        user.role = "admin";
        await user.save();

        console.log(`✅ Successfully updated ${email} to admin role`);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
    console.error("Please provide an email address");
    console.log("Usage: node scripts/makeAdmin.js <email>");
    process.exit(1);
}

makeAdmin(email);
