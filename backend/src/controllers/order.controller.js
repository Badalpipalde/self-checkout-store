const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

const GST_RATE = 0.18; // 18% default GST

// @route POST /api/orders/create
// Accepts cart items from request body (frontend Redux cart)
const createOrder = async (req, res) => {
  try {
    const { items: clientItems } = req.body;

    if (!clientItems || !clientItems.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    const items = [];
    let subtotal = 0;

    for (const cartItem of clientItems) {
      // Support both { product: { _id } } and { product: "id_string" }
      const productId = cartItem.product?._id || cartItem.product;
      const product = await Product.findById(productId);

      if (!product) continue;

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} left.`,
        });
      }

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
        barcode: product.barcode,
      });
      subtotal += product.price * cartItem.quantity;
    }

    if (!items.length) {
      return res.status(400).json({ success: false, message: 'No valid products found in cart.' });
    }

    const gstAmount  = parseFloat((subtotal * GST_RATE).toFixed(2));
    const grandTotal = parseFloat((subtotal + gstAmount).toFixed(2));

    const order = await Order.create({
      user: req.user._id,
      items,
      subtotal,
      gstAmount,
      grandTotal,
      status: 'pending',
    });

    res.status(201).json({ success: true, message: 'Order created!', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt').limit(50);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role === 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById };
