const { handleUnauthorized } = require('../handlers/error');

const verifySession = (req, res, next) => {
    if (!req.isAuthenticated() || !req.user) {
        return handleUnauthorized(res);
    }
    const {email, role} = req.user;

    if (!email || !role) {
        return handleUnauthorized(res);
    }
    next();
};

const requireAdminRole = (req, res, next) => {
    if (req.role !== 'admin') {
        return res.status(403).json({ error: 'User does not have the required role.' });
    }
    next();
};

module.exports = { verifySession, requireAdminRole };