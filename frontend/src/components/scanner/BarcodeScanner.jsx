import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'framer-motion';

export default function BarcodeScanner({ onScan, onError }) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  const startScanner = async () => {
    try {
      html5QrRef.current = new Html5Qrcode('barcode-reader');
      await html5QrRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 280, height: 180 } },
        (decodedText) => {
          onScan(decodedText);
        },
        () => {} // Suppress scan errors
      );
      setIsScanning(true);
    } catch (err) {
      setHasCamera(false);
      onError?.('Camera not available. Please allow camera access.');
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current && isScanning) {
      await html5QrRef.current.stop();
      setIsScanning(false);
    }
  };

  useEffect(() => {
    startScanner();
    return () => { stopScanner(); };
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Scanner viewport */}
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
        <div id="barcode-reader" className="w-full h-full" />

        {/* Overlay frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-64 h-40 scanner-frame">
            {/* Animated scan line */}
            <div className="scan-line" />
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-400 rounded-br-lg" />
          </div>
        </div>

        {/* Status indicator */}
        {isScanning && (
          <div className="absolute top-3 right-3 flex items-center gap-2 glass rounded-full px-3 py-1">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-xs text-white/80">Scanning</span>
          </div>
        )}
      </div>

      {!hasCamera && (
        <div className="mt-4 glass-card p-4 text-center">
          <p className="text-red-400 text-sm">📷 Camera unavailable.</p>
          <p className="text-white/50 text-xs mt-1">Please allow camera permissions in your browser settings.</p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {!isScanning ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startScanner}
            className="btn-primary w-full"
          >
            🎥 Start Camera
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={stopScanner}
            className="btn-secondary w-full"
          >
            ⏹ Stop Camera
          </motion.button>
        )}
      </div>

      <p className="text-center text-white/40 text-xs mt-3">
        Point camera at a product barcode or QR code
      </p>
    </div>
  );
}
