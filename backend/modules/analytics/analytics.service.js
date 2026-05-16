const prisma = require('../../db');

const getOrdersPerDay = async (days = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true, totalAmount: true },
    orderBy: { createdAt: 'asc' },
  });

  // Group by date
  const grouped = {};
  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const key = d.toISOString().split('T')[0];
    grouped[key] = { date: key, orders: 0, revenue: 0 };
  }

  orders.forEach((o) => {
    const key = o.createdAt.toISOString().split('T')[0];
    if (grouped[key]) {
      grouped[key].orders++;
      grouped[key].revenue += o.totalAmount;
    }
  });

  return Object.values(grouped);
};

const getRevenuePerStore = async () => {
  const stores = await prisma.store.findMany({
    include: {
      orders: { select: { totalAmount: true, status: true } },
    },
  });

  return stores.map((s) => ({
    storeId: s.id,
    storeName: s.name,
    totalRevenue: s.orders.reduce((sum, o) => sum + o.totalAmount, 0),
    totalOrders: s.orders.length,
    completedOrders: s.orders.filter((o) => o.status === 'COMPLETED').length,
  }));
};

const getTopItems = async (limit = 5) => {
  const orders = await prisma.order.findMany({
    select: { items: true },
  });

  const itemMap = {};
  orders.forEach((order) => {
    const items = Array.isArray(order.items) ? order.items : [];
    items.forEach((item) => {
      if (!itemMap[item.name]) itemMap[item.name] = { name: item.name, count: 0, revenue: 0 };
      itemMap[item.name].count += item.quantity;
      itemMap[item.name].revenue += item.quantity * item.unitPrice;
    });
  });

  return Object.values(itemMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

const getOverviewStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalOrders, totalRevenueData, ordersToday, activeStores, statusCounts] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.store.count({ where: { status: 'active' } }),
    prisma.order.groupBy({ by: ['status'], _count: { status: true } }),
  ]);

  const statusDist = {};
  statusCounts.forEach((s) => (statusDist[s.status] = s._count.status));

  return {
    totalOrders,
    totalRevenue: totalRevenueData._sum.totalAmount || 0,
    ordersToday,
    activeStores,
    statusDistribution: statusDist,
  };
};

module.exports = { getOrdersPerDay, getRevenuePerStore, getTopItems, getOverviewStats };
