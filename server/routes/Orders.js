const express = require('express');
const router = express.Router();

const Order = require("../models/Order");
const Item = require("../models/Item");
const CouponCode = require("../models/CouponCode");
const { handleBadRequest, handleUnauthorized } = require("../utils/errorHandler");
const { verifySession } = require('../middlewares/auth');
const { attachUserDataToRequest } = require("../middlewares/attachUserData");

router.use(verifySession)
router.use((req, res, next) => attachUserDataToRequest(req, res, next, ['orders', 'shoppingCart']));

router.get("/", async (req, res) => {
    const { orderId, traceType, itemId, itemCategory, couponCode, city } = req.query;

    if(orderId) {
        const hasOrder = req.user.orders.find(order => order.orderId === orderId);
        const role = req.role;
        if(!hasOrder && role !== 'admin') {
            handleBadRequest(res, `There is no order with the id ${orderId}`)
            return;
        }

        const order = await Order.find({ orderId: orderId });
        res.json({ order });
        return;
    }

    const orders = await Order.find();
    const filteredOrders = orders.filter(order => {
        return (!traceType || order.trace.some(trace => trace.type === traceType)) &&
            (!itemId || order.items.some(item => item.itemId === itemId)) &&
            (!itemCategory || order.items.some(item => item.category === itemCategory)) &&
            (!couponCode || order.couponCodes.some(coupon => coupon.code === couponCode)) &&
            (!city || order.location.city === city);
    });

    res.json({ filteredOrders })
})

router.post("/", async(req, res) => {
    const executor = req.email;
    const { couponCodes, locationId } = req.body;
    const orderId = newId();
    let amount = 0;
    let finalAmount = 0;

    const location = req.user.locations.find(loc => loc.locationId === locationId);
    if(!location) return handleBadRequest(res, `there is no location with the id ${locationId}`);

    const items = [];
    const couponData = [];

    for (const item of req.user.shoppingCart) {
        const itemData = await Item.findOne({ itemId: item.itemId });

        if(item.quantity > itemData.stock || itemData.deleted) {
            return handleBadRequest(res, `${itemData.name} whether there is not enough in stock or it's been removed`);
        }

        items.push({
            itemId: item.itemId,
            quantity: item.quantity,
            pricePerItem: itemData.price,
            category: itemData.category,
            subCategory: itemData.subCategory
        });

        amount += itemData.price;
        finalAmount += itemData.price;
    }

    for (const code of couponCodes.split(",")) {
        const data = await CouponCode.findOne({ code });

        if(data.expiryDate > new Date() || data.deleted) {
            return handleBadRequest(res, `${data.code} whether it's expired or removed`);
        }

        couponData.push({
            code: code,
            expiryDate: data.expiryDate,
            discount: data.discount,
            discountType: data.discountType,
            couponType: data.couponType,
            itemId: data.itemId ? data.itemId : 0,
            maximumBalance: data.maximumBalance ? data.maximumBalance : 0
        })

        if(data.discountType === "percentage" && data.couponType === "order") {
            finalAmount -= finalAmount * (data.discount / 100);
        } else if(data.discountType === "percentage" && data.couponType === "item") {
            const item = items.find(item => item.itemId === data.itemId);
            if(item) finalAmount -= (item.pricePerItem * item.quantity) * (data.discount / 100);
        } else if(data.discountType === "amount" && data.couponType === "order") {
            finalAmount -= data.discount;
        } else if(data.discountType === "amount" && data.couponType === "item") {
            const item = items.find(item => item.itemId === data.itemId);
            if(item) finalAmount -= (item.pricePerItem * item.quantity) - (data.discount * item.quantity);
        }
    }

    if(req.user.balance < finalAmount) return handleBadRequest(res, 'Insufficient funds.');

    req.user.balance -= finalAmount;

    const newOrder = await Order.create({
        orderId: orderId,
        trace: {
            type: "placed",
            date: new Date(),
            executor: executor,
            active: true
        },
        items: items,
        couponCodes: couponData,
        location: location,
        amount: amount,
        finalAmount: finalAmount
    })

    req.user.orders.push(newOrder);
    await req.user.save();
})

router.put("/", async(req, res) => {
    const { orderId, traceType, executor } = req.body;

    const order = req.user.orders.find(order => order.orderId === orderId);
    const role = req.role;
    if(!order || role !== "admin") return handleUnauthorized(res);

    order.trace.push({
        type: traceType,
        date: new Date(),
        executor: executor,
        active: true
    })

    req.user.orders.save();
})

const newId = function(){
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

module.exports = router;