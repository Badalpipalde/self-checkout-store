const { generateQRCode, decrypt } = require('../utils/generateQR');
const QRVerification = require('../models/QRVerification');
const Order = require('../models/Order');

// @route POST /api/qr/generate/:orderId
const generateQR = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Order must be paid to generate QR.' });
    }
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Check if QR already exists
    const existing = await QRVerification.findOne({ order: order._id, isUsed: false });
    if (existing && existing.expiresAt > new Date()) {
      return res.json({ success: true, qrVerification: existing });
    }

    const { token, qrDataUrl } = await generateQRCode(order._id.toString(), 'paid', req.user._id.toString());

    const qrVerification = await QRVerification.create({
      order: order._id,
      user: req.user._id,
      token,
      qrCodeDataUrl: qrDataUrl,
      ipAddress: req.ip,
    });

    res.json({ success: true, qrVerification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/qr/verify
const verifyQR = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Token is required.' });

    // Decrypt token
    let payload;
    try {
      payload = JSON.parse(decrypt(token));
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid or tampered QR code.' });
    }

    const qrVerification = await QRVerification.findOne({ token })
      .populate('order')
      .populate('user', 'name email phone avatar');

    if (!qrVerification) {
      return res.status(404).json({ success: false, message: 'QR code not found.' });
    }
    if (qrVerification.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'QR code already used.',
        usedAt: qrVerification.usedAt,
      });
    }
    if (qrVerification.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'QR code expired.' });
    }
    if (qrVerification.order.status !== 'paid' && qrVerification.order.status !== 'verified') {
      return res.status(400).json({ success: false, message: 'Payment not confirmed for this order.' });
    }

    // Mark as verified
    qrVerification.isUsed = true;
    qrVerification.usedAt = new Date();
    qrVerification.verifiedBy = req.user._id;
    qrVerification.verifiedAt = new Date();
    await qrVerification.save();

    // Update order status
    await Order.findByIdAndUpdate(qrVerification.order._id, {
      status: 'exited',
      exitedAt: new Date(),
    });

    res.json({
      success: true,
      message: '✅ Payment verified! Customer may exit.',
      customer: qrVerification.user,
      order: qrVerification.order,
      verifiedAt: qrVerification.verifiedAt,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/qr/:orderId
const getQRByOrder = async (req, res) => {
  try {
    const qr = await QRVerification.findOne({ order: req.params.orderId });
    if (!qr) return res.status(404).json({ success: false, message: 'QR not found.' });
    res.json({ success: true, qrVerification: qr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generateQR, verifyQR, getQRByOrder };
