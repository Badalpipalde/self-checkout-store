import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'framer-motion';

export default function QRScanner({ onScan, onError }) {
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  const start = async () => {
    try {
      scannerRef.current = new Html5Qrcode('qr-reader');
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 5, qrbox: { width: 250, height: 250 } },
        (text) => { onScan(text); },
        () => {}
      );
      setScanning(true);
    } catch (err) {
      onError?.('Camera unavailable: ' + err);
    }
  };

  const stop = async () => {
    if (scannerRef.current && scanning) {
      await scannerRef.current.stop();
      setScanning(false);
    }
  };

  useEffect(() => {
    start();
    return () => { stop(); };
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-w-xs mx-auto">
        <div id="qr-reader" className="w-full h-full" />
        {scanning && (
          <>
            <div className="absolute inset-0 border-2 border-brand-500/30 rounded-2xl pointer-events-none" />
            <div className="scan-line" />
            <div className="absolute top-3 right-3 flex items-center gap-2 glass rounded-full px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              <span className="text-xs text-white/80">Live</span>
            </div>
          </>
        )}
      </div>
      <div className="flex gap-2 max-w-xs mx-auto">
        {!scanning ? (
          <motion.button whileTap={{ scale: 0.95 }} onClick={start} className="btn-primary w-full text-sm">
            📷 Start Webcam
          </motion.button>
        ) : (
          <motion.button whileTap={{ scale: 0.95 }} onClick={stop} className="btn-secondary w-full text-sm">
            ⏹ Stop
          </motion.button>
        )}
      </div>
      <p className="text-center text-white/40 text-xs">Point webcam at customer's QR code</p>
    </div>
  );
}
