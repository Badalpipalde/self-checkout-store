import api from './api';
export const getProductByBarcode = (barcode) => api.get(`/products/barcode/${barcode}`);
export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (id) => api.delete(`/products/${id}`);
