import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';
import api from '../../services/api';
import Loader from '../../components/common/Loader';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

const chartOptions = {
  responsive: true,
  plugins: { legend: { labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } } } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } } },
  },
};

export default function Analytics() {
  const [revenue, setRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/analytics/daily-revenue'),
      api.get('/admin/analytics/top-products'),
    ]).then(([r, p]) => {
      setRevenue(r.data.data);
      setTopProducts(p.data.products);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen text="Loading analytics..." />;

  const revenueChart = {
    labels: revenue.map((d) => d._id),
    datasets: [{
      label: 'Daily Revenue (₹)',
      data: revenue.map((d) => d.revenue),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#6366f1',
    }],
  };

  const ordersChart = {
    labels: revenue.slice(-7).map((d) => d._id),
    datasets: [{
      label: 'Orders',
      data: revenue.slice(-7).map((d) => d.orders),
      backgroundColor: 'rgba(168,85,247,0.7)',
      borderRadius: 8,
    }],
  };

  const topProductsChart = {
    labels: topProducts.slice(0, 6).map((p) => p.name.substring(0, 15)),
    datasets: [{
      data: topProducts.slice(0, 6).map((p) => p.sold),
      backgroundColor: ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'],
      borderWidth: 0,
    }],
  };

  return (
    <div className="page-container">
      <h1 className="font-display text-3xl font-bold text-white mb-8">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="font-semibold text-white mb-4">30-Day Revenue</h2>
          {revenue.length > 0 ? (
            <Line data={revenueChart} options={chartOptions} />
          ) : (
            <p className="text-white/30 text-center py-12">No data yet</p>
          )}
        </motion.div>

        {/* Weekly Orders Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h2 className="font-semibold text-white mb-4">Weekly Orders</h2>
          {revenue.length > 0 ? (
            <Bar data={ordersChart} options={chartOptions} />
          ) : (
            <p className="text-white/30 text-center py-12">No data yet</p>
          )}
        </motion.div>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h2 className="font-semibold text-white mb-4">Top Selling Products</h2>
          {topProducts.length > 0 ? (
            <div className="h-48 flex items-center justify-center">
              <Doughnut
                data={topProductsChart}
                options={{ ...chartOptions, scales: undefined, maintainAspectRatio: false }}
              />
            </div>
          ) : (
            <p className="text-white/30 text-center py-12">No data yet</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h2 className="font-semibold text-white mb-4">Top Products by Sales</h2>
          <div className="space-y-3">
            {topProducts.slice(0, 6).map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="text-white/30 text-sm w-6">{i + 1}</span>
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm">📦</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{p.name}</p>
                  <div className="h-1.5 bg-white/10 rounded-full mt-1">
                    <div
                      className="h-full bg-brand-gradient rounded-full"
                      style={{ width: `${Math.min(100, (p.sold / (topProducts[0]?.sold || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-white/60 text-xs">{p.sold} sold</span>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-white/30 text-center py-8">No sales data yet</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
