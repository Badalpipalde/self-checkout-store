/**
 * Seed Script — Populates the database with sample products
 * Run: node src/scripts/seed.js
 */
require('dotenv').config({ path: '../../.env' });
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const sampleProducts = [
  { barcode: '8901030864817', name: 'Lay\'s Classic Salted', price: 20, mrp: 20, stock: 150, category: 'snacks', brand: 'Lay\'s', gstRate: 12, description: 'Classic salted potato chips', image: 'https://via.placeholder.com/400x400/6366f1/ffffff?text=Lays' },
  { barcode: '8901063031456', name: 'Tropicana Orange Juice', price: 65, mrp: 70, stock: 80, category: 'beverages', brand: 'Tropicana', gstRate: 12, description: '1L 100% orange juice', image: 'https://via.placeholder.com/400x400/f59e0b/ffffff?text=Juice' },
  { barcode: '8906001700045', name: 'Amul Gold Milk 500ml', price: 28, mrp: 28, stock: 200, category: 'dairy', brand: 'Amul', gstRate: 0, description: 'Full cream pasteurized milk', image: 'https://via.placeholder.com/400x400/06b6d4/ffffff?text=Milk' },
  { barcode: '8906002290015', name: 'Britannia Good Day Butter', price: 35, mrp: 38, stock: 120, category: 'snacks', brand: 'Britannia', gstRate: 12, description: 'Butter cookies', image: 'https://via.placeholder.com/400x400/a855f7/ffffff?text=Cookies' },
  { barcode: '8901719117954', name: 'Maggi Masala Noodles', price: 14, mrp: 14, stock: 300, category: 'grocery', brand: 'Maggi', gstRate: 12, description: '2-minute noodles masala', image: 'https://via.placeholder.com/400x400/ec4899/ffffff?text=Maggi' },
  { barcode: '8901030100079', name: 'Kurkure Masala Munch', price: 20, mrp: 20, stock: 100, category: 'snacks', brand: 'Kurkure', gstRate: 12, description: 'Crunchy masala puffed corn snacks', image: 'https://via.placeholder.com/400x400/10b981/ffffff?text=Kurkure' },
  { barcode: '8906048380060', name: 'Heads & Shoulders Shampoo', price: 185, mrp: 199, stock: 60, category: 'personal-care', brand: 'H&S', gstRate: 18, description: 'Anti-dandruff shampoo 180ml', image: 'https://via.placeholder.com/400x400/4338ca/ffffff?text=Shampoo' },
  { barcode: '8901019019047', name: 'Dove Soap Bar', price: 42, mrp: 45, stock: 90, category: 'personal-care', brand: 'Dove', gstRate: 18, description: '1/4 moisturizing cream beauty bar', image: 'https://via.placeholder.com/400x400/e0e9ff/1a1a2e?text=Dove' },
  { barcode: '8906007432088', name: 'Parle-G Biscuits', price: 10, mrp: 10, stock: 500, category: 'snacks', brand: 'Parle', gstRate: 5, description: 'Classic glucose biscuits 100g', image: 'https://via.placeholder.com/400x400/f59e0b/ffffff?text=ParleG' },
  { barcode: '8901058006131', name: 'Coca-Cola 750ml', price: 40, mrp: 40, stock: 150, category: 'beverages', brand: 'Coca-Cola', gstRate: 28, description: 'Refreshing cola drink', image: 'https://via.placeholder.com/400x400/dc2626/ffffff?text=Coke' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    await Product.deleteMany({});
    console.log('🗑  Cleared existing products');
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ Seeded ${products.length} products!`);
    console.log('\nProduct barcodes for testing:');
    products.forEach((p) => console.log(`  ${p.barcode} — ${p.name} (₹${p.price})`));
    await mongoose.connection.close();
    console.log('\n🎉 Seed complete!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
