require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/DatabaseConfig");


const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const couponRoutes = require("./routes/couponRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const billingRoutes = require("./routes/billingRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

// Database connect
connectDB();

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/orders", orderRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Server configuration error. Please contact support or try again later.",
        error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

// Start
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
