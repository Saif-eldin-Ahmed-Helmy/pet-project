const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken)

router.get('/', (req, res) => {
    if (!req.tokenPayload) {
        return res.status(401).json({ error: 'Unauthorized - Invalid Token' });
    }
    // this is a normal method that users can use so no need to check the user role here
    // this will return the list of items in the database
    // can add filters here to search for specific items
});

router.post('/', (req, res) => {
    if (!req.tokenPayload) {
        return res.status(401).json({ error: 'Unauthorized - Invalid Token' });
    }
    const { email, role } = req.tokenPayload;
    if (role !== 'admin') {
        return res.status(401).json({ error: 'Unauthorized - Invalid Token' });
    }
    // @todo: let admins add a new item to the database
});

router.delete('/', (req, res) => {
    if (!req.tokenPayload) {
        return res.status(401).json({ error: 'Unauthorized - Invalid Token' });
    }
    const { email, role } = req.tokenPayload;
    if (role !== 'admin') {
        return res.status(401).json({ error: 'Unauthorized - Invalid Token' });
    }
    // @todo: let admins delete an item from the database
});

module.exports = router;