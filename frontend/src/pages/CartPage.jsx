import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, selectCartItems, selectCartTotal } from '../store/cartSlice';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import { createOrder } from '../services/orderService';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!items.length) return;
    setLoading(true);
    try {
      const res = await createOrder(items);
      const orderId = res.data.order._id;
      toast.success('Order created! Proceeding to payment... 💳');
      navigate(`/payment/${orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="page-container text-center py-24">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="font-display text-2xl font-bold text-white">Your cart is empty</h2>
          <p className="text-white/40 mt-2 mb-8">Scan some products to get started!</p>
          <Link to="/scan" id="start-scanning-btn" className="btn-primary inline-block">
            📱 Start Scanning
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">
          Shopping Cart <span className="text-gradient">({items.length})</span>
        </h1>
        <button
          onClick={() => dispatch(clearCart())}
          className="text-red-400/60 hover:text-red-400 text-sm transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <CartItem key={item.product._id} item={item} />
            ))}
          </AnimatePresence>
          <Link
            to="/scan"
            id="continue-scanning-btn"
            className="block text-center text-brand-400 hover:text-brand-300 text-sm font-medium py-4 glass-card"
          >
            + Scan More Products
          </Link>
        </div>

        {/* Summary */}
        <div>
          <CartSummary onCheckout={handleCheckout} loading={loading} />
        </div>
      </div>
    </div>
  );
}
