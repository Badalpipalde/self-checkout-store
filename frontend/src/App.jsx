import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadUser } from './store/authSlice';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ScannerPage from './pages/ScannerPage';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';
import QRSuccessPage from './pages/QRSuccessPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManager from './pages/admin/ProductManager';
import Analytics from './pages/admin/Analytics';
import StaffVerification from './pages/staff/StaffVerification';
import AuthSuccess from './pages/AuthSuccess';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-900">
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/success" element={<AuthSuccess />} />

          {/* Customer Protected */}
          <Route path="/scan" element={<ProtectedRoute role="customer"><ScannerPage /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute role="customer"><CartPage /></ProtectedRoute>} />
          <Route path="/payment/:orderId" element={<ProtectedRoute role="customer"><PaymentPage /></ProtectedRoute>} />
          <Route path="/qr-success/:orderId" element={<ProtectedRoute role="customer"><QRSuccessPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Staff */}
          <Route path="/staff" element={<ProtectedRoute role="staff"><StaffVerification /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute role="admin"><ProductManager /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><Analytics /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
