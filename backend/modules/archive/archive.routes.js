const router = require('express').Router();
const ctrl = require('./archive.controller');

router.post('/archive-old-orders', ctrl.archiveOldOrders);
router.get('/archived-orders', ctrl.getArchivedOrders);

module.exports = router;
