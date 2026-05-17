const QRCode = require('qrcode');
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.QR_ENCRYPTION_KEY || 'default-32-char-encryption-key!!'; // Must be 32 chars
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

// Encrypt data for QR token
const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Decrypt QR token
const decrypt = (text) => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// Generate QR Code as base64 data URL
const generateQRCode = async (orderId, paymentStatus, userId) => {
  const payload = JSON.stringify({
    orderId,
    paymentStatus,
    userId,
    timestamp: new Date().toISOString(),
    nonce: crypto.randomBytes(8).toString('hex'),
  });

  const token = encrypt(payload);

  const qrDataUrl = await QRCode.toDataURL(token, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
    width: 400,
  });

  return { token, qrDataUrl };
};

module.exports = { generateQRCode, encrypt, decrypt };
