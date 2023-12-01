const express = require('express');
const router = express.Router();
const user = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

router.get('/', (req, res) => {
    const { email, password } = req.query;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    user.findOne({ email  })
        .then((data) => {
            if (!data || !bcrypt.compareSync(password, data.password)) {
                return res.status(400).json({ error: 'Invalid email or password.' });
            }
            const payload = {
                email: data.email,
                role: data.role
            };

            const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
            res.json({ accessToken: accessToken });

            console.log(accessToken);
            console.log(data);
            console.log(payload);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

router.post('/', (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required.' });
    }

    const account = user.findOne({ email })
        .then((data) => {
            if (data) {
                return res.status(400).json({ error: 'Email already exists.' });
            }
            user.create({ email, password, name })
                .then((data) => {
                    const payload = {
                        email: data.email,
                        role: data.role
                    };

                    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
                    res.json({ accessToken: accessToken });
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ error: 'Internal Server Error' });
                });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

module.exports = router;