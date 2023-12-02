const jwt = require('jsonwebtoken');
const { handleUnauthorized } = require('../utils/errorHandler');

const verifySession = (req, res, next) => {
    if (!req.user) {
        return handleUnauthorized(res);
    }
    const {email, role} = req.user;

    if (!email || !role) {
        return handleUnauthorized(res);
    }
    next();
};

module.exports = { verifySession };