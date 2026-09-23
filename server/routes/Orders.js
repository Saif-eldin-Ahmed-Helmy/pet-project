const express = require('express');
const router = express.Router();

const Order = require("../models/Order");
const Item = require("../models/Item");
const CouponCode = require("../models/CouponCode");
const CartItem = require("../models/CartItem");

const { handleBadRequest, handleServerError} = require("../handlers/error");
const { getMilliSeconds } = require("../utils/timeUtils");
const { newId } = require("../utils/numberUtils");
const { verifySession } = require('../middlewares/auth');
const { attachUserDataToRequest } = require("../middlewares/attachUserData");

router.use(verifySession)
router.use((req, res, next) => attachUserDataToRequest(req, res, next, ['orders', 'shoppingCart']));

router.get("/", async (req, res) => {
    try {
        const {orderId, traceType, itemId, itemCategory, couponCode, city, page = 1, limit = 10} = req.query;
        const role = req.role;

        if (orderId) {
            const hasOrder = req.user.orders.find(order => order.orderId === orderId);
            if (!hasOrder && role !== 'admin') {
                handleBadRequest(res, `There is no order with the id ${orderId}`)
                return;
            }

            const order = await Order.find({orderId: orderId});
            res.json({order});
            return;
        }

        const ordersQuery = (role === 'admin' || role === 'packager' || role === 'driver') ? Order.find() : Order.find({ userEmail: req.user.email });
        let orders = await ordersQuery
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        let filteredOrders = orders.filter(order => {
            const lastTrace = order.trace[order.trace.length - 1];
            return (!traceType || lastTrace.type === traceType) &&
                (!itemId || order.items.some(item => item.itemId === itemId)) &&
                (!itemCategory || order.items.some(item => item.category === itemCategory)) &&
                (!couponCode || order.couponCodes.some(coupon => coupon.code === couponCode)) &&
                (!city || order.location.city === city);
        });

        filteredOrders = filteredOrders.map(order => {
            const lastTrace = order.trace[order.trace.length - 1];
            return {
                orderId: order.orderId,
                userEmail: order.userEmail,
                status: lastTrace.type,
                date: order.date,
                amount: order.amount,
                finalAmount: order.finalAmount,
                rating: order.rating,
                items: order.items,
                trace: order.trace,
                location: order.location,
            };
        });

        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit);

        res.json({filteredOrders, totalPages});
    } catch (error) {
        console.error(error);
        handleServerError(res);
    }
});

router.post("/", async (req, res) => {
    try {
        const order = await require('../services/placeOrder').placeOrder(req.user._id, req.body);
        res.json({ success: true, order });
    } catch (error) {
        if (error.statusCode === 400) return handleBadRequest(res, error.message);
        handleServerError(res);
    }
});

router.put("/", async(req, res) => {
    try {
        const {orderId, traceType, rating, comment, userRating, userComment, driverRating, driverComment} = req.body;
        const executor = req.email;

        const order = await Order.findOne({orderId: orderId});
        if (!order) return handleBadRequest(res, `no order with this id, ${orderId}`);

        if (traceType) {
            if ((traceType === 'prepared' && (req.role === 'packager' || req.role === 'admin'))
                || ((traceType === 'delivering' || traceType === 'delivered') && (req.role === 'driver' || req.role === 'admin'))) {
                order.trace.push({
                    type: traceType,
                    date: new Date().toISOString(),
                    executor: executor,
                    active: true
                })
                console.log(order.trace);
            }
        } else if (rating || comment || userRating || userComment) {
            if ((order.trace.find(trace => trace.active === true).type === 'delivered')
                && ((req.user.orders.find(order => order.orderId === orderId))
                    && req.role === 'admin')) {
                order.rating = rating;
                order.comment = comment;
                order.userRating = userRating;
                order.userComment = userComment;
            }
        } else if (driverRating || driverComment) {
            if ((order.trace.find(trace => trace.type === 'delivering').executor === req.email)) {
                order.driverRating = driverRating;
                order.driverComment = driverComment;
            }
        }

        await order.save();
        return res.json({order});
    }
    catch (error) {
        console.error(error);
        handleServerError(res);
    }
})

router.post('/reorder', async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = req.user.orders.find(order => order.orderId === orderId);
        if(!order) {
            handleBadRequest(res, `There is no order with the id ${orderId}`)
            return;
        }

        const orderItems = order.items.map(item => ({
            itemId: item.itemId,
            name: item.name,
            quantity: item.quantity,
            pricePerItem: item.pricePerItem,
            category: item.category,
            subCategory: item.subCategory,
            picture: item.picture
        }));

        const cartItems = orderItems.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
        }));

        for (const item of cartItems) {
            const existingItem = req.user.shoppingCart.find(cartItem => cartItem.itemId === item.itemId);
            if (existingItem) {
                existingItem.quantity += item.quantity || 1;
                await existingItem.save();
            } else {
                const newItem = await CartItem.create({ itemId: item.itemId, quantity: item.quantity || 1 });
                req.user.shoppingCart.push(newItem);
            }
        }

        await req.user.save();

        res.json({ success: true, cartItems });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/rate', async (req, res) => {
    try {
        const { orderId, rating } = req.body;

        if(0 > rating || rating > 5) {
            handleBadRequest(res, `Your generosity is beautiful, but the maximum is 5.`);
            return;
        }

        const order = req.user.orders.find(order => order.orderId == orderId);
        if(!order) {
            handleBadRequest(res, `There is no order with the id ${orderId}`);
            return;
        }

        if(!order.trace.find(trace => trace.active === true).type === 'delivered') {
            handleBadRequest(res, `You can't rate this order yet.`);
            return;
        }

        if(order.rating != "") {
            handleBadRequest(res, `You can't rate the same order twice.`);
            return;
        }

        order.rating = rating;

        await order.save();
        return res.json({order});
    } catch(error) {
        console.error(error);
        handleServerError(res);
    }
})

router.get('/trace', async (req, res) => {

});

module.exports = router;