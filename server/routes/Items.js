const express = require('express');
const router = express.Router();

const Items = require("../models/Item");
const { handleItemNotFound, handleUnauthorized, handleBadRequest } = require("../utils/errorHandler");
const { verifySession } = require('../middlewares/auth');

router.use(verifySession);

/**
 * Query options
 * - category
 * - inStock
 * - price
 * - itemID
 * - limit
 * 
 * Examples:
 * - example.com/items?category=dogs&inStock=true&price=50-150&limit=24
 * - example.com/items?itemID=465
 */
router.get('/', async (req, res) => {
    let limit = req.query.limit;
    let category = req.query.category;
    let inStock = req.query.inStock == true ? 1 : 0;
    let priceRange = String(req.query.price).split('-');
    let itemID = req.query.itemID;

    if(limit != null){
        let items = await Items.find({
            category: category,
            stock: { $gte: inStock }, // gte: finds where the stock is more than or equal 1
            price: { $gte: priceRange[0] , $lte: priceRange[1] }
        }).limit(limit);

        res.json({ items });
    } else if(itemID != null) {
        let item = await Items.findOne({ itemID });

        if(item != null) {
            res.json({ item });
            return;
        }

        handleItemNotFound(res);
    } else if(!req.query) {
        let items = await Items.find();

        res.json({ items });
    }
});

router.post('/', (req, res) => {
    const role = req.role;
    if (role !== 'admin') {
        return handleUnauthorized(res);
    }

    // @todo: let admins add a new item to the database
});

router.delete('/', (req, res) => {
    const role = req.role;
    if (role !== 'admin') {
        return handleUnauthorized(res);
    }
    // @todo: let admins delete an item from the database
});

module.exports = router;