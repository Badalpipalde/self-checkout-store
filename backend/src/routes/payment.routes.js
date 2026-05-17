const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment, getPaymentByOrder } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);
router.get('/order/:orderId', getPaymentByOrder);

module.exports = router;
