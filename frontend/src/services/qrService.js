import api from './api';
export const generateQR = (orderId) => api.post(`/qr/generate/${orderId}`);
export const getQRByOrder = (orderId) => api.get(`/qr/${orderId}`);
export const verifyQR = (token) => api.post('/qr/verify', { token });
