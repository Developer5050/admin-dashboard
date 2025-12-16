const jwt = require("jsonwebtoken");

const generateToken = (userId, userEmail, userName, userRole, userImageUrl) => {  
    return jwt.sign({
        id: userId,
        email: userEmail,
        name: userName,
        role: userRole,
        image_url: userImageUrl,
    }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });
};

module.exports = generateToken;