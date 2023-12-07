const jwt = require('jsonwebtoken');
const { handleUnauthorized } = require('../utils/errorHandler');

const verifySession = (req, res, next) => {
    const token = req.headers['Cookie'];
    console.log(token);
    if (!req.user) {
        console.log('No user');
        return handleUnauthorized(res);
    }
    const {email, role} = req.user;

    if (!email || !role) {
        console.log('No email or role');
        return handleUnauthorized(res);
    }
    next();
};

module.exports = { verifySession };