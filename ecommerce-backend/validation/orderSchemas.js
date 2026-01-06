const { z } = require("zod");

// Order item validation schema
const orderItemSchema = z.object({
    productId: z
        .string()
        .min(1, "Product ID is required"),
    quantity: z
        .number()
        .int("Quantity must be an integer")
        .min(1, "Quantity must be at least 1"),
    unitPrice: z
        .number()
        .min(0, "Unit price must be non-negative")
});

// Add order validation schema
const addOrderSchema = z.object({
    billingId: z
        .string()
        .min(1, "Billing ID is required")
        .optional(),
    orderItems: z
        .array(orderItemSchema)
        .min(1, "Order must have at least one item"),
    shippingCost: z
        .number()
        .min(0, "Shipping cost must be non-negative")
        .default(0)
        .optional(),
    discountAmount: z
        .number()
        .min(0, "Discount amount must be non-negative")
        .default(0)
        .optional(),
    paymentMethod: z
        .enum(['cash', 'card', 'online', 'bank_transfer'], {
            errorMap: () => ({ message: "Payment method must be one of: cash, card, online, bank_transfer" })
        })
        .default('cash')
        .optional(),
    status: z
        .enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
            errorMap: () => ({ message: "Status must be one of: pending, processing, shipped, delivered, cancelled" })
        })
        .default('pending')
        .optional(),
    notes: z
        .string()
        .max(500, "Notes must be less than 500 characters")
        .trim()
        .optional()
        .default('')
});

// Update order validation schema
const updateOrderSchema = z.object({
    orderItems: z
        .array(orderItemSchema)
        .min(1, "Order must have at least one item")
        .optional(),
    shippingCost: z
        .number()
        .min(0, "Shipping cost must be non-negative")
        .optional(),
    discountAmount: z
        .number()
        .min(0, "Discount amount must be non-negative")
        .optional(),
    paymentMethod: z
        .enum(['cash', 'card', 'online', 'bank_transfer'], {
            errorMap: () => ({ message: "Payment method must be one of: cash, card, online, bank_transfer" })
        })
        .optional(),
    status: z
        .enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
            errorMap: () => ({ message: "Status must be one of: pending, processing, shipped, delivered, cancelled" })
        })
        .optional(),
    notes: z
        .string()
        .max(500, "Notes must be less than 500 characters")
        .trim()
        .optional()
});

// Change status validation schema
const changeStatusSchema = z.object({
    status: z
        .enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
            errorMap: () => ({ message: "Status must be one of: pending, processing, shipped, delivered, cancelled" })
        })
});

module.exports = {
    addOrderSchema,
    updateOrderSchema,
    changeStatusSchema,
};

