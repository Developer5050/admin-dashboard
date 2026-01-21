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
        .min(0, "Unit price must be non-negative"),
    images: z
        .array(z.string())
        .optional()
        .default([])
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
        .preprocess(
            (val) => {
                // Handle empty string, null, or undefined - return undefined so default applies
                if (!val || val === '' || val === null) {
                    return undefined;
                }
                // Normalize string to lowercase and replace spaces/special chars
                if (typeof val === 'string') {
                    const normalized = val.toLowerCase().trim();
                    // Map common variations to expected values
                    const mapping = {
                        'card': 'credit_card',
                        'credit card': 'credit_card',
                        'creditcard': 'credit_card',
                        'credit-card': 'credit_card', // Normalize hyphen to underscore
                        'debit card': 'credit_card',
                        'debit': 'credit_card',
                        'cc': 'credit_card',
                        'jazzcash': 'jazzcash',
                        'jazz cash': 'jazzcash',
                        'easypaisa': 'easypaisa',
                        'easy paisa': 'easypaisa',
                        'easy-paisa': 'easypaisa',
                        'cod': 'cod',
                        'cash on delivery': 'cod',
                        'cash-on-delivery': 'cod',
                    };
                    return mapping[normalized] || normalized;
                }
                return val;
            },
            z
                .enum(['credit_card', 'jazzcash', 'easypaisa', 'cod'], {
                    errorMap: () => ({ message: "Payment method must be one of: credit_card, jazzcash, easypaisa, cod" })
                })
                .optional()
                .default('cod')
        ),
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
        .preprocess(
            (val) => {
                // Handle empty string, null, or undefined
                if (!val || val === '' || val === null) {
                    return undefined;
                }
                // Normalize string to lowercase and replace spaces/special chars
                if (typeof val === 'string') {
                    const normalized = val.toLowerCase().trim();
                    // Map common variations to expected values
                    const mapping = {
                        'card': 'credit_card',
                        'credit card': 'credit_card',
                        'creditcard': 'credit_card',
                        'credit-card': 'credit_card', // Normalize hyphen to underscore
                        'debit card': 'credit_card',
                        'debit': 'credit_card',
                        'cc': 'credit_card',
                        'jazzcash': 'jazzcash',
                        'jazz cash': 'jazzcash',
                        'easypaisa': 'easypaisa',
                        'easy paisa': 'easypaisa',
                        'easy-paisa': 'easypaisa',
                        'cod': 'cod',
                        'cash on delivery': 'cod',
                        'cash-on-delivery': 'cod',
                    };
                    return mapping[normalized] || normalized;
                }
                return val;
            },
            z
                .enum(['credit_card', 'jazzcash', 'easypaisa', 'cod'], {
                    errorMap: () => ({ message: "Payment method must be one of: credit_card, jazzcash, easypaisa, cod" })
                })
                .optional()
        ),
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

