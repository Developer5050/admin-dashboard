const Billing = require("../models/Billing");
const Order = require("../models/Order");
const Product = require("../models/Product");

// Add Billing 
const addBilling = async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            company, 
            phone, 
            email, 
            country, 
            address, 
            city, 
            postcode, 
            shipToDifferentAddress, 
            orderNotes,
            orderItems,
            shippingCost = 0,
            discountAmount = 0,
            paymentMethod = 'cash'
        } = req.body;

        // Create Billing
        const newBilling = await Billing.create({
            firstName,
            lastName,
            company,
            phone,
            email,
            country,
            address,
            city,
            postcode,
            shipToDifferentAddress,
            orderNotes,
        });

        // Create order if orderItems are provided
        let newOrder = null;
        if (orderItems && Array.isArray(orderItems) && orderItems.length > 0) {
            // Validate and process order items
            const processedItems = [];
            let subtotal = 0;

            for (const item of orderItems) {
                const product = await Product.findById(item.productId);
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: `Product with ID ${item.productId} not found`,
                    });
                }

                const itemSubtotal = item.quantity * item.unitPrice;
                subtotal += itemSubtotal;

                processedItems.push({
                    product: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    subtotal: itemSubtotal
                });
            }

            // Calculate total amount
            const totalAmount = subtotal + shippingCost - discountAmount;

            // Create order
            newOrder = await Order.create({
                billing: newBilling._id,
                orderItems: processedItems,
                totalAmount,
                shippingCost,
                discountAmount,
                paymentMethod,
                status: 'pending',
                notes: orderNotes || ''
            });

            // Populate order with product details
            newOrder = await Order.findById(newOrder._id)
                .populate('orderItems.product', 'name sku salesPrice images');
        }

        const response = {
            success: true,
            message: "Billing added successfully",
            billing: newBilling,
        };

        if (newOrder) {
            response.message = "Billing and order created successfully";
            response.order = newOrder;
        }

        return res.status(201).json(response);
    } catch (error) {
        console.error("Add Billing Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Get All Billing
const getAllBilling = async (req, res) => {
    try {
        const billing = await Billing.find();
        return res.status(200).json({
            success: true,
            message: "Billing fetched successfully",
            billing,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Get Billing By ID
const getBillingById = async (req, res) => {
    try {
        const { id } = req.params;
        const billing = await Billing.findById(id);
        return res.status(200).json({
            success: true,
            message: "Billing fetched successfully",
            billing,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Update Billing
const updateBilling = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if billing exists
        const existingBilling = await Billing.findById(id);
        if (!existingBilling) {
            return res.status(404).json({
                success: false,
                message: "Billing not found",
            });
        }

        const { firstName, lastName, company, phone, email, country, address, city, postcode, shipToDifferentAddress, orderNotes } = req.body;

        // Update billing
        const billing = await Billing.findByIdAndUpdate(id,
            {
                firstName,
                lastName,
                company,
                phone,
                email,
                country,
                address,
                city,
                postcode,
                shipToDifferentAddress,
                orderNotes
            },
            { new: true });

        return res.status(200).json({
            success: true,
            message: "Billing updated successfully",
            billing,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Delete Billing
const deleteBilling = async (req, res) => {
    try {
        const { id } = req.params;
        await Billing.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: "Billing deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}
module.exports = {
    addBilling,
    getAllBilling,
    getBillingById,
    updateBilling,
    deleteBilling,
};