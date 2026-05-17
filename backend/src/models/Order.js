const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
  barcode: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    gstAmount: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'verified', 'exited', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: { type: String, enum: ['razorpay', 'stripe', 'cash', 'fakepay'], default: 'fakepay' },
    paidAt: { type: Date },
    verifiedAt: { type: Date },
    exitedAt: { type: Date },
    storeId: { type: String, default: 'STORE-001' },
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
