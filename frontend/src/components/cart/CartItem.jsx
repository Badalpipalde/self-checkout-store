import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { removeItem, updateQuantity } from '../../store/cartSlice';
import toast from 'react-hot-toast';

export default function CartItem({ item }) {
  const dispatch = useDispatch();
  const { product, quantity } = item;

  const handleQtyChange = (newQty) => {
    if (newQty > product.stock) {
      toast.error(`Only ${product.stock} available`);
      return;
    }
    dispatch(updateQuantity({ productId: product._id, quantity: newQty }));
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="glass-card p-4 flex gap-4 items-center"
    >
      {/* Image */}
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold truncate">{product.name}</p>
        <p className="text-white/40 text-xs">{product.category}</p>
        <p className="text-brand-400 font-bold mt-1">₹{product.price} <span className="text-white/30 font-normal text-xs">/ unit</span></p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 glass rounded-xl px-1.5 py-1">
          <button
            onClick={() => handleQtyChange(quantity - 1)}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition-colors"
          >
            −
          </button>
          <span className="w-8 text-center text-white font-semibold text-sm">{quantity}</span>
          <button
            onClick={() => handleQtyChange(quantity + 1)}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition-colors"
          >
            +
          </button>
        </div>

        <button
          onClick={() => dispatch(removeItem(product._id))}
          className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors"
        >
          🗑
        </button>
      </div>

      {/* Line Total */}
      <div className="text-right min-w-[60px]">
        <p className="text-white font-bold">₹{(product.price * quantity).toFixed(2)}</p>
      </div>
    </motion.div>
  );
}
