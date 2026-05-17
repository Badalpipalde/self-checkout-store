const express = require('express');
const router = express.Router();
const { getProducts, getProductByBarcode, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');
const { upload } = require('../middleware/upload.middleware');

router.get('/', getProducts);
router.get('/barcode/:barcode', getProductByBarcode);
router.get('/:id', getProductById);
router.post('/', protect, adminOnly, upload.single('image'), createProduct);
router.put('/:id', protect, adminOnly, upload.single('image'), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
