const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true }, // in paise (smallest unit)
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'captured', 'failed', 'refunded'],
      default: 'created',
    },
    method: { type: String, default: '' }, // card, upi, netbanking, wallet
    bank: { type: String, default: '' },
    wallet: { type: String, default: '' },
    vpa: { type: String, default: '' }, // UPI VPA
    paidAt: { type: Date },
    refundedAt: { type: Date },
    notes: { type: Map, of: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
