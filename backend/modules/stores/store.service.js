const prisma = require('../../db');

const getAllStores = async () => {
  return prisma.store.findMany({ orderBy: { createdAt: 'desc' } });
};

const getStoreById = async (id) => {
  return prisma.store.findUnique({ where: { id } });
};

const createStore = async (data) => {
  return prisma.store.create({ data });
};

const updateStore = async (id, data) => {
  return prisma.store.update({ where: { id }, data });
};

const deleteStore = async (id) => {
  return prisma.store.delete({ where: { id } });
};

const seedStores = async () => {
  const count = await prisma.store.count();
  if (count === 0) {
    await prisma.store.createMany({
      data: [
        { name: 'Store A', location: 'New York, USA', status: 'active' },
        { name: 'Store B', location: 'Los Angeles, USA', status: 'active' },
        { name: 'Store C', location: 'Chicago, USA', status: 'active' },
        { name: 'Store D', location: 'Houston, USA', status: 'inactive' },
      ],
    });
    console.log('✅ Stores seeded');

    const stores = await prisma.store.findMany();
    const orders = [];
    const statuses = ['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'];
    const fakeItems = [
      { name: 'Burger', unitPrice: 12 },
      { name: 'Fries', unitPrice: 5 },
      { name: 'Soda', unitPrice: 3 },
      { name: 'Pizza', unitPrice: 20 },
      { name: 'Salad', unitPrice: 10 },
    ];
    
    for (const store of stores) {
      for (let i = 0; i < 5; i++) {
        // Randomly pick 2 items
        const item1 = fakeItems[Math.floor(Math.random() * fakeItems.length)];
        const item2 = fakeItems[Math.floor(Math.random() * fakeItems.length)];
        const items = [
          { name: item1.name, quantity: 1, unitPrice: item1.unitPrice },
          { name: item2.name, quantity: 2, unitPrice: item2.unitPrice },
        ];
        const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

        orders.push({
          storeId: store.id,
          customer: `Customer ${i + 1} (${store.name})`,
          items,
          totalAmount,
          status: statuses[Math.floor(Math.random() * statuses.length)],
        });
      }
    }
    await prisma.order.createMany({ data: orders });
    console.log('✅ Fake orders seeded');
  }
};

module.exports = { getAllStores, getStoreById, createStore, updateStore, deleteStore, seedStores };
