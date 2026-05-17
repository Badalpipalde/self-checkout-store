const User = require('../models/User');
const Product = require('../models/Product');

// @route GET /api/cart
const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('activeCart.product');
    const cartItems = user.activeCart.filter((item) => item.product !== null);
    const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    res.json({ success: true, cart: cartItems, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/cart/add
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} units in stock.` });
    }
    const user = await User.findById(req.user._id);
    const existingItem = user.activeCart.find((item) => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      user.activeCart.push({ product: productId, quantity: Number(quantity) });
    }
    await user.save();
    await user.populate('activeCart.product');
    res.json({ success: true, message: 'Added to cart!', cart: user.activeCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/cart/update
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = await User.findById(req.user._id);
    const item = user.activeCart.find((item) => item.product.toString() === productId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart.' });
    if (quantity <= 0) {
      user.activeCart = user.activeCart.filter((item) => item.product.toString() !== productId);
    } else {
      item.quantity = Number(quantity);
    }
    await user.save();
    await user.populate('activeCart.product');
    res.json({ success: true, cart: user.activeCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/cart/:productId
const removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.activeCart = user.activeCart.filter(
      (item) => item.product.toString() !== req.params.productId
    );
    await user.save();
    await user.populate('activeCart.product');
    res.json({ success: true, message: 'Removed from cart.', cart: user.activeCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/cart/clear
const clearCart = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { activeCart: [] });
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
