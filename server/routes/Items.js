const express = require('express');
const router = express.Router();

const Items = require("../models/Item");
const { handleItemNotFound, handleUnauthorized, handleBadRequest, handleServerError} = require("../utils/errorHandler");
const { verifySession } = require('../middlewares/auth');
const { attachUserDataToRequest } = require("../middlewares/attachUserData");

/**
 * Query options
 * - category
 * - inStock
 * - priceMin
 * - priceMax
 * - itemId
 * - limit
 * 
 * Examples:
 * - example.com/items?category=dogs&inStock=true&priceMin=50&priceMax=150&limit=24
 * - example.com/items?itemId=465
 */
router.get('/', async (req, res) => {
    try {
        const limit = req.query.limit;
        const category = req.query.category;
        const subCategory = req.query.subCategory;
        const inStock = !req.query.inStock || req.query.inStock === 'true';
        const priceMin = req.query.priceMin || 0;
        const priceMax = req.query.priceMax || 1000000;
        const itemId = req.query.itemId;
        const deleted = req.query.deleted === 'true'

        if (deleted) {
            //    const role = req.role;
            //    if (role !== 'admin') {
            //        return handleUnauthorized(res);
            //    }
        }

        let items = await Items.find({
            deleted: deleted,
            itemId: itemId || {$exists: true}, // if itemId is null, return all items
            category: category || {$exists: true}, // if category is null, return all items
            subCategory: subCategory || {$exists: true}, // if subCategory is null, return all items
            stock: inStock ? {$gt: 0} : 0, // If inStock is true, return items with stock > 0, else return items with stock = 0
            price: {$gte: priceMin, $lte: priceMax}
        }).limit(limit);
        res.json({items});
    }
    catch (error) {
        console.error(error);
        handleServerError(res);
    }
});

router.use(verifySession);
router.use(attachUserDataToRequest);

router.post('/', async (req, res) => {
    try {
        const role = req.role;
        console.log(role);
        if (role !== 'admin') {
            return handleUnauthorized(res);
        }

        const {itemId, name, picture, stock, price, description, category, subCategory, deleted} = req.body;
        console.log(itemId, name, picture, stock, price, description, category, subCategory, deleted);

        const existingItem = await Items.findOne({itemId});
        if (existingItem) {
            return handleBadRequest(res, "Item with that ID already exists");
        }

        const newItem = await Items.create({itemId, name, picture, stock, price, description, category, subCategory, deleted});

        res.json({newItem});
    }
    catch (error) {
        console.error(error);
        handleServerError(res);
    }
});

router.delete('/', async (req, res) => {
    try {
        const role = req.role;
        if (role !== 'admin') {
            return handleUnauthorized(res);
        }

        const itemId = req.body.itemId;
        const existingItem = await Items.findOne({itemId});
        if (!existingItem) {
            return handleBadRequest(res, "Item with that ID does not exists");
        }

        const updatedItem = await Items.findOneAndUpdate({itemId}, {deleted: true});

        res.json({deleted: true});
    }
    catch (error) {
        console.error(error);
        handleServerError(res);
    }
});

module.exports = router;