import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { generateQR } from '../services/qrService';
import { getOrderById } from '../services/orderService';
import QRDisplay from '../components/qr/QRDisplay';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

export default function QRSuccessPage() {
  const { orderId } = useParams();
  const [qrData, setQrData] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [qrRes, orderRes] = await Promise.all([
          generateQR(orderId),
          getOrderById(orderId),
        ]);
        setQrData(qrRes.data.qrVerification);
        setOrder(orderRes.data.order);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to generate QR');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [orderId]);

  if (loading) return <Loader fullScreen text="Generating your exit QR..." />;

  return (
    <div className="page-container max-w-lg text-center">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="mb-8"
      >
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-accent-green/20 rounded-full blur-2xl scale-150" />
          <div className="relative w-20 h-20 bg-success-gradient rounded-full flex items-center justify-center text-4xl mx-auto">
            ✓
          </div>
        </div>
        <h1 className="font-display text-3xl font-black text-white mt-6">
          Payment <span className="text-gradient-success">Successful!</span>
        </h1>
        <p className="text-white/50 mt-2">Your exit QR code is ready. Show it to staff at the exit.</p>
      </motion.div>

      {/* QR Code */}
      {qrData?.qrCodeDataUrl && (
        <QRDisplay
          qrDataUrl={qrData.qrCodeDataUrl}
          orderId={orderId}
          onDownload={() => toast.success('QR saved!')}
        />
      )}

      {/* Order Details */}
      {order && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5 mt-8 text-left"
        >
          <h3 className="font-semibold text-white mb-3">Receipt Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Order No.</span>
              <span className="text-white font-mono text-xs">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Items</span>
              <span className="text-white">{order.items.length} products</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Amount Paid</span>
              <span className="text-accent-green font-bold">₹{order.grandTotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">QR Valid Until</span>
              <span className="text-white/70 text-xs">
                {qrData?.expiresAt ? new Date(qrData.expiresAt).toLocaleTimeString() : '4 hours'}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 glass p-4 rounded-2xl"
      >
        <p className="text-white/50 text-sm">
          🔔 <strong className="text-white/80">Next Step:</strong> Walk to the store exit and show this QR code to the staff member for verification.
        </p>
      </motion.div>
    </div>
  );
}
