import { motion } from 'framer-motion';

export default function QRDisplay({ qrDataUrl, orderId, onDownload }) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `scancart-receipt-${orderId}.png`;
    link.click();
    onDownload?.();
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="flex flex-col items-center gap-6"
    >
      {/* QR Frame */}
      <div className="relative">
        <div className="absolute inset-0 bg-brand-gradient rounded-3xl blur-2xl opacity-30 scale-110" />
        <div className="relative glass-card p-6 rounded-3xl glow-brand">
          <div className="bg-white rounded-2xl p-3">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Payment QR Code"
                className="w-56 h-56 object-contain"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-surface-900">
                Loading QR...
              </div>
            )}
          </div>

          {/* Corner decorators */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-brand-400 rounded-tl-lg opacity-60" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-brand-400 rounded-tr-lg opacity-60" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-brand-400 rounded-bl-lg opacity-60" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-brand-400 rounded-br-lg opacity-60" />
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-white/50 text-sm">Order ID</p>
        <p className="text-white/80 font-mono text-xs bg-white/5 px-3 py-1.5 rounded-lg">{orderId}</p>
        <p className="text-white/40 text-xs mt-2">Valid for 4 hours · Show to staff at exit</p>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleDownload}
        className="btn-secondary flex items-center gap-2"
        id="download-qr-btn"
      >
        ⬇️ Download QR Code
      </motion.button>
    </motion.div>
  );
}
