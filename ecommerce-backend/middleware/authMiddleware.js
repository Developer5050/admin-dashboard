const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    try {
        // Check if JWT secret is available
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Server error: JWT secret missing"
            });
        }

        let token = req.cookies?.token;

        // If not in cookies, check Authorization header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;

            if (authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            } else {
                token = authHeader;
            }
        }

        // No token found
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ensure token contains user id
        if (!decoded.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload"
            });
        }

        // Fetch user data
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists"
            });
        }

        // Add user to request object
        req.user = user;

        next();
        
    } catch (error) {

        // Token related errors
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired"
            });
        }

        // Default fallback
        return res.status(500).json({
            success: false,
            message: "Authentication error",
            error: error.message
        });
    }
};

// Admin Middleware - Must be used after authMiddleware
const adminMiddleware = (req, res, next) => {
    try {
        // Check if user is authenticated (authMiddleware should run first)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Authentication required"
            });
        }

        // Check if user has admin role
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Admin access required"
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Authorization error",
            error: error.message
        });
    }
};

module.exports = { authMiddleware, adminMiddleware };
