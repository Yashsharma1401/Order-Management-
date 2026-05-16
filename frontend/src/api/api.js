import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

// Orders
export const createOrder = (data) => api.post('/orders', data);
export const getOrders = (params) => api.get('/orders', { params });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, data) => api.patch(`/orders/${id}/status`, data);
export const getRecentOrders = (limit = 5) => api.get('/orders/recent', { params: { limit } });

// Stores
export const getStores = () => api.get('/stores');
export const createStore = (data) => api.post('/stores', data);
export const updateStore = (id, data) => api.patch(`/stores/${id}`, data);
export const deleteStore = (id) => api.delete(`/stores/${id}`);

// Analytics
export const getOverview = () => api.get('/analytics/overview');
export const getOrdersPerDay = (days = 7) => api.get('/analytics/orders-per-day', { params: { days } });
export const getRevenuePerStore = () => api.get('/analytics/revenue-per-store');
export const getTopItems = (limit = 5) => api.get('/analytics/top-items', { params: { limit } });

// Archive
export const archiveOldOrders = (days = 30) => api.post('/archive-old-orders', null, { params: { days } });
export const getArchivedOrders = (params) => api.get('/archived-orders', { params });

export default api;
