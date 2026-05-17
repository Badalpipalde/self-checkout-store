const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Payment = require('../models/Payment');

// @route GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, paidOrders, totalUsers, totalProducts, todayOrders, payments] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: { $in: ['paid', 'verified', 'exited'] } }),
        User.countDocuments({ role: 'customer' }),
        Product.countDocuments({ isActive: true }),
        Order.find({ createdAt: { $gte: today }, status: { $in: ['paid', 'verified', 'exited'] } }),
        Payment.aggregate([
          { $match: { status: 'captured' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const totalRevenue = payments[0]?.total ? payments[0].total / 100 : 0;

    res.json({
      success: true,
      stats: {
        totalOrders,
        paidOrders,
        totalUsers,
        totalProducts,
        todayRevenue,
        totalRevenue,
        todayOrders: todayOrders.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/orders
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, total, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/analytics/daily-revenue
const getDailyRevenue = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const data = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'verified', 'exited'] }, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$grandTotal' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/analytics/top-products
const getTopProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort('-sold').limit(10).select('name sold price image');
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }).sort('-createdAt').limit(100);
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats, getAllOrders, getDailyRevenue, getTopProducts, getAllUsers, updateUserRole };
