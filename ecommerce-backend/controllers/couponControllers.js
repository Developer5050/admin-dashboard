const Coupon = require("../models/Coupon");
const slugify = require("slugify");

// Add Coupon
const addCoupon = async (req, res) => {
    try {
        const normalizedBody = {};

        for (const key in req.body) {
            normalizedBody[key.trim()] = req.body[key];
        }

        const {
            name,
            code,
            startDate,
            endDate,
            isPercentageDiscount,
            discountValue
        } = normalizedBody;

        // Required fields validation
        if (!name || !code || !startDate || !endDate || isPercentageDiscount === undefined || discountValue === undefined) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Image validation
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Coupon image is required",
            });
        }

        const couponImage = `/uploads/coupons/${req.file.filename}`;
        const couponCode = slugify(code.trim(), {
            lower: true,
            strict: true,
        });

        // Check existing coupon
        const existingCoupon = await Coupon.findOne({ code: couponCode });
        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: "Coupon with this code already exists",
            });
        }

        const isPercentage =
            String(isPercentageDiscount).trim().toLowerCase() === "true";


        const newCoupon = await Coupon.create({
            name,
            code: couponCode,
            image: couponImage,
            startDate,
            endDate,
            isPercentageDiscount: isPercentage,
            discountValue: Number(discountValue),
        });

        return res.status(201).json({
            success: true,
            message: "Coupon created successfully",
            coupon: newCoupon,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get all coupons
const getAllCoupons = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search || "";

        const skip = (page - 1) * limit;

        // Build filter to search both name and code
        const filter = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { code: { $regex: search, $options: "i" } }
                ]
            }
            : {};

        const coupons = await Coupon.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCoupons = await Coupon.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: coupons,
            pagination: {
                total: totalCoupons,
                page,
                limit,
                totalPages: Math.ceil(totalCoupons / limit),
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Edit Coupon
const editCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found",
            });
        }

        const {
            name,
            code,
            startDate,
            endDate,
            isPercentageDiscount,
            discountValue
        } = req.body;

        if (code) {
            coupon.code = slugify(code, { lower: true, strict: true });
        }

        if (req.file) {
            coupon.image = `/uploads/coupons/${req.file.filename}`;
        }

        if (isPercentageDiscount !== undefined) {
            coupon.isPercentageDiscount =
                String(isPercentageDiscount).trim().toLowerCase() === "true";
        }

        coupon.name = name ?? coupon.name;
        coupon.startDate = startDate ?? coupon.startDate;
        coupon.endDate = endDate ?? coupon.endDate;
        coupon.discountValue = discountValue ?? coupon.discountValue;

        await coupon.save();

        return res.status(200).json({
            success: true,
            message: "Coupon updated successfully",
            data: coupon,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete Coupon
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Bulk Delete Coupons
const bulkDeleteCoupons = async (req, res) => {
    try {
        const { ids } = req.body; // array of coupon IDs

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Coupon IDs are required",
            });
        }

        await Coupon.deleteMany({ _id: { $in: ids } });

        return res.status(200).json({
            success: true,
            message: "Coupons deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Validate Coupon
const validateCoupon = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Coupon code is required",
            });
        }

        // Normalize coupon code (same as in addCoupon)
        const couponCode = slugify(code.trim(), {
            lower: true,
            strict: true,
        });

        // Find coupon by code
        const coupon = await Coupon.findOne({ code: couponCode });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Invalid coupon code",
            });
        }

        // Check if coupon is within valid date range
        const currentDate = new Date();
        const startDate = new Date(coupon.startDate);
        const endDate = new Date(coupon.endDate);

        if (currentDate < startDate) {
            return res.status(400).json({
                success: false,
                message: "Coupon is not yet active",
            });
        }

        if (currentDate > endDate) {
            return res.status(400).json({
                success: false,
                message: "Coupon has expired",
            });
        }

        // Return valid coupon details
        return res.status(200).json({
            success: true,
            message: "Coupon is valid",
            data: {
                _id: coupon._id,
                name: coupon.name,
                code: coupon.code,
                isPercentageDiscount: coupon.isPercentageDiscount,
                discountValue: coupon.discountValue,
                startDate: coupon.startDate,
                endDate: coupon.endDate,
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




module.exports = { addCoupon, getAllCoupons, editCoupon, deleteCoupon, bulkDeleteCoupons, validateCoupon };
