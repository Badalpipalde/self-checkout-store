/**
 * Create Admin User Script
 * Run: node src/scripts/createAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN = {
  name: 'Admin',
  email: 'admin@scancart.com',
  password: 'admin123',
  role: 'admin',
  isVerified: true,
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Remove existing admin if any
    await User.deleteOne({ email: ADMIN.email });

    const admin = await User.create(ADMIN);
    console.log('\n🎉 Admin user created!');
    console.log('─────────────────────────────');
    console.log(`  Email    : ${ADMIN.email}`);
    console.log(`  Password : ${ADMIN.password}`);
    console.log(`  Role     : ${admin.role}`);
    console.log('─────────────────────────────');
    console.log('\n👉 Go to http://localhost:5173/login and sign in!');

    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

run();
