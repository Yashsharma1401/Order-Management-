import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import useAppStore from '../store/useAppStore';

let socket = null;

const useSocket = () => {
  const addNotification = useAppStore((s) => s.addNotification);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || '/';
    socket = io(socketUrl, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => console.log('🔌 Socket connected:', socket.id));
    socket.on('disconnect', () => console.log('🔌 Socket disconnected'));

    socket.on('order_created', (order) => {
      const msg = `New order #${order.id} from ${order.store?.name || 'Store'} — $${order.totalAmount.toFixed(2)}`;
      toast.success(msg, { duration: 5000, icon: '🛒' });
      addNotification({ type: 'order_created', message: msg, order });
    });

    socket.on('order_updated', (order) => {
      const msg = `Order #${order.id} status → ${order.status}`;
      toast(msg, { duration: 4000, icon: '📦' });
      addNotification({ type: 'order_updated', message: msg, order });
    });

    return () => {
      if (socket) { socket.disconnect(); socket = null; initialized.current = false; }
    };
  }, []);

  const joinStore = (storeId) => socket?.emit('join_store', storeId);
  const leaveStore = (storeId) => socket?.emit('leave_store', storeId);

  return { socket, joinStore, leaveStore };
};

export default useSocket;
