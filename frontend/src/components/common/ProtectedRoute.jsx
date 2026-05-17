import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Loader';

export default function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated, loading } = useSelector((s) => s.auth);
  const location = useLocation();

  if (loading) return <Loader fullScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && role !== 'customer' && user?.role !== role && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
