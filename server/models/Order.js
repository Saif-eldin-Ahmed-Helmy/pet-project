const mongoose = require("mongoose");

const orderTrace = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['placed', 'packed', 'shipped', 'arrived', 'canceled']
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

const orderItems = new mongoose.Schema({
    itemId: {
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
    },
    subCategory: {
        type: String,
        required: true
    }
})

const couponCodes = new mongoose.Schema({
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
        enum: ['percentage', 'amount']
    },
    couponType: {
        type: String,
        default: 'order',
        enum: ['order', 'item'] //whether the discount on the whole order or just one item
    },
    itemId: {
        type: String
    },
    maximumAmount: {
        type: Number,
    }
})

const locationSchema = new mongoose.Schema({
    locationId: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    locationSignature: { // this will be a fingerprint for the location of the user, probably gonna use longitude and latitude, when we get in a group call we can discuss this
        type: String,
        required: true,
    },
    apartmentNumber: {
        type: String,
        required: true,
    },
    floorNumber: {
        type: Number,
        required: true,
    },
    streetName: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: true
    }
});

const orderSchema = new mongoose.Schema({
    orderId: {
        type: Number,
        required: true,
        unique: true
    },
    trace: [orderTrace],
    items: [orderItems],
    couponCodes: [couponCodes],
    location: locationSchema,
    amount: { //the order amount without any discounts
        type: Number,
        required: true
    },
    finalAmount: { // with the discounts
        type: Number,
        required: true
    },
    rating: { //the rating given by the user to the order
        type: Number,
        default: 0
    },
    comment: { //the comment given by the user to the order
        type: String,
        default: ''
    },
    userRating: { //the rating given by the user to the driver
        type: Number,
        default: 0
    },
    userComment: { //the comment given by the user to the driver
        type: String,
        default: ''
    },
    driverRating: { //the rating given by the driver to the user
        type: Number,
        default: 0
    },
    driverComment: { //the comment given by the driver to the user
        type: String,
        default: ''
    }
})

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;