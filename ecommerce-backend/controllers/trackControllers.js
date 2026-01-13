const Order = require("../models/Order");
const Billing = require("../models/Billing");

// Track Order By Invoice Number or Billing Email (Combined)
const trackOrder = async (req, res) => {
    try {
        const { invoice_no, email } = req.query;

        // Check if at least one parameter is provided
        if (!invoice_no && !email) {
            return res.status(400).json({
                success: false,
                message: "Either Invoice Number or Billing Email is required",
            });
        }

        // If invoice_no is provided, track by invoice number
        if (invoice_no) {
            const order = await Order.findOne({ invoiceNo: invoice_no.trim() })
                .populate('billing', 'firstName lastName email phone address city country company')
                .populate('orderItems.product', 'name sku salesPrice images description');

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found with this invoice number",
                });
            }

            // Transform order to match frontend format
            const billing = order.billing || {};
            const transformedOrder = {
                id: order._id.toString(),
                invoice_no: order.invoiceNo,
                order_time: order.orderTime ? order.orderTime.toISOString() : order.createdAt.toISOString(),
                total_amount: order.totalAmount,
                shipping_cost: order.shippingCost,
                discount_amount: order.discountAmount,
                payment_method: order.paymentMethod,
                status: order.status,
                notes: order.notes || '',
                created_at: order.createdAt.toISOString(),
                updated_at: order.updatedAt.toISOString(),
                customers: {
                    name: `${billing.firstName || ''} ${billing.lastName || ''}`.trim(),
                    firstName: billing.firstName || '',
                    lastName: billing.lastName || '',
                    email: billing.email || '',
                    phone: billing.phone || '',
                    address: billing.address || '',
                    city: billing.city || '',
                    country: billing.country || '',
                    company: billing.company || ''
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
                message: "Order tracked successfully",
                order: transformedOrder,
            });
        }

        // If email is provided, track by billing email
        if (email) {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email format",
                });
            }

            // Find billing by email
            const billing = await Billing.findOne({ email: email.trim().toLowerCase() });
            
            if (!billing) {
                return res.status(404).json({
                    success: false,
                    message: "No orders found for this email address",
                });
            }

            // Get all orders for this billing
            const orders = await Order.find({ billing: billing._id })
                .populate('billing', 'firstName lastName email phone address city country company')
                .populate('orderItems.product', 'name sku salesPrice images')
                .sort({ orderTime: -1 });

            if (!orders || orders.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No orders found for this email address",
                });
            }

            // Transform orders to match frontend format
            const transformedOrders = orders.map((order) => {
                const billingData = order.billing || {};
                return {
                    id: order._id.toString(),
                    invoice_no: order.invoiceNo,
                    order_time: order.orderTime ? order.orderTime.toISOString() : order.createdAt.toISOString(),
                    total_amount: order.totalAmount,
                    shipping_cost: order.shippingCost,
                    discount_amount: order.discountAmount,
                    payment_method: order.paymentMethod,
                    status: order.status,
                    notes: order.notes || '',
                    created_at: order.createdAt.toISOString(),
                    updated_at: order.updatedAt.toISOString(),
                    customers: {
                        name: `${billingData.firstName || ''} ${billingData.lastName || ''}`.trim(),
                        firstName: billingData.firstName || '',
                        lastName: billingData.lastName || '',
                        email: billingData.email || '',
                        phone: billingData.phone || '',
                        address: billingData.address || '',
                        city: billingData.city || '',
                        country: billingData.country || '',
                        company: billingData.company || ''
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
            });

            return res.status(200).json({
                success: true,
                message: "Orders tracked successfully",
                orders: transformedOrders,
                total_orders: transformedOrders.length
            });
        }
    } catch (error) {
        console.error("Track Order Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

module.exports = {
    trackOrder,
};
