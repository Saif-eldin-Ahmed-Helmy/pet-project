const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const Item = require('../models/Item');
const Order = require('../models/Order');
const CartItem = require('../models/CartItem');
const Coupon = require('../models/CouponCode');
const { placeOrder } = require('../services/placeOrder');

test('checkout rolls back failures, applies discounts, and cannot oversell', { skip: !process.env.MONGODB_TEST_URI }, async t => {
  await mongoose.connect(process.env.MONGODB_TEST_URI, { dbName: 'orders_test_' + randomUUID().replaceAll('-', '') });
  try {
    await Promise.all([User.init(), Item.init(), Order.init(), CartItem.init(), Coupon.init()]);
    const item = await Item.create({ itemId: 'food', name: 'Food', picture: 'image.png', stock: 3, price: 100, description: 'Pet food', category: 'cats', subCategory: 'food' });
    const location = { locationId: 'home', apartmentNumber: '1', floorNumber: 1, streetName: 'Test Street', city: 'Test City', phoneNumber: '01000000000' };
    const cart = await CartItem.create({ itemId: item.itemId, quantity: 2 });
    const user = await User.create({ name: 'Customer', email: 'customer@example.com', locations: [location], balance: 300, shoppingCart: [cart._id] });
    const request = { locationId: 'home', paymentMethod: 'balance', couponCodes: ['save'] };
    await assert.rejects(placeOrder(user._id, request), /coupon/);
    assert.equal((await Item.findById(item._id)).stock, 3);
    assert.equal((await User.findById(user._id)).balance, 300);
    await Coupon.create({ code: 'save', expiryDate: String(Date.now() + 86400000), discount: 10, discountType: 'percentage', couponType: 'order' });
    const failure = t.mock.method(Order, 'create', async () => { throw Error('simulated write failure'); });
    await assert.rejects(placeOrder(user._id, request), /simulated/);
    failure.mock.restore();
    assert.equal((await Item.findById(item._id)).stock, 3);
    assert.equal(await CartItem.countDocuments(), 1);
    const results = await Promise.allSettled([placeOrder(user._id, request), placeOrder(user._id, request)]);
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
    assert.equal(await Order.countDocuments(), 1);
    assert.equal((await Item.findById(item._id)).stock, 1);
    const order = await Order.findOne();
    assert.equal(order.finalAmount, 180);
    assert.equal(order.cashAmount, 0);
    assert.equal((await User.findById(user._id)).balance, 120);
    assert.equal(await CartItem.countDocuments(), 0);
    const buyers = await Promise.all(['one', 'two'].map(async name => {
      const cart = await CartItem.create({ itemId: item.itemId, quantity: 1 });
      return User.create({ name, email: name + '@example.com', locations: [location], shoppingCart: [cart._id] });
    }));
    const competing = await Promise.allSettled(buyers.map(buyer => placeOrder(buyer._id, { locationId: 'home' })));
    assert.equal(competing.filter(r => r.status === 'fulfilled').length, 1);
    assert.equal((await Item.findById(item._id)).stock, 0);
  } finally {
    await mongoose.connection.dropDatabase(); await mongoose.disconnect();
  }
});
