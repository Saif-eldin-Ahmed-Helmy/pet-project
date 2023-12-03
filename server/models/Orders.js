const mongoose = require("mongoose");

let orderTrace = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['placed', 'canceled', 'shipped', 'arrived']
    },
    date: {
        type: String,
        required: true
    },
    executor: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
})

let orderItems = new mongoose.Schema({
    itemID: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    pricePerItem: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    }
})

let couponCodes = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    expiryDate: {
        type: String,
        required: true
    },
    dicount: {
        type: Number,
        required: true
    },
    discountType: {
        type: String,
        default: 'percentage',
        enum: ['percentage', 'balance']
    },
    couponType: {
        type: String,
        default: 'order',
        enum: ['order', 'item'] //whether the discount on the whole order or just one item
    },
    itemID: {
        type: String
    },
    maximumBalance: {
        type: Number,
    }
})

let orderSchema = new mongoose.Schema({
    orderID: {
        type: Number,
        required: true,
        unique: true
    },
    trace: [orderTrace],
    items: [orderItems],
    couponCodes: [couponCodes],
    location: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'locationSchema',
        required: true
    },
    amount: { //the order amount without any discounts 
        type: Number,
        required: true
    }
})

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;