const express = require('express');
const router = express.Router();
const Order = require("../models/Order");
const moment = require('moment');
const { verifySession } = require('../middlewares/auth');
const { attachUserDataToRequest } = require("../middlewares/attachUserData");
const { requireAdminRole } = require('../middlewares/auth');
const Items = require("../models/Item");
const {handleUnauthorized, handleServerError} = require("../handlers/error");
const User = require("../models/User");
const stringSimilarity = require("string-similarity");

router.get('/dashboard', verifySession, attachUserDataToRequest, requireAdminRole, async (req, res) => {
    try {
        const allOrders = await Order.find({});

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const todaysOrders = allOrders.filter(order => new Date(order.date) >= today);
        const thisMonthsOrders = allOrders.filter(order => new Date(order.date) >= firstDayOfMonth);

        const todaysRevenue = todaysOrders.reduce((total, order) => total + order.finalAmount, 0);
        const thisMonthsRevenue = thisMonthsOrders.reduce((total, order) => total + order.finalAmount, 0);
        const thisMonthsAvgPayment = thisMonthsOrders.length > 0 ? thisMonthsRevenue / thisMonthsOrders.length : 0;

        const last10Days = Array.from({ length: 10 }, (_, i) => new Date(today.getTime() - i * 24 * 60 * 60 * 1000));

        const salesOverview = last10Days.map(day => {
            const dayOrders = allOrders.filter(order => {
                const orderDate = new Date(order.date);
                orderDate.setHours(0, 0, 0, 0);
                return +orderDate === +day;
            });
            const daySales = dayOrders.reduce((total, order) => total + order.finalAmount, 0);
            return { date: day, value: daySales };
        }).reverse();

        const recentPayments = allOrders.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map(order => ({
            email: order.userEmail,
            date: order.date,
            itemsCount: order.items.length,
            value: order.finalAmount
        }));

        res.json({
            todaysRevenue,
            thisMonthsRevenue,
            thisMonthsAvgPayment,
            salesOverview,
            recentPayments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/statistics', verifySession, attachUserDataToRequest, requireAdminRole, async (req, res) => {
    try {
        let fromDate = new Date(req.query.from);
        let toDate = new Date(req.query.to);

        const now = new Date();

        if (toDate > now) {
            toDate = now;
        }

        const allOrders = await Order.find({
            date: {
                $gte: fromDate.toISOString(),
                $lte: toDate.toISOString()
            }
        });

        const itemCounts = {};
        const categoryCounts = {};
        const customerCounts = {};

        allOrders.forEach(order => {
            order.items.forEach(item => {
                if (itemCounts[item.itemId]) {
                    itemCounts[item.itemId].value += item.pricePerItem * item.quantity;
                    itemCounts[item.itemId].purchases += item.quantity;
                } else {
                    itemCounts[item.itemId] = { name: item.name, value: item.pricePerItem * item.quantity, purchases: item.quantity };
                }

                const category = item.category + ' ' + item.subCategory;
                if (categoryCounts[category]) {
                    categoryCounts[category].value += item.pricePerItem * item.quantity;
                    categoryCounts[category].purchases += item.quantity;
                } else {
                    categoryCounts[category] = { name: category, value: item.pricePerItem * item.quantity, purchases: item.quantity };
                }
            });

            if (customerCounts[order.userEmail]) {
                customerCounts[order.userEmail].value += order.finalAmount;
                customerCounts[order.userEmail].purchases += 1;
            } else {
                customerCounts[order.userEmail] = { email: order.userEmail, value: order.finalAmount, purchases: 1 };
            }
        });

        const popularItems = Object.values(itemCounts).sort((a, b) => b.value - a.value).slice(0, 10);
        const popularCategories = Object.values(categoryCounts).sort((a, b) => b.value - a.value).slice(0, 10);
        const popularCustomers = Object.values(customerCounts).sort((a, b) => b.value - a.value).slice(0, 10);

        const allTimeSales = allOrders.reduce((total, order) => total + order.finalAmount, 0);
        const yearToDate = allOrders.filter(order => new Date(order.date).getFullYear() === new Date().getFullYear())
            .reduce((total, order) => total + order.finalAmount, 0);
        const monthToDate = allOrders.filter(order => new Date(order.date).getMonth() === new Date().getMonth())
            .reduce((total, order) => total + order.finalAmount, 0);
        const today = allOrders.filter(order => new Date(order.date).toDateString() === new Date().toDateString())
            .reduce((total, order) => total + order.finalAmount, 0);


        const diffDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));

        const interval = diffDays > 9 ? Math.floor(diffDays / 9) : 1;

        const points = [];
        for (let i = 0; i < Math.min(10, diffDays + 1); i++) {
            points.push(new Date(fromDate.getTime() + i * interval * 24 * 60 * 60 * 1000));
        }

        points[points.length - 1] = toDate;

        const salesOverview = points.slice(0, -1).map((point, index) => {
            const nextPoint = points[index + 1];

            const rangeOrders = allOrders.filter(order => {
                const orderDate = new Date(order.date);
                return orderDate >= point && orderDate < nextPoint;
            });

            const rangeSales = rangeOrders.reduce((total, order) => total + order.finalAmount, 0);

            return { date: point, toDate: nextPoint, value: rangeSales };
        });

        res.json({
            allTimeSales,
            yearToDate,
            monthToDate,
            today,
            popularItems,
            popularCategories,
            popularCustomers,
            salesOverview
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/items', verifySession, attachUserDataToRequest, requireAdminRole, async (req, res) => {
    try {
        const inStock = req.query.inStock === 'true';
        const deleted = req.query.deleted === 'true';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;

        if (deleted) {
            if (!req.isAuthenticated() || !req.user) {
                return handleUnauthorized(res);
            }
            const {role} = req.user;
            if (role !== 'admin') {
                return handleUnauthorized(res);
            }
        }

        let query = {
            deleted: deleted === false ? false : {$exists: true},
            stock: inStock ? {$gt: 0} : {$gte: 0},
        };

        let items = await Items.find(query).skip((page - 1) * limit).limit(limit);
        const itemStats = {};
        const allOrders = await Order.find();

        for (let order of allOrders) {
            for (let orderItem of order.items) {
                if (!itemStats[orderItem.itemId]) {
                    itemStats[orderItem.itemId] = { purchases: 0, value: 0 };
                }
                itemStats[orderItem.itemId].purchases += orderItem.quantity;
                itemStats[orderItem.itemId].value += orderItem.pricePerItem * orderItem.quantity;
            }
        }

        items = items.map(item => {
            item = item.toObject();
            if (itemStats[item.itemId]) {
                item.purchases = itemStats[item.itemId].purchases;
                item.value = itemStats[item.itemId].value;
            }
            else {
                item.purchases = 0;
                item.value = 0;
            }
            return item;
        });

        const totalItems = await Items.countDocuments(query);
        const maxPages = Math.ceil(totalItems / limit);

        res.json({items: items, maxPages: maxPages});
    }
    catch (error) {
        console.error(error);
        handleServerError(res);
    }
});

router.get('/customers', verifySession, attachUserDataToRequest, requireAdminRole, async (req, res) => {
    try {
        const { page = 1, limit = 12 } = req.query;
        const users = await User.find({}).skip((page - 1) * limit).limit(limit).populate('orders');
        const customers = users.map(user => {
            const ordersCount = user.orders.length;
            const ordersValue = user.orders.reduce((total, order) => total + order.finalAmount, 0); // Added initial value 0
            return {
                email: user.email,
                name: user.name,
                role: user.role,
                balance: user.balance,
                ordersCount: ordersCount,
                ordersValue: ordersValue
            };
        });

        const totalUsers = await User.countDocuments({});
        const maxPages = Math.ceil(totalUsers / limit);

        res.json({ customers, maxPages });
    } catch (error) {
        console.error(error);
        handleServerError(res);
    }
});

router.get('/payments', verifySession, attachUserDataToRequest, requireAdminRole, async (req, res) => {
    try {
        const { page = 1, limit = 12 } = req.query;
        const allOrders = await Order.find().populate('userEmail');
        const payments = allOrders.map(order => {
            const paymentMethod = order.paymentMethod === 'balance' && order.cashAmount === 0 ? 'Balance' : order.paymentMethod === 'balance' && order.cashAmount !== 0 ? 'Cash + Balance' : 'Cash';
            return {
                email: order.userEmail,
                date: order.date,
                amount: order.finalAmount,
                paymentMethod: paymentMethod
            };
        });

        const maxPages = Math.ceil(payments.length / limit);
        const paginatedPayments = payments.slice((page - 1) * limit, page * limit);

        res.json({ payments: paginatedPayments, maxPages: maxPages });
    } catch (error) {
        console.error(error);
        handleServerError(res);
    }
});

module.exports = router;