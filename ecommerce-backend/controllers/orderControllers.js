const Order = require("../models/Order");
const Billing = require("../models/Billing");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// Add Order
const addOrder = async (req, res) => {
    try {
        const { billingId, orderItems, shippingCost = 0, discountAmount = 0, paymentMethod = 'cod', status = 'pending', notes = '' } = req.body;

        // Validate billing exists
        if (!billingId) {
            return res.status(400).json({
                success: false,
                message: "Billing ID is required",
            });
        }

        const billing = await Billing.findById(billingId);
        if (!billing) {
            return res.status(404).json({
                success: false,
                message: "Billing not found",
            });
        }

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
                subtotal: itemSubtotal,
                images: item.images && item.images.length > 0 ? item.images : (product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []))
            });
        }

        // Calculate total amount
        const totalAmount = subtotal + shippingCost - discountAmount;

        // Create order
        const newOrder = await Order.create({
            billing: billingId,
            orderItems: processedItems,
            totalAmount,
            shippingCost,
            discountAmount,
            paymentMethod,
            status,
            notes: notes.trim()
        });

        // Populate order with billing and product details
        const populatedOrder = await Order.findById(newOrder._id)
            .populate('billing')
            .populate('orderItems.product', 'name sku salesPrice images');

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: populatedOrder,
        });
    } catch (error) {
        console.error("Add Order Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Get All Orders
const getAllOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            method,
            startDate,
            endDate,
        } = req.query;

        // Build filter object
        const filter = {};

        // Filter by status
        if (status && status.trim()) {
            filter.status = status.trim();
        }

        // Filter by payment method
        if (method && method.trim()) {
            // Normalize 'credit-card' to 'credit_card' for database query
            let normalizedMethod = method.trim();
            if (normalizedMethod === 'credit-card') {
                normalizedMethod = 'credit_card';
            }
            filter.paymentMethod = normalizedMethod;
        }

        // Filter by date range
        if (startDate || endDate) {
            filter.orderTime = {};
            if (startDate) {
                filter.orderTime.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // Include entire end date
                filter.orderTime.$lte = end;
            }
        }

        // Search by invoice number or customer name/email
        if (search && search.trim()) {
            const searchTerm = search.trim();
            const billingIds = await Billing.find({
                $or: [
                    { firstName: { $regex: searchTerm, $options: "i" } },
                    { lastName: { $regex: searchTerm, $options: "i" } },
                    { email: { $regex: searchTerm, $options: "i" } },
                    // Search for full name (firstName + lastName combined)
                    {
                        $expr: {
                            $regexMatch: {
                                input: { $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }] },
                                regex: searchTerm,
                                options: "i"
                            }
                        }
                    }
                ]
            }).select('_id');

            filter.$or = [
                { invoiceNo: { $regex: searchTerm, $options: "i" } },
                { billing: { $in: billingIds.map(b => b._id) } }
            ];
        }

        // Calculate pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, parseInt(limit) || 10);
        const skip = (pageNum - 1) * limitNum;

        // Execute query with filters, sort, and pagination
        const orders = await Order.find(filter)
            .populate('billing', 'firstName lastName email phone address city country')
            .populate('orderItems.product', 'name sku salesPrice images')
            .sort({ orderTime: -1 })
            .skip(skip)
            .limit(limitNum);

        // Get total count for pagination
        const totalItems = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalItems / limitNum);

        // Transform orders to match frontend format
        const transformedOrders = orders.map((order) => {
            const billing = order.billing || {};
            return {
                id: order._id.toString(),
                invoice_no: order.invoiceNo,
                masked_order_id: order.maskedOrderId,
                order_time: order.orderTime ? order.orderTime.toISOString() : order.createdAt.toISOString(),
                total_amount: order.totalAmount,
                shipping_cost: order.shippingCost,
                payment_method: order.paymentMethod,
                status: order.status,
                created_at: order.createdAt.toISOString(),
                updated_at: order.updatedAt.toISOString(),
                customers: billing ? {
                    name: `${billing.firstName || ''} ${billing.lastName || ''}`.trim(),
                    firstName: billing.firstName || '',
                    lastName: billing.lastName || '',
                    email: billing.email || '',
                    phone: billing.phone || '',
                    address: billing.address || ''
                } : null,
            };
        });

        return res.status(200).json({
            success: true,
            data: transformedOrders,
            pagination: {
                limit: limitNum,
                current: pageNum,
                items: totalItems,
                pages: totalPages,
                next: pageNum < totalPages ? pageNum + 1 : null,
                prev: pageNum > 1 ? pageNum - 1 : null,
            },
        });
    } catch (error) {
        console.error("Get All Orders Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Get Order By ID
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required",
            });
        }

        const order = await Order.findById(id)
            .populate('billing')
            .populate('orderItems.product', 'name sku salesPrice images description');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Transform order to match frontend format
        const billing = order.billing || {};
        const transformedOrder = {
            id: order._id.toString(),
            invoice_no: order.invoiceNo,
            masked_order_id: order.maskedOrderId,
            order_time: order.orderTime ? order.orderTime.toISOString() : order.createdAt.toISOString(),
            total_amount: order.totalAmount,
            shipping_cost: order.shippingCost,
            payment_method: order.paymentMethod,
            status: order.status,
            customers: {
                name: `${billing.firstName || ''} ${billing.lastName || ''}`.trim(),
                firstName: billing.firstName || '',
                lastName: billing.lastName || '',
                email: billing.email || '',
                phone: billing.phone || '',
                address: billing.address || ''
            },
            order_items: order.orderItems.map(item => ({
                quantity: item.quantity,
                unit_price: item.unitPrice,
                subtotal: item.subtotal,
                products: {
                    name: item.product?.name || 'Unknown Product',
                    sku: item.product?.sku || '',
                    salesPrice: item.product?.salesPrice || 0,
                    images: item.images && item.images.length > 0 ? item.images : (item.product?.images || [])
                }
            })),
            coupons: order.discountAmount > 0 ? {
                discount_type: 'fixed',
                discount_value: order.discountAmount
            } : null
        };

        return res.status(200).json({
            success: true,
            order: transformedOrder,
        });
    } catch (error) {
        console.error("Get Order By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Update Order
const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if order exists
        const existingOrder = await Order.findById(id);
        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const { orderItems, shippingCost, discountAmount, paymentMethod, status, notes } = req.body;

        const updateData = {};

        // Update order items if provided
        if (orderItems && Array.isArray(orderItems) && orderItems.length > 0) {
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
                    subtotal: itemSubtotal,
                    images: item.images && item.images.length > 0 ? item.images : (product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []))
                });
            }

            updateData.orderItems = processedItems;
            // Recalculate total amount
            const finalShippingCost = shippingCost !== undefined ? shippingCost : existingOrder.shippingCost;
            const finalDiscountAmount = discountAmount !== undefined ? discountAmount : existingOrder.discountAmount;
            updateData.totalAmount = subtotal + finalShippingCost - finalDiscountAmount;
        }

        // Update other fields if provided
        if (shippingCost !== undefined) {
            updateData.shippingCost = shippingCost;
            // Recalculate total if orderItems weren't updated
            if (!updateData.orderItems) {
                const currentSubtotal = existingOrder.orderItems.reduce((sum, item) => sum + item.subtotal, 0);
                const finalDiscountAmount = discountAmount !== undefined ? discountAmount : existingOrder.discountAmount;
                updateData.totalAmount = currentSubtotal + shippingCost - finalDiscountAmount;
            }
        }

        if (discountAmount !== undefined) {
            updateData.discountAmount = discountAmount;
            // Recalculate total if orderItems weren't updated
            if (!updateData.orderItems && !updateData.totalAmount) {
                const currentSubtotal = existingOrder.orderItems.reduce((sum, item) => sum + item.subtotal, 0);
                const finalShippingCost = shippingCost !== undefined ? shippingCost : existingOrder.shippingCost;
                updateData.totalAmount = currentSubtotal + finalShippingCost - discountAmount;
            } else if (updateData.totalAmount) {
                // Adjust total if it was already calculated
                const currentSubtotal = updateData.orderItems 
                    ? updateData.orderItems.reduce((sum, item) => sum + item.subtotal, 0)
                    : existingOrder.orderItems.reduce((sum, item) => sum + item.subtotal, 0);
                const finalShippingCost = shippingCost !== undefined ? shippingCost : existingOrder.shippingCost;
                updateData.totalAmount = currentSubtotal + finalShippingCost - discountAmount;
            }
        }

        if (paymentMethod !== undefined) {
            // Normalize 'credit-card' to 'credit_card' for consistency
            let normalizedMethod = paymentMethod;
            if (typeof paymentMethod === 'string' && paymentMethod.toLowerCase().trim() === 'credit-card') {
                normalizedMethod = 'credit_card';
            }
            updateData.paymentMethod = normalizedMethod;
        }

        if (status !== undefined) {
            updateData.status = status;
        }

        if (notes !== undefined) {
            updateData.notes = notes.trim();
        }

        // Update order
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('billing')
            .populate('orderItems.product', 'name sku salesPrice images');

        return res.status(200).json({
            success: true,
            message: "Order updated successfully",
            order: updatedOrder,
        });
    } catch (error) {
        console.error("Update Order Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Delete Order
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const existingOrder = await Order.findById(id);
        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        await Order.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Order deleted successfully",
        });
    } catch (error) {
        console.error("Delete Order Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Change Order Status
const changeOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const existingOrder = await Order.findById(id);
        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        )
            .populate('billing')
            .populate('orderItems.product', 'name sku salesPrice images');

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order: updatedOrder,
        });
    } catch (error) {
        console.error("Change Order Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Get Orders By Billing ID
const getOrdersByBillingId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Billing ID is required",
            });
        }

        // Check if billing exists
        const billing = await Billing.findById(id);
        if (!billing) {
            return res.status(404).json({
                success: false,
                message: "Billing not found",
            });
        }

        // Get all orders for this billing
        const orders = await Order.find({ billing: id })
            .populate('billing', 'firstName lastName email phone address city country company')
            .populate('orderItems.product', 'name sku salesPrice images')
            .sort({ orderTime: -1 });

        // Transform orders to match frontend format
        const transformedOrders = orders.map((order) => {
            const billingData = order.billing || {};
            return {
                id: order._id.toString(),
                invoice_no: order.invoiceNo,
                masked_order_id: order.maskedOrderId,
                order_time: order.orderTime ? order.orderTime.toISOString() : order.createdAt.toISOString(),
                total_amount: order.totalAmount,
                shipping_cost: order.shippingCost,
                payment_method: order.paymentMethod,
                status: order.status,
                customers: billingData ? {
                    name: `${billingData.firstName || ''} ${billingData.lastName || ''}`.trim(),
                    firstName: billingData.firstName || '',
                    lastName: billingData.lastName || '',
                    company: billingData.company || '',
                    address: billingData.address || '',
                    phone: billingData.phone || ''
                } : null,
                order_items: order.orderItems.map(item => ({
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    subtotal: item.subtotal,
                    products: {
                        name: item.product?.name || 'Unknown Product',
                        sku: item.product?.sku || '',
                        salesPrice: item.product?.salesPrice || 0,
                        images: item.images && item.images.length > 0 ? item.images : (item.product?.images || [])
                    }
                }))
            };
        });

        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            orders: transformedOrders,
        });
    } catch (error) {
        console.error("Get Orders By Billing ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Get Order Statistics
const getOrderStatistics = async (req, res) => {
    try {
        // Get total count of all orders
        const totalOrders = await Order.countDocuments();

        // Get counts by status
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const processingOrders = await Order.countDocuments({ status: 'processing' });
        const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

        return res.status(200).json({
            success: true,
            data: {
                total: totalOrders,
                pending: pendingOrders,
                processing: processingOrders,
                delivered: deliveredOrders,
            },
        });
    } catch (error) {
        console.error("Get Order Statistics Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Get Sales Statistics
const getSalesStatistics = async (req, res) => {
    try {
        const now = new Date();
        
        // Today: Start of today to end of today
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        
        // Yesterday: Start of yesterday to end of yesterday
        const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
        
        // This Month: Start of current month to end of current month
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        
        // Last Month: Start of previous month to end of previous month
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        // Helper function to calculate total sales for a date range
        const calculateSales = async (startDate, endDate) => {
            const result = await Order.aggregate([
                {
                    $match: {
                        orderTime: {
                            $gte: startDate,
                            $lte: endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalAmount" }
                    }
                }
            ]);
            return result.length > 0 ? result[0].total : 0;
        };

        // Calculate sales for each period
        const [today, yesterday, thisMonth, lastMonth, allTime] = await Promise.all([
            calculateSales(startOfToday, endOfToday),
            calculateSales(startOfYesterday, endOfYesterday),
            calculateSales(startOfThisMonth, endOfThisMonth),
            calculateSales(startOfLastMonth, endOfLastMonth),
            // All-time sales
            Order.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalAmount" }
                    }
                }
            ]).then(result => result.length > 0 ? result[0].total : 0)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                today: today || 0,
                yesterday: yesterday || 0,
                thisMonth: thisMonth || 0,
                lastMonth: lastMonth || 0,
                allTime: allTime || 0,
            },
        });
    } catch (error) {
        console.error("Get Sales Statistics Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Get Weekly Sales (past 7 days)
const getWeeklySales = async (req, res) => {
    try {
        const now = new Date();
        
        // Calculate start date (6 days ago at start of day)
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        
        // Calculate end date (today at end of day)
        const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        // Aggregate orders by day
        const dailyData = await Order.aggregate([
            {
                $match: {
                    orderTime: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$orderTime"
                        }
                    },
                    sales: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            {
                $sort: { _id: -1 } // Sort descending (most recent first) to match frontend labels
            }
        ]);

        // Create a map of existing data
        const dataMap = {};
        dailyData.forEach(item => {
            dataMap[item._id] = {
                sales: item.sales || 0,
                orders: item.orders || 0
            };
        });

        // Generate array for all 7 days (most recent first)
        const result = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            
            result.push({
                date: dateStr,
                sales: dataMap[dateStr]?.sales || 0,
                orders: dataMap[dateStr]?.orders || 0
            });
        }

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Get Weekly Sales Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Get Best Sellers (top 4 products by quantity sold)
const getBestSellers = async (req, res) => {
    try {
        // Aggregate order items to find top products by quantity sold
        const bestSellers = await Order.aggregate([
            // Unwind orderItems array to work with individual items
            {
                $unwind: "$orderItems"
            },
            // Group by product ID and sum quantities
            {
                $group: {
                    _id: "$orderItems.product",
                    totalQuantity: { $sum: "$orderItems.quantity" }
                }
            },
            // Lookup product details to get product name
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            // Unwind product details
            {
                $unwind: {
                    path: "$productDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            // Project only needed fields
            {
                $project: {
                    _id: 0,
                    productId: "$_id",
                    name: "$productDetails.name",
                    quantity: "$totalQuantity"
                }
            },
            // Filter out products with no name (deleted products)
            {
                $match: {
                    name: { $exists: true, $ne: null }
                }
            },
            // Sort by quantity descending
            {
                $sort: { quantity: -1 }
            },
            // Limit to top 4
            {
                $limit: 4
            }
        ]);

        // Format response
        const result = bestSellers.map(item => ({
            name: item.name || "Unknown Product",
            quantity: item.quantity || 0
        }));

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Get Best Sellers Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Get My Orders (ONLY logged-in user's orders)
const getMyOrders = async (req, res) => {
    try {
        const userEmail = req.user?.email?.toLowerCase();

        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user",
            });
        }

        const orders = await Order.find()
            .populate({
                path: "billing",
                match: { email: userEmail }, // ✅ ONLY logged user email
                select: "firstName lastName email phone address city country company"
            })
            .populate("orderItems.product", "name sku salesPrice images")
            .sort({ orderTime: -1 });

        // ❗ remove orders whose billing didn't match
        const userOrders = orders.filter(order => order.billing);

        if (userOrders.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No orders found",
                orders: [],
            });
        }

        const transformedOrders = userOrders.map(order => ({
            id: order._id.toString(),
            invoice_no: order.invoiceNo,
            masked_order_id: order.maskedOrderId,
            order_time: order.orderTime
                ? order.orderTime.toISOString()
                : order.createdAt.toISOString(),
            total_amount: order.totalAmount,
            shipping_cost: order.shippingCost,
            payment_method: order.paymentMethod,
            status: order.status,
            created_at: order.createdAt.toISOString(),
            updated_at: order.updatedAt.toISOString(),
            customer: {
                name: `${order.billing.firstName} ${order.billing.lastName}`,
                firstName: order.billing.firstName,
                lastName: order.billing.lastName,
                email: order.billing.email,
                phone: order.billing.phone,
                address: order.billing.address,
                company: order.billing.company
            },
            order_items: order.orderItems.map(item => ({
                quantity: item.quantity,
                unit_price: item.unitPrice,
                subtotal: item.subtotal,
                product: {
                    name: item.product?.name || "Unknown Product",
                    sku: item.product?.sku || "",
                    salesPrice: item.product?.salesPrice || 0,
                    images: item.product?.images || []
                }
            }))
        }));

        return res.status(200).json({
            success: true,
            message: "My orders fetched successfully",
            orders: transformedOrders,
        });

    } catch (error) {
        console.error("Get My Orders Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


module.exports = {
    addOrder,
    getAllOrders,
    getOrderById,
    getOrdersByBillingId,
    updateOrder,
    deleteOrder,
    changeOrderStatus,
    getOrderStatistics,
    getSalesStatistics,
    getWeeklySales,
    getBestSellers,
    getMyOrders,
};

