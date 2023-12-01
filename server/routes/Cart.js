const express = require('express');
const router = express.Router();
const User = require('../models/User');
const CartItem = require('../models/CartItem');
const { verifyToken } = require('../middlewares/auth');
const { handleUnauthorized, handleServerError, handleUserNotFound, handleBadRequest } = require('../utils/errorHandler');

router.use(verifyToken);

router.get('/', async (req, res) => {
    try {
        if (!req.tokenPayload) return handleUnauthorized(res);

        const { email } = req.tokenPayload;
        const user = await User.findOne({ email }).populate('shoppingCart');
        if (!user) return handleUserNotFound(res);

        res.json(user.shoppingCart);
    } catch (error) {
        console.error(error);
        handleServerError(res);
    }
});

router.post('/', async (req, res) => {
    try {
        if (!req.tokenPayload) return handleUnauthorized(res);

        const { email } = req.tokenPayload;
        const { itemId, quantity } = req.body;
        if (!itemId) return handleBadRequest(res);

        const user = await User.findOne({ email }).populate('shoppingCart');

        const existingItem = user.shoppingCart.find(cartItem => cartItem.itemId === itemId);
        if (existingItem) {
            existingItem.quantity += quantity || 1;
            await existingItem.save();
        } else {
            const newItem = await CartItem.create({ itemId, quantity: quantity || 1 });
            user.shoppingCart.push(newItem);
            await user.save();
        }

        res.json(user.shoppingCart);
    } catch (error) {
        console.error(error);
        handleServerError(res);
    }
});

router.delete('/', async (req, res) => {
    try {
        const { email } = req.tokenPayload;
        const { itemId, removeFromBasket } = req.body;
        if (!itemId) return handleBadRequest(res);

        const user = await User.findOne({ email }).populate('shoppingCart');
        const cartItemIndex = user.shoppingCart.findIndex(cartItem => cartItem.itemId === itemId);

        if (cartItemIndex !== -1) {
            const cartItem = user.shoppingCart[cartItemIndex];
            if (removeFromBasket || cartItem.quantity === 1) {
                user.shoppingCart.splice(cartItemIndex, 1);
                await CartItem.deleteOne({ _id: cartItem._id });
            } else {
                cartItem.quantity--;
                await cartItem.save();
            }

            await user.save();
        }

        res.json(user.shoppingCart);
    } catch (error) {
        console.error(error);
        handleServerError(res);
    }
});

module.exports = router;