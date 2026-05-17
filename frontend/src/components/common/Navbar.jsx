import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { logout } from '../../store/authSlice';
import { selectCartCount } from '../../store/cartSlice';

const NavLink = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`text-sm font-medium transition-colors duration-200 ${
        isActive ? 'text-brand-400' : 'text-white/70 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
};

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMenuOpen(false);
  };

  const getRoleLinks = () => {
    if (!user) return null;
    if (user.role === 'admin') return (
      <>
        <NavLink to="/admin" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
        <NavLink to="/admin/products" onClick={() => setMenuOpen(false)}>Products</NavLink>
        <NavLink to="/admin/analytics" onClick={() => setMenuOpen(false)}>Analytics</NavLink>
      </>
    );
    if (user.role === 'staff') return <NavLink to="/staff" onClick={() => setMenuOpen(false)}>Verify</NavLink>;
    return (
      <>
        <NavLink to="/scan" onClick={() => setMenuOpen(false)}>Scan</NavLink>
        <NavLink to="/profile" onClick={() => setMenuOpen(false)}>Profile</NavLink>
      </>
    );
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <span className="font-display font-bold text-lg text-white">ScanCart</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                {getRoleLinks()}
                {user?.role === 'customer' && (
                  <Link to="/cart" className="relative">
                    <span className="text-white/70 hover:text-white text-sm font-medium transition-colors">Cart</span>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-3 w-5 h-5 bg-brand-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <button onClick={handleLogout} className="btn-secondary !py-1.5 !px-4 text-sm">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <Link to="/register" className="btn-primary !py-2 !px-5 text-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg glass text-white"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/5 px-4 py-4 flex flex-col gap-4"
          >
            {isAuthenticated ? (
              <>
                {getRoleLinks()}
                {user?.role === 'customer' && (
                  <Link to="/cart" onClick={() => setMenuOpen(false)} className="text-white/70 hover:text-white text-sm font-medium">
                    Cart {cartCount > 0 && <span className="ml-1 bg-brand-500 text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>}
                  </Link>
                )}
                <button onClick={handleLogout} className="btn-secondary text-sm w-full">Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm text-center">Get Started</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
