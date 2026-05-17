const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const User = require('../models/User');

// Helper: generate a fake gateway ID
const fakeId = (prefix) => `${prefix}_fake_${crypto.randomBytes(8).toString('hex')}`;

// @route POST /api/payment/create-order
// Creates a fake payment session — no real gateway call needed
const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (order.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Order already paid.' });
    }

    const fakeOrderId = fakeId('fpord');
    const amountInPaise = Math.round(order.grandTotal * 100);

    // Create a pending payment record
    const payment = await Payment.create({
      order: orderId,
      user: req.user._id,
      razorpayOrderId: fakeOrderId,   // reusing field to store our fake order id
      amount: amountInPaise,
      currency: 'INR',
      status: 'created',
    });

    res.json({
      success: true,
      fakeOrder: {
        id: fakeOrderId,
        amount: amountInPaise,
        currency: 'INR',
        receipt: order.orderNumber,
      },
      payment: { _id: payment._id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/payment/verify
// Simulates payment verification — 90% success, 10% random decline
const verifyPayment = async (req, res) => {
  try {
    const { fakeOrderId, fakePaymentId, orderId } = req.body;

    // Simulate a ~10% card decline
    if (Math.random() < 0.1) {
      return res.status(402).json({
        success: false,
        declined: true,
        message: 'Payment declined by issuing bank. Please try a different method.',
      });
    }

    const realFakePaymentId = fakePaymentId || fakeId('fppay');

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: fakeOrderId },
      {
        razorpayPaymentId: realFakePaymentId,
        razorpaySignature: 'fakepay_simulated',
        status: 'captured',
        paidAt: new Date(),
      },
      { new: true }
    );

    // Mark order as paid
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: 'paid', paymentMethod: 'fakepay', paidAt: new Date() },
      { new: true }
    );

    // Deduct stock & increment sold count
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    // Clear user cart & log purchase
    await User.findByIdAndUpdate(req.user._id, {
      activeCart: [],
      $push: { purchaseHistory: orderId },
    });

    res.json({ success: true, message: 'Payment verified!', order, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/payment/order/:orderId
const getPaymentByOrder = async (req, res) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createRazorpayOrder, verifyPayment, getPaymentByOrder };
