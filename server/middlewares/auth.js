const jwt = require('jsonwebtoken');
const { handleUnauthorized } = require('../utils/errorHandler');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return handleUnauthorized(res);
    }

    try {
        req.tokenPayload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        next();
    } catch (error) {
        console.error(error);
        handleUnauthorized(res);
    }
};

module.exports = { verifyToken };