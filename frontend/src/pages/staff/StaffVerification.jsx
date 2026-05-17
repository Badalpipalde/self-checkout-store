import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRScanner from '../../components/qr/QRScanner';
import { verifyQR } from '../../services/qrService';
import toast from 'react-hot-toast';

export default function StaffVerification() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleQRScan = async (token) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    try {
      const res = await verifyQR(token);
      setResult({ success: true, data: res.data });
      toast.success('✅ Customer verified! Allow exit.');
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Verification failed' });
      toast.error(err.response?.data?.message || 'Invalid QR code');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setResult(null); setScanned(false); };

  return (
    <div className="page-container max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            🔍
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Staff Verification</h1>
          <p className="text-white/40 mt-2">Scan customer QR code to verify payment</p>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="scanner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-card p-6">
                <QRScanner onScan={handleQRScan} onError={(e) => toast.error(e)} />
                {loading && (
                  <div className="mt-4 text-center">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-white/50 text-sm mt-2">Verifying payment...</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-8"
            >
              {result.success ? (
                <div className="text-center space-y-6">
                  {/* Success */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-20 h-20 bg-success-gradient rounded-full flex items-center justify-center text-4xl mx-auto glow-success"
                  >
                    ✓
                  </motion.div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-white">Payment Verified!</h2>
                    <p className="text-accent-green mt-1">Customer may exit the store</p>
                  </div>

                  {/* Customer Info */}
                  <div className="glass p-5 rounded-2xl text-left space-y-3">
                    <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                      <div className="w-12 h-12 bg-brand-gradient rounded-xl flex items-center justify-center text-xl font-bold text-white">
                        {result.data.customer?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{result.data.customer?.name}</p>
                        <p className="text-white/40 text-sm">{result.data.customer?.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-white/40">Order No.</p>
                        <p className="text-white font-mono text-xs">{result.data.order?.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-white/40">Amount Paid</p>
                        <p className="text-accent-green font-bold">₹{result.data.order?.grandTotal?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-white/40">Items</p>
                        <p className="text-white">{result.data.order?.items?.length} products</p>
                      </div>
                      <div>
                        <p className="text-white/40">Verified At</p>
                        <p className="text-white text-xs">
                          {new Date(result.data.verifiedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button onClick={reset} id="scan-next-btn" className="btn-primary w-full">
                    Scan Next Customer →
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center text-4xl mx-auto">
                    ✗
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white">Verification Failed</h2>
                  <p className="text-red-400">{result.message}</p>
                  <button onClick={reset} className="btn-secondary w-full">Try Again</button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
