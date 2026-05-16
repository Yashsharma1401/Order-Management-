const prisma = require('../../db');

const archiveOldOrders = async (days = 30) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const oldOrders = await prisma.order.findMany({
    where: { createdAt: { lt: cutoff } },
  });

  if (oldOrders.length === 0) return { archived: 0, message: 'No orders to archive' };

  // Insert into archive
  await prisma.orderArchive.createMany({
    data: oldOrders.map((o) => ({
      originalId: o.id,
      storeId: o.storeId,
      customer: o.customer,
      items: o.items,
      totalAmount: o.totalAmount,
      status: o.status,
      notes: o.notes,
      originalCreatedAt: o.createdAt,
    })),
  });

  // Delete from main table
  await prisma.order.deleteMany({
    where: { id: { in: oldOrders.map((o) => o.id) } },
  });

  return { archived: oldOrders.length, message: `${oldOrders.length} orders archived successfully` };
};

const getArchivedOrders = async (page = 1, limit = 10, storeId) => {
  const skip = (page - 1) * limit;
  const where = storeId ? { storeId: Number(storeId) } : {};
  const [orders, total] = await Promise.all([
    prisma.orderArchive.findMany({
      where,
      skip,
      take: limit,
      orderBy: { archivedAt: 'desc' },
    }),
    prisma.orderArchive.count({ where }),
  ]);
  return { orders, total, page, totalPages: Math.ceil(total / limit) };
};

module.exports = { archiveOldOrders, getArchivedOrders };
