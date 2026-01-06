const mongoose = require('mongoose');

const billingSchema =  new mongoose.Schema({
     firstName: {
        type: String,
        required: true
     },
     lastName: {
        type: String,
        required: true
     },
     company: {
        type: String,
        required: false
     },
     phone: {
        type: String,
        required: true
     },
     email: {
        type: String,
        required: true
     },
     country: {
        type: String,
        required: true
     },
     address: {
        type: String,
        required: true
     },
     city: {
        type: String,
        required: true
     },
     postcode :{
        type: String,
        required: true
     },
    shipToDifferentAddress: {
        type: Boolean,
        default: false
    },
    orderNotes: {
        type: String,
        required: false
    }
}, { timestamps: true });

const Billing = mongoose.model("Billing", billingSchema);

module.exports = Billing;