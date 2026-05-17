const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const { getIO } = require('../utils/socket');

// @route GET /api/products
const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/products/barcode/:barcode
const getProductByBarcode = async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode, isActive: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found for this barcode.' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/products (admin)
const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    if (req.file) {
      productData.image = req.file.path;
      productData.imagePublicId = req.file.filename;
    }
    const product = await Product.create(productData);
    try { getIO().emit('product:created', product); } catch (_) {}
    res.status(201).json({ success: true, message: 'Product created!', product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Barcode already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/products/:id (admin)
const updateProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    if (req.file) {
      // Delete old image
      const existing = await Product.findById(req.params.id);
      if (existing?.imagePublicId) {
        await cloudinary.uploader.destroy(existing.imagePublicId);
      }
      productData.image = req.file.path;
      productData.imagePublicId = req.file.filename;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    try { getIO().emit('product:updated', product); } catch (_) {}
    res.json({ success: true, message: 'Product updated!', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/products/:id (admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }
    await product.deleteOne();
    try { getIO().emit('product:deleted', { id: req.params.id }); } catch (_) {}
    res.json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProducts, getProductByBarcode, getProductById, createProduct, updateProduct, deleteProduct };
