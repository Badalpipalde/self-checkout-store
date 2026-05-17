import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { getOrderById } from '../services/orderService';
import { createFakeOrder, verifyFakePayment } from '../services/paymentService';
import { clearCart } from '../store/cartSlice';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

// ── Payment method definitions ───────────────────────────────────────────────
const METHODS = [
  {
    id: 'upi',
    label: 'UPI',
    icon: '⚡',
    color: 'from-violet-500 to-purple-600',
    inputLabel: 'UPI ID',
    placeholder: 'yourname@upi',
    hint: 'Enter any UPI ID — this is a simulation',
  },
  {
    id: 'card',
    label: 'Card',
    icon: '💳',
    color: 'from-indigo-500 to-blue-600',
    inputLabel: 'Card Number',
    placeholder: '4242 4242 4242 4242',
    hint: 'Enter any 16-digit number — simulation only',
    extra: true,          // show expiry + CVV
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    icon: '🏦',
    color: 'from-emerald-500 to-teal-600',
    inputLabel: 'Bank',
    placeholder: '',
    hint: 'Select any bank — simulation only',
    isBankSelect: true,
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: '👛',
    color: 'from-amber-500 to-orange-600',
    inputLabel: 'Wallet',
    placeholder: '',
    hint: 'Select any wallet — simulation only',
    isWalletSelect: true,
  },
];

const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'];
const WALLETS = ['Paytm', 'PhonePe', 'Google Pay', 'Amazon Pay', 'Mobikwik'];

const STEPS = [
  { label: 'Connecting to gateway…', duration: 800 },
  { label: 'Authenticating…', duration: 900 },
  { label: 'Processing payment…', duration: 1100 },
  { label: 'Confirming transaction…', duration: 700 },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [inputValue, setInputValue] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [bank, setBank] = useState(BANKS[0]);
  const [wallet, setWallet] = useState(WALLETS[0]);

  // Modal / processing states
  const [showModal, setShowModal] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle | processing | success | declined
  const [stepIndex, setStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Saved fake order id for verify call
  const fakeOrderRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getOrderById(orderId);
        if (res.data.order.status === 'paid') {
          navigate(`/qr-success/${orderId}`);
          return;
        }
        setOrder(res.data.order);
      } catch {
        toast.error('Order not found');
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [orderId]);

  // Reset input when method changes
  useEffect(() => {
    setInputValue('');
    setExpiry('');
    setCvv('');
  }, [selectedMethod]);

  const currentMethod = METHODS.find((m) => m.id === selectedMethod);

  // ── Run animated processing steps then verify ──────────────────────────────
  const runProcessingSteps = async (fakeOrderId) => {
    setPhase('processing');
    setStepIndex(0);
    setCompletedSteps([]);

    for (let i = 0; i < STEPS.length; i++) {
      setStepIndex(i);
      await new Promise((r) => setTimeout(r, STEPS[i].duration));
      setCompletedSteps((prev) => [...prev, i]);
    }

    // Call backend to verify
    try {
      await verifyFakePayment({
        fakeOrderId,
        fakePaymentId: `fppay_fake_${Date.now()}`,
        orderId,
      });
      setPhase('success');
      dispatch(clearCart());
    } catch (err) {
      const isDeclined = err.response?.status === 402 && err.response?.data?.declined;
      setPhase(isDeclined ? 'declined' : 'error');
      if (!isDeclined) toast.error(err.response?.data?.message || 'Payment failed');
    }
  };

  // ── Handle Pay Now ─────────────────────────────────────────────────────────
  const handlePayNow = async () => {
    if (selectedMethod === 'upi' && !inputValue.trim()) {
      toast.error('Please enter your UPI ID');
      return;
    }
    if (selectedMethod === 'card' && inputValue.replace(/\s/g, '').length < 12) {
      toast.error('Please enter a valid card number');
      return;
    }

    setShowModal(true);
    setPhase('processing');

    try {
      const res = await createFakeOrder(orderId);
      fakeOrderRef.current = res.data.fakeOrder.id;
      await runProcessingSteps(res.data.fakeOrder.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
      setShowModal(false);
      setPhase('idle');
    }
  };

  const handleSuccessRedirect = () => navigate(`/qr-success/${orderId}`);

  const handleRetry = () => {
    setShowModal(false);
    setPhase('idle');
    setStepIndex(0);
    setCompletedSteps([]);
  };

  // ── Format card number input ───────────────────────────────────────────────
  const formatCard = (val) =>
    val
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(.{4})/g, '$1 ')
      .trim();

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  if (loading) return <Loader fullScreen text="Loading order…" />;

  return (
    <div className="page-container max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* Header */}
        <h1 className="section-title mb-8 text-center">
          <span className="text-gradient">Complete Payment</span>
        </h1>

        {/* ── Order Summary ─────────────────────────────────────────────── */}
        <div className="glass-card p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-white">Order Summary</h2>
            <span className="badge-pending">{order?.status}</span>
          </div>
          <p className="text-white/30 text-xs font-mono mb-4">{order?.orderNumber}</p>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1 mb-4">
            {order?.items.map((item) => (
              <div key={item._id} className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2">
                  <span className="text-white/70 text-sm">{item.name}</span>
                  <span className="text-white/30 text-xs">×{item.quantity}</span>
                </div>
                <span className="text-white text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex justify-between text-white/50 text-sm">
              <span>Subtotal</span><span>₹{order?.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/50 text-sm">
              <span>GST (18%)</span><span>₹{order?.gstAmount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-lg pt-1">
              <span>Total Payable</span>
              <span className="text-gradient">₹{order?.grandTotal?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── Payment Method Selector ───────────────────────────────────── */}
        <div className="glass-card p-6 mb-6">
          {/* FakePay badge */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/70 text-sm font-semibold">Select Payment Method</h3>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              🧪 FakePay Simulator
            </span>
          </div>

          {/* Method tiles */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {METHODS.map((m) => (
              <motion.button
                key={m.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMethod(m.id)}
                id={`method-${m.id}`}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 cursor-pointer
                  ${selectedMethod === m.id
                    ? `bg-gradient-to-br ${m.color} border-transparent shadow-lg`
                    : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                  }`}
              >
                <span className="text-2xl">{m.icon}</span>
                <span className={`text-xs font-semibold ${selectedMethod === m.id ? 'text-white' : 'text-white/60'}`}>
                  {m.label}
                </span>
                {selectedMethod === m.id && (
                  <motion.div
                    layoutId="method-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* ── Input area (animates on method change) ─────────────────── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMethod}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* UPI */}
              {currentMethod.id === 'upi' && (
                <div>
                  <label className="block text-white/50 text-xs mb-2 font-medium">UPI ID</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-lg">⚡</span>
                    <input
                      id="upi-input"
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="yourname@upi"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              )}

              {/* Card */}
              {currentMethod.id === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-white/50 text-xs mb-2 font-medium">Card Number</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-lg">💳</span>
                      <input
                        id="card-number-input"
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(formatCard(e.target.value))}
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        className="input-field pl-10 font-mono tracking-widest"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white/50 text-xs mb-2 font-medium">Expiry</label>
                      <input
                        id="card-expiry-input"
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="input-field font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-white/50 text-xs mb-2 font-medium">CVV</label>
                      <input
                        id="card-cvv-input"
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="•••"
                        maxLength={4}
                        className="input-field font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-1">
                    {['VISA', 'Master', 'RuPay', 'Amex'].map((n) => (
                      <span key={n} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/30 text-xs font-mono">{n}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Net Banking */}
              {currentMethod.id === 'netbanking' && (
                <div>
                  <label className="block text-white/50 text-xs mb-2 font-medium">Select Bank</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BANKS.map((b) => (
                      <motion.button
                        key={b}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setBank(b)}
                        id={`bank-${b.replace(/\s+/g, '-').toLowerCase()}`}
                        className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all duration-150 ${
                          bank === b
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-semibold'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/8'
                        }`}
                      >
                        🏦 {b}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Wallet */}
              {currentMethod.id === 'wallet' && (
                <div>
                  <label className="block text-white/50 text-xs mb-2 font-medium">Select Wallet</label>
                  <div className="grid grid-cols-3 gap-2">
                    {WALLETS.map((w) => (
                      <motion.button
                        key={w}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setWallet(w)}
                        id={`wallet-${w.replace(/\s+/g, '-').toLowerCase()}`}
                        className={`px-3 py-2.5 rounded-xl border text-sm text-center transition-all duration-150 ${
                          wallet === w
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 font-semibold'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/8'
                        }`}
                      >
                        👛 {w}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-white/25 text-xs mt-3 text-center">{currentMethod.hint}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Security note */}
        <p className="text-white/20 text-xs text-center mb-6">
          🔐 All transactions are encrypted &amp; secure &nbsp;·&nbsp; 🧪 Simulation mode — no real charges
        </p>

        {/* Pay button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handlePayNow}
          id="pay-now-btn"
          className="btn-success w-full text-lg py-4"
        >
          💳 Pay ₹{order?.grandTotal?.toFixed(2)}
        </motion.button>
      </motion.div>

      {/* ================================================================= */}
      {/* Processing / Result Modal                                          */}
      {/* ================================================================= */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />

            {/* Modal card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="fixed inset-0 flex items-center justify-center z-50 px-4"
            >
              <div className="glass-card w-full max-w-sm p-8 text-center">

                {/* ── Processing phase ─────────────────────────────────── */}
                {phase === 'processing' && (
                  <div>
                    {/* Spinning ring */}
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-brand-500/20" />
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-400"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">💳</div>
                    </div>

                    <h3 className="text-white font-bold text-lg mb-1">Processing Payment</h3>
                    <p className="text-white/40 text-sm mb-6">Please wait, do not close this window</p>

                    {/* Steps list */}
                    <div className="space-y-3 text-left">
                      {STEPS.map((step, i) => {
                        const isDone = completedSteps.includes(i);
                        const isActive = stepIndex === i && !isDone;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: i <= stepIndex ? 1 : 0.25, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                              isActive ? 'bg-brand-500/10 border border-brand-500/20' : ''
                            }`}
                          >
                            {isDone ? (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs flex-shrink-0"
                              >
                                ✓
                              </motion.span>
                            ) : isActive ? (
                              <motion.div
                                className="w-5 h-5 rounded-full border-2 border-brand-400 border-t-transparent flex-shrink-0"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-white/10 flex-shrink-0" />
                            )}
                            <span className={`text-sm ${isDone ? 'text-emerald-400' : isActive ? 'text-white' : 'text-white/30'}`}>
                              {step.label}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>

                    <p className="text-white/20 text-xs mt-4">FakePay Simulator v1.0</p>
                  </div>
                )}

                {/* ── Success phase ─────────────────────────────────────── */}
                {phase === 'success' && (
                  <div>
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                      className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center mx-auto mb-6"
                      style={{ boxShadow: '0 0 40px rgba(16,185,129,0.35)' }}
                    >
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="text-4xl"
                      >
                        ✅
                      </motion.span>
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white font-bold text-xl mb-2"
                    >
                      Payment Successful!
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-emerald-400 font-semibold text-lg mb-1"
                    >
                      ₹{order?.grandTotal?.toFixed(2)} paid
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-white/40 text-sm mb-8"
                    >
                      Your exit QR is being generated…
                    </motion.p>

                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSuccessRedirect}
                      id="get-qr-btn"
                      className="btn-success w-full text-base py-3"
                    >
                      🎉 Get Exit QR Code
                    </motion.button>
                  </div>
                )}

                {/* ── Declined phase ────────────────────────────────────── */}
                {phase === 'declined' && (
                  <div>
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                      className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-400/50 flex items-center justify-center mx-auto mb-6"
                      style={{ boxShadow: '0 0 40px rgba(239,68,68,0.3)' }}
                    >
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="text-4xl"
                      >
                        ❌
                      </motion.span>
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-white font-bold text-xl mb-2"
                    >
                      Payment Declined
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-red-400 text-sm mb-2"
                    >
                      Declined by issuing bank
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-white/40 text-xs mb-8"
                    >
                      This is a simulated decline (~10% chance). Try again.
                    </motion.p>

                    <div className="flex flex-col gap-3">
                      <motion.button
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleRetry}
                        id="retry-payment-btn"
                        className="btn-primary w-full py-3"
                      >
                        🔄 Try Again
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/cart')}
                        id="back-to-cart-btn"
                        className="btn-secondary w-full py-3 text-sm"
                      >
                        ← Back to Cart
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Error phase */}
                {phase === 'error' && (
                  <div>
                    <div className="text-5xl mb-4">⚠️</div>
                    <h3 className="text-white font-bold text-xl mb-2">Something went wrong</h3>
                    <p className="text-white/40 text-sm mb-6">An unexpected error occurred.</p>
                    <button
                      onClick={handleRetry}
                      id="error-retry-btn"
                      className="btn-secondary w-full py-3"
                    >
                      ← Go Back
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
