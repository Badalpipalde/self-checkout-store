const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const passport = require('passport');

// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }
    const user = await User.create({ name, email, password, phone, isVerified: true });
    const token = generateToken(user._id, user.role);
    res.status(201).json({ success: true, message: 'Registration successful!', token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    const token = generateToken(user._id, user.role);
    const userObj = user.toJSON();
    res.json({ success: true, message: 'Login successful!', token, user: userObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('purchaseHistory');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/auth/google
const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'], session: false });

// @route GET /api/auth/google/callback
const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
    const token = generateToken(user._id, user.role);
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  })(req, res, next);
};

// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, googleAuth, googleCallback, updateProfile };
