import api from './api';

// Creates a fake payment session on the backend
export const createFakeOrder = (orderId) => api.post('/payment/create-order', { orderId });

// Verifies (simulates) payment — backend may randomly decline
export const verifyFakePayment = (data) => api.post('/payment/verify', data);

export const getPaymentByOrder = (orderId) => api.get(`/payment/order/${orderId}`);
