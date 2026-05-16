const router = require('express').Router();
const ctrl = require('./store.controller');

router.get('/', ctrl.getAllStores);
router.get('/:id', ctrl.getStore);
router.post('/', ctrl.createStore);
router.patch('/:id', ctrl.updateStore);
router.delete('/:id', ctrl.deleteStore);

module.exports = router;
