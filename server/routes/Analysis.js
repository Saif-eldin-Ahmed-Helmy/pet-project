const express = require('express');
const router = express.Router();

const Order = require("../models/Order");
const Item = require("../models/Item");
const CouponCode = require("../models/CouponCode");
const CartItem = require("../models/User");

const { handleBadRequest } = require("../handlers/error");
const { getMilliSeconds } = require("../utils/timeUtils");
const Validator = require("../utils/validator");
const { verifySession } = require('../middlewares/auth');
const { attachUserDataToRequest } = require("../middlewares/attachUserData");

router.use(verifySession)
router.use((req, res, next) => attachUserDataToRequest(req, res, next, ['orders', 'shoppingCart']));

/**
 * from (DD:MM:YYYY)
 * to (DD:MM:YYYY)
 *
 * traceType ('placed', 'preparing', 'delivering', 'delivered', 'cancelled')
 *
 * ItemId (string)
 * ItemCategory (string)
 * ItemSubCategory (string)
 *
 * CouponCode (string)
 *
 * locationCity (string)
 *
 * amountFrom (integer)
 * amountTo (integer)
 *
 * ratingFrom (integer)
 * ratingTo (integer)
 *
 * userRatingFrom (integer)
 * userRatingTo (integer)
 *
 * driverRatingFrom (integer)
 * driverRatingTo (integer)
 *
 * tipFrom (integer)
 * tipTo (integer)
 *
 * paymentMethod ('cash', 'balance')
 */
router.get("/orders", async(req, res) => {
    try {
        const { from, to, traceType, itemId, itemCategory, itemSubCategory, couponCode, locationCity, amountFrom, amountTo, ratingFrom, ratingTo, userRatingFrom, userRatingTo, driverRatingFrom, driverRatingTo, tipFrom, tipTo, paymentMethod } = req.query;
        let query = {};

        if (from) query.date = { $gte: new Date(from) };
        if (to) query.date = { ...query.date, $lte: new Date(to) };
        if (locationCity) query['location.city'] = locationCity;
        if (amountFrom) query.amount = { $gte: parseInt(amountFrom) };
        if (amountTo) query.amount = { ...query.amount, $lte: parseInt(amountTo) };
        if (ratingFrom) query.rating = { $gte: parseInt(ratingFrom) };
        if (ratingTo) query.rating = { ...query.rating, $lte: parseInt(ratingTo) };
        if (userRatingFrom) query.userRating = { $gte: parseInt(userRatingFrom) };
        if (userRatingTo) query.userRating = { ...query.userRating, $lte: parseInt(userRatingTo) };
        if (driverRatingFrom) query.driverRating = { $gte: parseInt(driverRatingFrom) };
        if (driverRatingTo) query.driverRating = { ...query.driverRating, $lte: parseInt(driverRatingTo) };
        if (tipFrom) query.tip = { $gte: parseInt(tipFrom) };
        if (tipTo) query.tip = { ...query.tip, $lte: parseInt(tipTo) };

        const orders = await Order.find(query);
        const filteredOrders = orders.filter(order => {
            return (!traceType || order.trace.some(trace => trace.type === traceType)) &&
                (!itemId || order.items.some(item => item.itemId === itemId)) &&
                (!itemCategory || order.items.some(item => item.category === itemCategory)) &&
                (!itemSubCategory || order.items.some(item => item.subCategory === itemSubCategory)) &&
                (!couponCode || order.couponCodes.some(coupon => coupon.code === couponCode))
        });

        res.json({ filteredOrders });
    } catch (error) {
        console.error(error);
    }
})