import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectCartSubtotal, selectCartGST, selectCartTotal } from '../../store/cartSlice';

export default function CartSummary({ onCheckout, loading }) {
  const subtotal = useSelector(selectCartSubtotal);
  const gst = useSelector(selectCartGST);
  const total = useSelector(selectCartTotal);

  const Row = ({ label, value, highlight }) => (
    <div className={`flex justify-between items-center ${highlight ? 'border-t border-white/10 pt-3 mt-1' : ''}`}>
      <span className={`${highlight ? 'text-white font-bold text-lg' : 'text-white/60 text-sm'}`}>{label}</span>
      <span className={`${highlight ? 'text-gradient font-bold text-xl' : 'text-white text-sm'}`}>{value}</span>
    </div>
  );

  return (
    <div className="glass-card p-6 space-y-3 sticky top-24">
      <h3 className="font-display font-bold text-white text-lg mb-4">Order Summary</h3>
      <Row label="Subtotal" value={`₹${subtotal.toFixed(2)}`} />
      <Row label="GST (18%)" value={`₹${gst.toFixed(2)}`} />
      <Row label="Delivery" value="Free 🎉" />
      <Row label="Total Payable" value={`₹${total.toFixed(2)}`} highlight />

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onCheckout}
        disabled={loading}
        className="btn-primary w-full mt-4 text-base"
        id="checkout-btn"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          '🔒 Proceed to Payment'
        )}
      </motion.button>

      <p className="text-center text-white/30 text-xs mt-2">
        🔐 Secured with 256-bit encryption
      </p>
    </div>
  );
}
