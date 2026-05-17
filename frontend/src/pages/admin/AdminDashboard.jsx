import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import Loader from '../../components/common/Loader';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/orders?limit=8'),
    ]).then(([s, o]) => {
      setStats(s.data.stats);
      setOrders(o.data.orders);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen text="Loading dashboard..." />;

  const statCards = [
    { label: "Today's Revenue", value: `₹${stats?.todayRevenue?.toFixed(2) || '0.00'}`, icon: '💰', color: 'text-accent-green' },
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toFixed(2) || '0.00'}`, icon: '📈', color: 'text-brand-400' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '📦', color: 'text-accent-cyan' },
    { label: 'Active Users', value: stats?.totalUsers || 0, icon: '👥', color: 'text-accent-purple' },
    { label: "Today's Orders", value: stats?.todayOrders || 0, icon: '🛒', color: 'text-accent-amber' },
    { label: 'Products', value: stats?.totalProducts || 0, icon: '🏷️', color: 'text-white' },
  ];

  const statusBadge = (s) => {
    const map = { paid: 'badge-paid', pending: 'badge-pending', verified: 'badge-verified', exited: 'badge-exited', cancelled: 'badge-cancelled' };
    return <span className={map[s] || 'badge'}>{s}</span>;
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Real-time store analytics & management</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/products" className="btn-primary !py-2 !px-4 text-sm">+ Add Product</Link>
          <Link to="/admin/analytics" className="btn-secondary !py-2 !px-4 text-sm">📊 Analytics</Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{s.icon}</span>
              <span className={`text-2xl font-black font-display ${s.color}`}>{s.value}</span>
            </div>
            <p className="text-white/40 text-sm">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-white text-lg">Recent Orders</h2>
          <Link to="/admin/analytics" className="text-brand-400 hover:text-brand-300 text-sm">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="text-left py-2 pr-4">Order No.</th>
                <th className="text-left py-2 pr-4">Customer</th>
                <th className="text-left py-2 pr-4">Items</th>
                <th className="text-left py-2 pr-4">Amount</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-left py-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-white/3 transition-colors">
                  <td className="py-3 pr-4 text-white/70 font-mono text-xs">{o.orderNumber}</td>
                  <td className="py-3 pr-4 text-white">{o.user?.name || 'Guest'}</td>
                  <td className="py-3 pr-4 text-white/60">{o.items.length}</td>
                  <td className="py-3 pr-4 text-white font-semibold">₹{o.grandTotal?.toFixed(2)}</td>
                  <td className="py-3 pr-4">{statusBadge(o.status)}</td>
                  <td className="py-3 text-white/40 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!orders.length && (
            <p className="text-white/30 text-center py-8">No orders yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
