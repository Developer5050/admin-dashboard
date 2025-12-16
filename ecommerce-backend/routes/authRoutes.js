const express = require("express");
const router = express.Router();
const { signup, login, getMe, logout, updateProfile } = require("../controllers/authControllers");
const authMiddleware = require("../middleware/authMiddleware");  
const validateRequest = require("../validation/validateRequest.js");
const { signupSchema, loginSchema } = require("../validation/authSchemas.js");

// Routes
router.post("/signup", validateRequest(signupSchema), signup);
router.post("/login", validateRequest(loginSchema), login);
router.get("/me", authMiddleware, getMe);
router.put("/profile", authMiddleware, updateProfile);
router.post("/logout", logout);

module.exports = router;
