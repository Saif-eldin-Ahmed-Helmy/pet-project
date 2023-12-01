const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    itemId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;