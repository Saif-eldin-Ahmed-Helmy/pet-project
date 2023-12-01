const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { handleBadRequest, handleUnauthorized, handleServerError, handleUserNotFound} = require('../utils/errorHandler');
const {verifyToken} = require("../middlewares/auth");

router.get('/', async (req, res) => {
    try {
        const { email, password } = req.query;

        if (!email || !password) {
            return handleBadRequest(res, 'Email and password are required.');
        }

        const user = await User.findOne({ email });

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return handleBadRequest(res, 'Invalid email or password.');
        }

        const payload = {
            email: user.email,
            role: user.role,
        };

        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
        res.json({ accessToken });
    } catch (error) {
        console.error(error);
        handleServerError(res);
    }
});

router.post('/', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return handleBadRequest(res, 'Email, password, and name are required.');
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return handleBadRequest(res, 'Email already exists.');
        }

        const newUser = await User.create({ email, password, name });

        const payload = {
            email: newUser.email,
            role: newUser.role,
        };

        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
        res.json({ accessToken });
    } catch (error) {
        console.error(error);
        handleServerError(res);
    }
});

router.use(verifyToken);

router.get('/balance', async (req, res) => {
    try {
        const { email } = req.tokenPayload;

        const user = await User.findOne({ email });
        if (!user) {
            return handleUserNotFound(res);
        }

        res.json({ balance: user.balance });
    } catch (error) {
        console.error(error);
        handleServerError(res);
    }
});

router.post('/balance', async (req, res) => {
    try {
        const { role } = req.tokenPayload;
        if (role !== 'admin') {
            return handleUnauthorized(res);
        }

        const { email, amount } = req.body;

        await adjustUserBalance(email, amount, res);
    } catch (error) {
        console.error(error);
        handleServerError(res);
    }
});

router.delete('/balance', async (req, res) => {
    try {
        const { role } = req.tokenPayload;
        if (role !== 'admin') {
            return handleUnauthorized(res);
        }

        const { email, amount } = req.body;

        await adjustUserBalance(email, -amount, res);
    } catch (error) {
        console.error(error);
        handleServerError(res);
    }
});

const adjustUserBalance = async (email, amount, res) => {
    try {
        if (!amount || isNaN(amount) || amount <= 0) {
            return handleBadRequest(res, 'Invalid amount.');
        }

        const user = await User.findOne({ email });
        if (!user) {
            return handleUserNotFound(res);
        }

        user.balance += parseFloat(amount);
        user.balance = Math.max(user.balance, 0);
        await user.save();

        res.json({ balance: user.balance });
    } catch (error) {
        console.error(error);
        handleServerError(res);
    }
}

router.get('/locations', async (req, res) => {
    try {
        const { email } = req.tokenPayload;

        const user = await User.findOne({ email });
        if (!user) {
            return handleUserNotFound(res);
        }

        res.json(user.locations);
    } catch (error) {
        console.error(error);
        handleServerError(res);
    }
});

router.post('/locations', async (req, res) => {
    try {
        const { email } = req.tokenPayload;

        const user = await User.findOne({ email });
        if (!user) {
            return handleUserNotFound(res);
        }

        const { locationId, locationSignature, apartmentNumber, floorNumber, streetName, city, phoneNumber } = req.body;

        const index = user.locations.findIndex(loc => loc.locationId === locationId.toLowerCase());

        if (index !== -1) {
            return handleBadRequest(res, 'Location with this ID already exists.');
        }

        const newLocation = {
            locationId,
            locationSignature,
            apartmentNumber,
            floorNumber,
            streetName,
            city,
            phoneNumber,
        };

        user.locations.push(newLocation);
        await user.save();

        res.json(user.locations);
    } catch (error) {
        console.error(error);
        handleServerError(res);
    }
});

router.delete('/locations', async (req, res) => {
    try {
        const { email } = req.tokenPayload;

        const user = await User.findOne({ email });
        if (!user) {
            return handleUserNotFound(res);
        }

        const {locationId} = req.body;

        const indexToRemove = user.locations.findIndex(loc => loc.locationId === locationId.toLowerCase());

        if (indexToRemove === -1) {
            return handleBadRequest(res, 'Location not found.');
        }

        user.locations.splice(indexToRemove, 1);
        await user.save();

        res.json(user.locations);
    } catch (error) {
        console.error(error);
        handleServerError(res);
    }
});

module.exports = router;