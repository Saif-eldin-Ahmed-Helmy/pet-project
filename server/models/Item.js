const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    itemId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    picture: {
        type: String, // @todo: assuming it's a link to a CDN, idk what CDN we should use yet though
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;