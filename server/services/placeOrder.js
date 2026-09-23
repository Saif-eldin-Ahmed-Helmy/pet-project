const mongoose = require('mongoose');
const { randomUUID } = require('node:crypto');
const User = require('../models/User');
const Item = require('../models/Item');
const Order = require('../models/Order');
const CouponCode = require('../models/CouponCode');
const CartItem = require('../models/CartItem');

const invalid = message => { const error = new Error(message); error.statusCode = 400; throw error; };

async function placeOrder(userId, { paymentMethod = 'cash', locationId, deliveryInstructions = '', tip = 0, couponCodes = [] }) {
    if (!['cash', 'balance'].includes(paymentMethod) || typeof tip !== 'number' || !Number.isFinite(tip) || tip < 0) invalid('Invalid payment method or tip');
    if (!Array.isArray(couponCodes) || couponCodes.some(c => typeof c !== 'string') || new Set(couponCodes).size !== couponCodes.length) invalid('Invalid coupon codes');
    return mongoose.connection.transaction(async session => {
        const user = await User.findById(userId).session(session).populate('shoppingCart');
        if (!user || user.deleted) invalid('Account unavailable');
        const location = user.locations.find(loc => loc.locationId === locationId && !loc.deleted);
        if (!location) invalid('Delivery location not found');
        if (!user.shoppingCart.length) invalid('Cart is empty');
        const items = []; let amount = 0;
        for (const cart of user.shoppingCart) {
            if (!cart || !Number.isSafeInteger(cart.quantity) || cart.quantity <= 0) invalid('Invalid cart quantity');
            const item = await Item.findOneAndUpdate(
                { itemId: cart.itemId, deleted: false, stock: { $gte: cart.quantity } },
                { $inc: { stock: -cart.quantity } }, { new: true, session }
            );
            if (!item) invalid('An item is unavailable or out of stock');
            if (!Number.isFinite(item.price) || item.price < 0) invalid('Invalid item price');
            items.push({ itemId: item.itemId, name: item.name, quantity: cart.quantity, pricePerItem: item.price, category: item.category, subCategory: item.subCategory, picture: item.picture });
            amount += item.price * cart.quantity;
        }
        let discounted = amount; const coupons = [];
        for (const code of couponCodes) {
            const coupon = await CouponCode.findOne({ code, deleted: false }).session(session);
            const expiry = coupon && (Number(coupon.expiryDate) || Date.parse(coupon.expiryDate));
            if (!coupon || !Number.isFinite(expiry) || expiry <= Date.now() || !Number.isFinite(coupon.discount) || coupon.discount < 0) invalid('Invalid or expired coupon');
            const item = items.find(i => i.itemId === coupon.itemId);
            if (coupon.couponType === 'item' && !item) invalid('Coupon item is not in this cart');
            const base = coupon.couponType === 'item' ? item.pricePerItem * item.quantity : discounted;
            let discount = coupon.discountType === 'percentage' ? base * coupon.discount / 100 : coupon.discount * (coupon.couponType === 'item' ? item.quantity : 1);
            if (coupon.maximumAmount > 0) discount = Math.min(discount, coupon.maximumAmount);
            discounted = Math.max(0, discounted - Math.min(base, discount));
            coupons.push(coupon.toObject());
        }
        const finalAmount = Math.round((discounted + (amount < 200 ? 20 : 0) + tip) * 100) / 100;
        const balanceUsed = paymentMethod === 'balance' ? Math.min(finalAmount, Math.max(0, user.balance)) : 0;
        const [order] = await Order.create([{
            orderId: randomUUID(), userEmail: user.email, date: new Date().toISOString(),
            trace: [{ type: 'placed', date: new Date().toISOString(), executor: user.email, active: true }],
            items, couponCodes: coupons, location: location.toObject(), amount, finalAmount,
            cashAmount: finalAmount - balanceUsed, paymentMethod, deliveryInstructions, tip
        }], { session });
        await CartItem.deleteMany({ _id: { $in: user.shoppingCart.map(c => c._id) } }, { session });
        user.balance -= balanceUsed; user.orders.push(order._id); user.shoppingCart = [];
        await user.save({ session });
        return order;
    });
}

module.exports = { placeOrder };
