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

// Billing validation schema
const addBillingSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .trim(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .trim(),
  company: z
    .string()
    .max(100, "Company name must be less than 100 characters")
    .trim()
    .optional(),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .max(20, "Phone number must be less than 20 characters")
    .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email must be less than 100 characters")
    .toLowerCase()
    .trim(),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country must be less than 100 characters")
    .trim(),
  address: z
    .string()
    .min(1, "Address is required")
    .max(200, "Address must be less than 200 characters")
    .trim(),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must be less than 100 characters")
    .trim(),
  postcode: z
    .string()
    .min(1, "Postcode is required")
    .max(20, "Postcode must be less than 20 characters")
    .trim(),
  shipToDifferentAddress: z
    .boolean()
    .optional()
    .default(false),
  orderNotes: z
    .string()
    .max(500, "Order notes must be less than 500 characters")
    .trim()
    .optional(),
  // Order-related fields (optional - order will be created if orderItems are provided)
  orderItems: z
    .array(orderItemSchema)
    .optional(),
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
});

module.exports = {
  addBillingSchema,
};

