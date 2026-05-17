const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllOrders, getDailyRevenue, getTopProducts, getAllUsers, updateUserRole } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

router.use(protect, adminOnly);
router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.get('/analytics/daily-revenue', getDailyRevenue);
router.get('/analytics/top-products', getTopProducts);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
