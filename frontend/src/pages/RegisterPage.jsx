import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { registerUser } from '../store/authSlice';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Welcome to ScanCart 🎉');
      navigate('/scan');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              🛒
            </div>
            <h1 className="font-display text-2xl font-bold text-white">Create Account</h1>
            <p className="text-white/40 text-sm mt-1">Start shopping smarter today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { id: 'name-input', key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
              { id: 'email-input', key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
              { id: 'phone-input', key: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+91 9876543210' },
              { id: 'password-input', key: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' },
            ].map(({ id, key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-white/60 text-sm mb-1.5 block">{label}</label>
                <input
                  id={id}
                  type={type}
                  required={key !== 'phone'}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="input-field"
                  placeholder={placeholder}
                />
              </div>
            ))}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              id="register-btn"
              disabled={loading}
              className="btn-primary w-full text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : 'Create Account 🚀'}
            </motion.button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
