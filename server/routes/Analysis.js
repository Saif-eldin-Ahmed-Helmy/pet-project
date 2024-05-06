const express = require('express');
const router = express.Router();
const Order = require("../models/Order");
const moment = require('moment');
const { verifySession } = require('../middlewares/auth');
const { attachUserDataToRequest } = require("../middlewares/attachUserData");
const { requireAdminRole } = require('../middlewares/auth');

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

module.exports = router;