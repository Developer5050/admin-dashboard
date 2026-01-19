const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    images: {
        type: [String],
        default: []
    }
}, { _id: true });

const orderSchema = new mongoose.Schema({
    billing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Billing',
        required: true
    },
    orderItems: {
        type: [orderItemSchema],
        required: true,
        validate: {
            validator: function(items) {
                return items && items.length > 0;
            },
            message: 'Order must have at least one item'
        }
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    shippingCost: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['credit_card', 'stripe', 'paypal'],
        default: 'credit_card'
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    invoiceNo: {
        type: String,
        required: false,
        unique: true
    },
    maskedOrderId: {
        type: String,
        required: false,
        unique: true
    },
    orderTime: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Helper function to generate random alphanumeric string
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Generate invoice number and masked order ID before saving
orderSchema.pre('save', async function() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const OrderModel = this.constructor;
    
    // Generate invoice number if not exists
    if (!this.invoiceNo) {
        // Generate invoice number: INV-YYYYMMDD-XXXXX (5 random digits)
        let random = Math.floor(10000 + Math.random() * 90000);
        this.invoiceNo = `INV-${year}${month}${day}-${random}`;
        
        // Ensure uniqueness
        let isUnique = false;
        while (!isUnique) {
            const existing = await OrderModel.findOne({ invoiceNo: this.invoiceNo });
            if (!existing) {
                isUnique = true;
            } else {
                random = Math.floor(10000 + Math.random() * 90000);
                this.invoiceNo = `INV-${year}${month}${day}-${random}`;
            }
        }
    }
    
    // Generate masked order ID if not exists: ORD-YYYY-MM-DD-XXXXXX
    if (!this.maskedOrderId) {
        let randomString = generateRandomString(6);
        this.maskedOrderId = `ORD-${year}-${month}-${day}-${randomString}`;
        
        // Ensure uniqueness
        let isUnique = false;
        while (!isUnique) {
            const existing = await OrderModel.findOne({ maskedOrderId: this.maskedOrderId });
            if (!existing) {
                isUnique = true;
            } else {
                randomString = generateRandomString(6);
                this.maskedOrderId = `ORD-${year}-${month}-${day}-${randomString}`;
            }
        }
    }
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;

