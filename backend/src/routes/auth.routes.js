const express = require('express');
const router = express.Router();
const { register, login, getMe, googleAuth, googleCallback, updateProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

module.exports = router;
