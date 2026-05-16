const router = require('express').Router();
const ctrl = require('./order.controller');

router.post('/', ctrl.createOrder);
router.get('/', ctrl.getOrders);
router.get('/recent', ctrl.getRecentOrders);
router.get('/:id', ctrl.getOrderById);
router.patch('/:id/status', ctrl.updateStatus);

module.exports = router;
