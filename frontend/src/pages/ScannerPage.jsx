import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import BarcodeScanner from '../components/scanner/BarcodeScanner';
import ProductCard from '../components/scanner/ProductCard';
import { getProductByBarcode } from '../services/productService';
import { selectCartCount } from '../store/cartSlice';
import toast from 'react-hot-toast';

const SAMPLE_BARCODES = [
  { barcode: '8901030864817', name: "Lay's Classic",   price: '₹20' },
  { barcode: '8906001700045', name: 'Amul Gold Milk',  price: '₹28' },
  { barcode: '8901719117954', name: 'Maggi Noodles',   price: '₹14' },
  { barcode: '8906007432088', name: 'Parle-G',          price: '₹10' },
  { barcode: '8901058006131', name: 'Coca-Cola 750ml',  price: '₹40' },
  { barcode: '8901063031456', name: 'Tropicana Juice',  price: '₹65' },
];

export default function ScannerPage() {
  const [scannedProduct, setScannedProduct] = useState(null);
  const [loadingProduct, setLoadingProduct]  = useState(false);
  const [lastScanned, setLastScanned]        = useState('');
  const [mode, setMode]                      = useState('manual'); // 'camera' | 'manual'
  const [manualBarcode, setManualBarcode]    = useState('');
  const cartCount = useSelector(selectCartCount);

  const handleScan = useCallback(async (barcode) => {
    const code = barcode.trim();
    if (!code || code === lastScanned || loadingProduct) return;
    setLastScanned(code);
    setLoadingProduct(true);
    try {
      const res = await getProductByBarcode(code);
      setScannedProduct(res.data.product);
      toast.success('Product found! 📦');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Product not found for this barcode');
      setTimeout(() => setLastScanned(''), 2000);
    } finally {
      setLoadingProduct(false);
    }
  }, [lastScanned, loadingProduct]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) handleScan(manualBarcode.trim());
  };

  const handleClose = () => {
    setScannedProduct(null);
    setLastScanned('');
    setManualBarcode('');
  };

  return (
    <div className="page-container max-w-2xl">
      <div className="text-center mb-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="section-title text-3xl md:text-4xl font-display">
            <span className="text-gradient">Scan Products</span>
          </h1>
          <p className="text-white/50 mt-2">Use your camera or enter a barcode manually</p>
        </motion.div>
      </div>

      {/* Cart indicator */}
      {cartCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between glass-card p-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛒</span>
            <div>
              <p className="text-white font-semibold">{cartCount} item{cartCount > 1 ? 's' : ''} in cart</p>
              <p className="text-white/40 text-xs">Keep scanning or proceed to checkout</p>
            </div>
          </div>
          <Link to="/cart" id="go-to-cart-btn" className="btn-primary !py-2 !px-4 text-sm">
            View Cart →
          </Link>
        </motion.div>
      )}

      {/* Mode Tabs */}
      <div className="flex glass rounded-2xl p-1 mb-6 gap-1">
        {[
          { key: 'manual', label: '⌨️ Enter Barcode', id: 'tab-manual' },
          { key: 'camera', label: '📷 Camera Scan',   id: 'tab-camera' },
        ].map((tab) => (
          <button
            key={tab.key}
            id={tab.id}
            onClick={() => { setMode(tab.key); handleClose(); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              mode === tab.key
                ? 'bg-brand-gradient text-white shadow-lg shadow-brand-600/30'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!scannedProduct ? (
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* ── MANUAL MODE ── */}
            {mode === 'manual' && (
              <div className="space-y-5">
                <form onSubmit={handleManualSubmit} className="glass-card p-6">
                  <label className="text-white/60 text-sm mb-2 block font-medium">
                    Enter or paste a barcode number
                  </label>
                  <div className="flex gap-3">
                    <input
                      id="barcode-input"
                      type="text"
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      placeholder="e.g. 8901719117954"
                      className="input-field flex-1 font-mono tracking-wider"
                      autoFocus
                    />
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      id="lookup-barcode-btn"
                      disabled={loadingProduct || !manualBarcode.trim()}
                      className="btn-primary !px-6 whitespace-nowrap"
                    >
                      {loadingProduct ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : 'Find →'}
                    </motion.button>
                  </div>
                </form>

                {/* Quick-pick sample products */}
                <div className="glass-card p-5">
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
                    🧪 Test Products — Click to Load Instantly
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SAMPLE_BARCODES.map((item) => (
                      <motion.button
                        key={item.barcode}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleScan(item.barcode)}
                        disabled={loadingProduct}
                        className="glass rounded-xl p-3 text-left hover:border-brand-500/40 hover:bg-white/8 transition-all duration-200 disabled:opacity-50"
                      >
                        <p className="text-white text-sm font-semibold truncate">{item.name}</p>
                        <p className="text-accent-green text-xs font-bold mt-0.5">{item.price}</p>
                        <p className="text-white/25 font-mono text-[10px] mt-1 truncate">{item.barcode}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── CAMERA MODE ── */}
            {mode === 'camera' && (
              <div className="space-y-4">
                <BarcodeScanner onScan={handleScan} onError={(err) => toast.error(err)} />
                {loadingProduct && (
                  <div className="glass-card p-4 text-center">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-white/50 text-sm mt-2">Fetching product details...</p>
                  </div>
                )}
                <div className="glass-card p-4">
                  <p className="text-white/40 text-xs mb-3 uppercase tracking-widest font-medium">
                    Or click a test product
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_BARCODES.map((item) => (
                      <button
                        key={item.barcode}
                        onClick={() => handleScan(item.barcode)}
                        disabled={loadingProduct}
                        className="glass rounded-lg px-3 py-1.5 text-xs text-white/70 hover:text-white hover:border-brand-500/40 transition-all"
                      >
                        {item.name} <span className="text-accent-green">{item.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* Product Result */
          <motion.div
            key="product"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ProductCard product={scannedProduct} onClose={handleClose} />
            <div className="mt-4 text-center">
              <button
                id="scan-another-btn"
                onClick={handleClose}
                className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
              >
                ← Scan another product
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
