const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { handleBadRequest, handleServerError } = require('../utils/errorHandler');

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

        console.log(accessToken);
        console.log(user);
        console.log(payload);
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

module.exports = router;