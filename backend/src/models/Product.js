const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    barcode: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    category: {
      type: String,
      enum: ['grocery', 'beverages', 'snacks', 'dairy', 'personal-care', 'electronics', 'clothing', 'other'],
      default: 'other',
    },
    brand: { type: String, default: '' },
    unit: { type: String, default: 'piece' },
    gstRate: { type: Number, default: 18 }, // GST percentage
    isActive: { type: Boolean, default: true },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
