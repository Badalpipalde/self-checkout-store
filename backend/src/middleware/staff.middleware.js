const staffOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) return next();
  return res.status(403).json({ success: false, message: 'Access denied. Staff or Admin only.' });
};

module.exports = { staffOrAdmin };
