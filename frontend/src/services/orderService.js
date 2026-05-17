import api from './api';
export const createOrder = (items) => api.post('/orders/create', { items });
export const getMyOrders = () => api.get('/orders/my');
export const getOrderById = (id) => api.get(`/orders/${id}`);
