const { Server } = require('socket.io');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join a store-specific room for targeted updates
    socket.on('join_store', (storeId) => {
      socket.join(`store_${storeId}`);
      console.log(`Socket ${socket.id} joined room store_${storeId}`);
    });

    socket.on('leave_store', (storeId) => {
      socket.leave(`store_${storeId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

// Emit to all clients + specific store room
const emitOrderCreated = (order) => {
  const io = getIO();
  io.emit('order_created', order);
  io.to(`store_${order.storeId}`).emit('order_created_store', order);
};

const emitOrderUpdated = (order) => {
  const io = getIO();
  io.emit('order_updated', order);
  io.to(`store_${order.storeId}`).emit('order_updated_store', order);
};

module.exports = { initSocket, getIO, emitOrderCreated, emitOrderUpdated };
