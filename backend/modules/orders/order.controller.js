const orderService = require('./order.service');
const { createOrderSchema, updateStatusSchema } = require('./order.validation');
const { emitOrderCreated, emitOrderUpdated } = require('../../socket/socket.server');

const createOrder = async (req, res) => {
  try {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const order = await orderService.createOrder(parsed.data);
    emitOrderCreated(order);
    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, storeId } = req.query;
    const result = await orderService.getAllOrders(Number(page), Number(limit), status, storeId);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const order = await orderService.getOrderById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const order = await orderService.updateOrderStatus(id, parsed.data.status, parsed.data.notes);
    emitOrderUpdated(order);
    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

const getRecentOrders = async (req, res) => {
  try {
    const orders = await orderService.getRecentOrders(Number(req.query.limit) || 5);
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent orders' });
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateStatus, getRecentOrders };
