const router = require('express').Router();
const ctrl = require('./analytics.controller');

router.get('/overview', ctrl.getOverview);
router.get('/orders-per-day', ctrl.getOrdersPerDay);
router.get('/revenue-per-store', ctrl.getRevenuePerStore);
router.get('/top-items', ctrl.getTopItems);

module.exports = router;
