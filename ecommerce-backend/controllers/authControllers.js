const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");


// Signup Controller 
const signup = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        };

        // Hash Password
        if (!password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm password are required",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        // Validate role if provided
        if (role && !["admin", "user"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be either 'admin' or 'user'",
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const confirmPasswordHash = await bcrypt.hash(confirmPassword, 10);

        // Create User (role defaults to "user" if not provided)
        // For admin dashboard, role should be explicitly set to "admin"
        const userRole = role === "admin" ? "admin" : "user";
        const newUser = await User.create({
            name,
            email,
            password: hashPassword,
            confirmPassword: confirmPasswordHash,
            role: userRole,    
        });
        
        // Generate Token
        const token = generateToken(newUser._id, newUser.email, newUser.name, newUser.role, newUser.image_url);


        // Set Cookie 
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: "strict",
            path: "/",
        });

        // Return Response
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
            token,
        });


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Login Controller
const login = async (req, res) =>{
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }
        
        // Check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Invalid password",
            });
        }
        
        // Get login type from request (default to "user")
        const { loginType } = req.body;
        
        // Set role based on login type
        // If logging in from admin dashboard, ensure role is admin (only if user is already admin)
        // If logging in from user side, ensure role is user (only if user is not already admin)
        if (loginType === "admin") {
            // Only allow admin login if user is already an admin
            if (user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Admin privileges required.",
                });
            }
            // Ensure role is saved as admin (already checked above, but ensure it's saved)
            if (user.role !== "admin") {
                user.role = "admin";
                await user.save();
            }
        } else {
            // User-side login: ensure role is user (only if user doesn't already have admin role)
            // Don't change admin users to user role if they login from user side
            if (!user.role) {
                user.role = "user";
                await user.save();
            } else if (user.role === "admin") {
                // If user is admin but logging in from user side, keep admin role
                // Admin users can login from anywhere
            } else if (user.role !== "user") {
                // If role exists but is not "user" or "admin", set to "user"
                user.role = "user";
                await user.save();
            }
        }
        
        // Generate Token
        const token = generateToken(user._id, user.email, user.name, user.role, user.image_url);

        // Set Cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: "strict",
            path: "/",
        });
        
        // Return Response
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get Current User Controller
const getMe = async (req, res) =>{
    try {
        const user = req.user;
        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image_url: user.image_url || null,
                role: user.role || null,
                phone: user.phone || null,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Update Profile Controller
const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, phone, role } = req.body;

        // Get current user to check for old image
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Build update object with only provided fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone || null;
        
        // Allow role update only if current user is admin
        if (role !== undefined && req.user.role === "admin") {
            if (!["admin", "user"].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: "Role must be either 'admin' or 'user'",
                });
            }
            updateData.role = role;
        }

        // Handle image upload - if file is uploaded, save it and get URL
        if (req.file) {
            // Delete old image if it exists and is a file path (not base64)
            if (currentUser.image_url && !currentUser.image_url.startsWith('data:')) {
                const oldImagePath = path.join(__dirname, "..", currentUser.image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            // Save file path instead of base64
            updateData.image_url = `/uploads/profiles/${req.file.filename}`;
        } else if (req.body.image_url !== undefined) {
            // If image_url is provided in body (for clearing or updating URL directly)
            // Only update if it's not a base64 string (to prevent storing base64)
            if (req.body.image_url && !req.body.image_url.startsWith('data:')) {
                updateData.image_url = req.body.image_url;
            } else if (req.body.image_url === null || req.body.image_url === '') {
                // Delete old image if clearing
                if (currentUser.image_url && !currentUser.image_url.startsWith('data:')) {
                    const oldImagePath = path.join(__dirname, "..", currentUser.image_url);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                updateData.image_url = null;
            }
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password -confirmPassword");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                image_url: updatedUser.image_url || null,
                role: updatedUser.role || null,
                phone: updatedUser.phone || null,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Logout Controller
const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 0,
            sameSite: "strict",
            path: "/",
        })
        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};


module.exports  = {signup , login,  getMe, logout, updateProfile};   

