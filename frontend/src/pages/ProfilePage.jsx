import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getMyOrders } from '../services/orderService';

export default function ProfilePage() {
  const { user } = useSelector((s) => s.auth);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getMyOrders().then((r) => setOrders(r.data.orders)).catch(() => {});
  }, []);

  const statusBadge = (s) => {
    const map = { paid: 'badge-paid', pending: 'badge-pending', verified: 'badge-verified', exited: 'badge-exited', cancelled: 'badge-cancelled' };
    return <span className={map[s] || 'badge'}>{s}</span>;
  };

  return (
    <div className="page-container max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Header */}
        <div className="glass-card p-6 flex items-center gap-5 mb-8">
          <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">{user?.name}</h1>
            <p className="text-white/50 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge bg-brand-500/20 text-brand-400 border border-brand-500/30">{user?.role}</span>
              <span className="badge bg-amber-500/20 text-amber-400 border border-amber-500/30">⭐ {user?.loyaltyPoints || 0} pts</span>
            </div>
          </div>
        </div>

        {/* Purchase History */}
        <h2 className="section-title mb-4">Purchase History</h2>
        {orders.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-white/40">No orders yet. Start scanning! 📱</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order._id} className="glass-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-mono text-sm">{order.orderNumber}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} items
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="text-white font-bold">₹{order.grandTotal?.toFixed(2)}</span>
                  {statusBadge(order.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
