const express = require('express');
const router = express.Router();
const { generateQR, verifyQR, getQRByOrder } = require('../controllers/qr.controller');
const { protect } = require('../middleware/auth.middleware');
const { staffOrAdmin } = require('../middleware/staff.middleware');

router.post('/generate/:orderId', protect, generateQR);
router.get('/:orderId', protect, getQRByOrder);
router.post('/verify', protect, staffOrAdmin, verifyQR);

module.exports = router;
