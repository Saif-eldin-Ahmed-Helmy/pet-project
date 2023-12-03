const express = require('express');
const router = express.Router();

const Items = require("../models/Item");
const { handleItemNotFound, handleUnauthorized, handleBadRequest } = require("../utils/errorHandler");
const { verifySession } = require('../middlewares/auth');
const { attachUserDataToRequest } = require("../middlewares/attachUserData");

router.use(verifySession);
router.use(attachUserDataToRequest);

/**
 * Query options
 * - category
 * - inStock
 * - priceMin
 * - priceMax
 * - itemID
 * - limit
 * 
 * Examples:
 * - example.com/items?category=dogs&inStock=true&priceMin=50&priceMax=150&limit=24
 * - example.com/items?itemID=465
 */
router.get('/', async (req, res) => {
    const limit = req.query.limit;
    const category = req.query.category;
    const inStock = !req.query.inStock || req.query.inStock === 'true';
    const priceMin = req.query.priceMin || 0;
    const priceMax = req.query.priceMax || 1000000;
    const itemId = req.query.itemId;
    const deleted = req.query.deleted === 'true'
    
    if (deleted) {
        const role = req.role;
        if (role !== 'admin') {
            return handleUnauthorized(res);
        }
    }

    let items = await Items.find({
        deleted: deleted,
        itemId: itemId || { $exists: true }, // if itemID is null, return all items
        category: category || { $exists: true }, // if category is null, return all items
        stock: inStock ? { $gt: 0 } : 0, // If inStock is true, return items with stock > 0, else return items with stock = 0
        price: { $gte: priceMin, $lte: priceMax }
    }).limit(limit);
    res.json({items});
});

router.post('/', async (req, res) => {
    const role = req.role;
    if (role !== 'admin') {
        return handleUnauthorized(res);
    }
    
    let item = req.body;

    let itemId = item.itemID;
    let existingItem = await Items.findOne({ itemId });
    if(existingItem) {
        return handleBadRequest(res, "Item with that ID already exists");
    }

    let newItem = await Items.create({ item });

    res.json({ newItem });
});

router.delete('/', async (req, res) => {
    const role = req.role;
    if (role !== 'admin') {
        return handleUnauthorized(res);
    }

    let itemId = req.body.itemID;
    let existingItem = await Items.findOne({ itemID });
    if(!existingItem) {
        return handleBadRequest(res, "Item with that ID does not exists");
    }

    let updatedItem = await Items.findOneAndUpdate({ itemId }, { deleted: true });

    res.json({ deleted: true });
});

module.exports = router;