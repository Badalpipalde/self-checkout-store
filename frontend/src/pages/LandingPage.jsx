import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const features = [
  { icon: '📱', title: 'Scan & Shop', desc: 'Use your phone camera to scan any product barcode instantly.' },
  { icon: '🛒', title: 'Smart Cart', desc: 'Real-time cart with GST calculation and live stock updates.' },
  { icon: '💳', title: 'Pay Digitally', desc: 'UPI, card, or wallet — pay in seconds with Razorpay.' },
  { icon: '🔐', title: 'Exit Securely', desc: 'Get a verified QR code token. No queues, no hassle.' },
];

const steps = [
  { n: '01', title: 'Scan Product', desc: 'Point your camera at any barcode in the store' },
  { n: '02', title: 'Add to Cart', desc: 'Review product details and add to your smart cart' },
  { n: '03', title: 'Pay Online', desc: 'Complete payment using your preferred method' },
  { n: '04', title: 'Show QR & Exit', desc: 'Display your QR token to staff and walk out!' },
];

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-purple/10 rounded-full blur-3xl" />
        </div>

        <div className="relative text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8"
          >
            <span className="text-accent-green text-sm">●</span>
            <span className="text-white/70 text-sm font-medium">The Future of Retail Shopping</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-5xl md:text-7xl font-black text-white leading-tight"
          >
            Shop Smart.
            <br />
            <span className="text-gradient">Pay Instant.</span>
            <br />
            Exit Free.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-6 text-white/50 text-lg md:text-xl max-w-2xl mx-auto"
          >
            Scan products with your phone, add to cart, pay digitally, and exit with a secure QR token.
            <strong className="text-white/80"> No queues. No cash. No waiting.</strong>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/register" id="get-started-btn" className="btn-primary text-lg px-10 py-4 animate-[buttonGlow_3s_ease-in-out_infinite]">
              🚀 Start Shopping Free
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-10 py-4">
              Sign In →
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[['10K+', 'Products'], ['99.9%', 'Uptime'], ['< 3s', 'Checkout']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black text-gradient">{val}</div>
                <div className="text-white/40 text-xs mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="page-container py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-white">Everything You Need</h2>
          <p className="text-white/40 mt-3">A complete scan-and-go retail experience</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 hover:border-brand-500/30 transition-all duration-300 group"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-display font-bold text-white text-lg">{f.title}</h3>
              <p className="text-white/50 text-sm mt-2 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="page-container py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-white">How It Works</h2>
          <p className="text-white/40 mt-3">4 simple steps to a seamless shopping experience</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative glass-card p-6 text-center"
            >
              <div className="text-5xl font-black text-gradient opacity-30 font-display">{s.n}</div>
              <h3 className="font-display font-bold text-white text-lg mt-2">{s.title}</h3>
              <p className="text-white/40 text-sm mt-2">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 text-white/20 text-2xl">→</div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="page-container py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-brand-gradient opacity-5" />
          <div className="relative">
            <h2 className="font-display text-4xl font-bold text-white mb-4">Ready to Scan & Go?</h2>
            <p className="text-white/50 mb-8">Join thousands of smart shoppers. No queues. Ever.</p>
            <Link to="/register" className="btn-primary text-lg px-12 py-4 inline-block">
              Create Free Account 🛒
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center">
        <p className="text-white/30 text-sm">© 2025 ScanCart · Built with ❤️ for the future of retail</p>
      </footer>
    </div>
  );
}
