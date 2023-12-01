const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/', async (req, res) => {
    try {
        if (!req.tokenPayload) {
            return res.status(401).json({ error: 'Unauthorized - Invalid Token' });
        }

        const { email } = req.tokenPayload;

        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const shoppingCart = user.shoppingCart;

        res.json(shoppingCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/', async (req, res) => {
    if (!req.tokenPayload) {
        return res.status(401).json({ error: 'Unauthorized - Invalid Token' });
    }

    const { email } = req.tokenPayload;
    const { itemId } = req.body;

    if (!email || !itemId) {
        return res.status(400).json({ error: 'Email and item id are required.' });
    }

    // todo: validate if the itemid actually exists
    // todo: add the item to the user's shopping cart, and if it already exists then increment the quantity by one
});

router.delete('/', async (req, res) => {
    const { email } = req.tokenPayload;
    const { itemId } = req.body;
    if (!email || !itemId) {
        return res.status(400).json({ error: 'Email and item id are required.' });
    }

    /*
      TODO:
      validate if the item ID actually exists
      allow removing the item from the shopping cart
      AND also allow decrementing the quantity by one if the quantity is greater than one
    */

});

module.exports = router;