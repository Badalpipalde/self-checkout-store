const mongoose = require('mongoose');

const qrVerificationSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true }, // encrypted UUID
    qrCodeDataUrl: { type: String }, // base64 QR image
    qrCodeUrl: { type: String },    // Cloudinary URL (optional)
    isUsed: { type: Boolean, default: false },
    usedAt: { type: Date },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // staff member
    verifiedAt: { type: Date },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

qrVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('QRVerification', qrVerificationSchema);
