const storeService = require('./store.service');

const getAllStores = async (req, res) => {
  try {
    const stores = await storeService.getAllStores();
    res.json({ success: true, stores });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
};

const getStore = async (req, res) => {
  try {
    const store = await storeService.getStoreById(Number(req.params.id));
    if (!store) return res.status(404).json({ error: 'Store not found' });
    res.json({ success: true, store });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch store' });
  }
};

const createStore = async (req, res) => {
  try {
    const { name, location, status } = req.body;
    if (!name || !location) return res.status(400).json({ error: 'Name and location are required' });
    const store = await storeService.createStore({ name, location, status: status || 'active' });
    res.status(201).json({ success: true, store });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create store' });
  }
};

const updateStore = async (req, res) => {
  try {
    const store = await storeService.updateStore(Number(req.params.id), req.body);
    res.json({ success: true, store });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update store' });
  }
};

const deleteStore = async (req, res) => {
  try {
    await storeService.deleteStore(Number(req.params.id));
    res.json({ success: true, message: 'Store deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete store' });
  }
};

module.exports = { getAllStores, getStore, createStore, updateStore, deleteStore };
