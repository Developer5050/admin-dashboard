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
        enum: ['cash', 'card', 'online', 'bank_transfer'],
        default: 'cash'
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
    orderTime: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Generate invoice number before saving
orderSchema.pre('save', async function() {
    if (!this.invoiceNo) {
        // Generate invoice number: INV-YYYYMMDD-XXXXX (5 random digits)
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        let random = Math.floor(10000 + Math.random() * 90000);
        this.invoiceNo = `INV-${year}${month}${day}-${random}`;
        
        // Ensure uniqueness
        let isUnique = false;
        const OrderModel = this.constructor;
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
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;

