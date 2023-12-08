const express = require('express');
const router = express.Router();

const Order = require("../models/Order");
const Items = require("../models/Item");
const CouponCode = require("../models/CouponCode");
const { handleBadRequest } = require("../utils/errorHandler");
const { verifySession } = require('../middlewares/auth');
const { attachUserDataToRequest } = require("../middlewares/attachUserData");

router.use(verifySession)
router.use((req, res, next) => attachUserDataToRequest(req, res, next, ['orders', 'shoppingCart']));

/**
 * Body options
 * - orderID
 * - traceType (whether it's placed, canceled, shipped or arrived)
 * - itemID (has this item in it)
 * - itemCategory (has this category in it)
 * - couponCode (has this copoun code)
 * - city (shiped within this city)
 */
router.get("/", async (req, res) => {
    const orderID = req.body.orderID;
    const traceType = req.body.traceType;
    const itemID = req.body.itemID;
    const itemCategory = req.body.itemCategory;
    const couponCode = req.body.couponCode;
    const city = req.body.city;

    if(orderID != null) {
        const hasOrder = req.user.orders.find(order => order.orderID == orderID);
        if(!hasOrder || !req.role == "admin") {
            let userOrders = req.user.orders;
            res.json({ userOrders });
            return;
        }

        const order = await Order.find({ orderID: orderID });
        res.json({ order });
        return;
    }

    let filteredOrders = [];
    let orders = await Order.find();
    orders.forEach(order => {
        if(order.trace.find(trace => trace.type == traceType)) filteredOrders.push(order);
        if(order.items.find(item => (item.itemId == itemID) || (item.category == itemCategory))) filteredOrders.push(order);
        if(order.couponCodes.find(coupon => coupon.code == couponCode)) filteredOrders.push(order);
        if(order.location.find(loc => loc.city == city)) filteredOrders.push(order);
    })

    res.json({ filteredOrders })
})

router.post("/", async(req, res) => {
    const orderId = newId();
    const couponCodes = req.body.couponCodes.split(",");
    const locationId = req.body.locationId;
    const executor = req.body.executor
    let amount = 0;
    let finalAmount = 0;

    let items = [];
    let couponData = [];

    const location = req.user.locations.find(loc => loc.locationId == locationId);
    if(!location) return handleBadRequest(res, `there is no location with the id ${locationId}`);

    req.user.shoppingCart.forEach(async(item) => {
        let itemId = item.itemId;
        const itemData = await Items.findOne({ itemId });

        if(item.quantity > itemData.stock || itemData.deleted) {
            return handleBadRequest(res, `${itemData.name} whether there is not enough in stock or it's been removed`);
        }

        item.push({
            itemId: itemId,
            quantity: item.quantity,
            pricePerItem: itemData.price,
            category: itemData.category,
            subCategory: itemData.subCategory
        });

        amount += itemData.price;
        finalAmount += itemData.price;
    })

    couponCodes.forEach(async(code) => {
        let data = await couponCode.findOne({ code });

        if(data.expiryDate > new Date() || data.deleted) { //absolute shit, just to know that there will be a expiry check
            return handleBadRequest(res, `${data.code} whether it's expired or removed`);
        }

        couponData.push({
            code: code,
            expiryDate: data.expiryDate,
            discount: data.discount,
            discountType: data.discountType,
            couponType: data.couponType,
            itemId: data.itemId ? data.itemId : 0,
            maximumBalance: data.maximumBalance ? maximumBalance : 0
        })

        if(data.discountType == "percentage" && data.couponType == "order") {
            finalAmount -= finalAmount * (data.discount / 100);
        } else if(data.discountType == "percentage" && data.couponType == "item") {
            let item = items.find(item => item.itemId == data.itemId);
            if(item) finalAmount -= (item.pricePerItem * item.quantity) * (data.discount / 100);
        } else if(data.discountType == "amount" && data.couponType == "order") {
            finalAmount -= data.discount;
        } else if(data.discountType == "amount" && data.couponType == "item") {
            let item = items.find(item => item.itemId == data.itemId);
            if(item) finalAmount -= (item.pricePerItem * item.quantity) - (data.discount * item.quantity);
        }
    })

    Order.create({
        orderId: orderId,
        trace: {
            type: "placed",
            date: new Date().now,
            executor: executor,
            active: true
        },
        items: items,
        couponCodes: couponData,
        location: location,
        amount: amount,
        finalAmount: finalAmount
    })
})

const newId = function(){
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

module.exports = router;