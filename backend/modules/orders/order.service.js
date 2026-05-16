const prisma = require('../../db');

const createOrder = async ({ storeId, customer, items, notes }) => {
  const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  return prisma.order.create({
    data: { storeId, customer, items, totalAmount, notes },
    include: { store: true },
  });
};

const getOrdersByStore = async (storeId, page = 1, limit = 10, status) => {
  const skip = (page - 1) * limit;
  const where = { storeId, ...(status ? { status } : {}) };
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { store: { select: { name: true } } },
    }),
    prisma.order.count({ where }),
  ]);
  return { orders, total, page, totalPages: Math.ceil(total / limit) };
};

const getAllOrders = async (page = 1, limit = 10, status, storeId) => {
  const skip = (page - 1) * limit;
  const where = {
    ...(storeId ? { storeId: Number(storeId) } : {}),
    ...(status ? { status } : {}),
  };
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { store: { select: { name: true } } },
    }),
    prisma.order.count({ where }),
  ]);
  return { orders, total, page, totalPages: Math.ceil(total / limit) };
};

const getOrderById = async (id) => {
  return prisma.order.findUnique({
    where: { id },
    include: { store: true },
  });
};

const updateOrderStatus = async (id, status, notes) => {
  return prisma.order.update({
    where: { id },
    data: { status, ...(notes ? { notes } : {}) },
    include: { store: true },
  });
};

const getRecentOrders = async (limit = 5) => {
  return prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { store: { select: { name: true } } },
  });
};

const getTodayOrderCount = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return prisma.order.count({ where: { createdAt: { gte: today } } });
};

module.exports = {
  createOrder,
  getOrdersByStore,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getRecentOrders,
  getTodayOrderCount,
};
