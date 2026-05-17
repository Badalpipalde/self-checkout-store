import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addItem } from '../../store/cartSlice';
import toast from 'react-hot-toast';

export default function ProductCard({ product, onClose }) {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} in stock!`);
      return;
    }
    dispatch(addItem({ product, quantity }));
    toast.success(`${product.name} added to cart! 🛒`);
    onClose?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        className="glass-card p-5 relative"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full glass flex items-center justify-center text-white/60 hover:text-white"
        >
          ✕
        </button>

        <div className="flex gap-4">
          {/* Product Image */}
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-brand-400 font-medium uppercase tracking-wide">{product.category}</p>
            <h3 className="font-display font-bold text-white text-lg leading-tight mt-0.5 truncate">{product.name}</h3>
            {product.brand && <p className="text-white/40 text-xs mt-0.5">{product.brand}</p>}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-2xl font-bold text-gradient">₹{product.price}</span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-white/30 text-sm line-through">₹{product.mrp}</span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-accent-green' : 'bg-red-400'}`} />
              <span className="text-xs text-white/50">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>
        </div>

        {/* GST Info */}
        <p className="text-xs text-white/30 mt-2">+ {product.gstRate || 18}% GST applicable</p>

        {/* Quantity + Add */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center gap-2 glass rounded-xl px-2 py-1.5">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition-colors"
            >
              −
            </button>
            <span className="w-8 text-center text-white font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition-colors"
            >
              +
            </button>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn-primary flex-1"
          >
            🛒 Add to Cart
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
