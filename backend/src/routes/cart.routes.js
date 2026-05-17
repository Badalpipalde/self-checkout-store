const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/clear', clearCart);
router.delete('/:productId', removeFromCart);

module.exports = router;
