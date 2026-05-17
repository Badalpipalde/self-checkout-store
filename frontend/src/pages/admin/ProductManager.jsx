import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../../services/productService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const CATEGORIES = ['grocery', 'beverages', 'snacks', 'dairy', 'personal-care', 'electronics', 'clothing', 'other'];
const EMPTY_FORM = { name: '', barcode: '', price: '', mrp: '', stock: '', category: 'other', brand: '', description: '', gstRate: '18' };

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const fileRef = useRef();

  const fetchProducts = async () => {
    try {
      const res = await getProducts({ limit: 100 });
      setProducts(res.data.products);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setImageFile(null); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p._id);
    setForm({ name: p.name, barcode: p.barcode, price: p.price, mrp: p.mrp || '', stock: p.stock, category: p.category, brand: p.brand || '', description: p.description || '', gstRate: p.gstRate || 18 });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      if (editing) {
        await updateProduct(editing, fd);
        toast.success('Product updated!');
      } else {
        await createProduct(fd);
        toast.success('Product created!');
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.includes(search)
  );

  if (loading) return <Loader fullScreen text="Loading products..." />;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Products</h1>
          <p className="text-white/40 text-sm">{products.length} products in inventory</p>
        </div>
        <button id="add-product-btn" onClick={openNew} className="btn-primary">+ Add Product</button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Search by name or barcode..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-field mb-6"
      />

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <motion.div
            key={p._id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-4 group"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-white/5 mb-3">
              {p.image ? (
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
              )}
            </div>
            <p className="text-xs text-brand-400 uppercase font-medium">{p.category}</p>
            <h3 className="text-white font-semibold truncate mt-0.5">{p.name}</h3>
            <p className="text-white/30 text-xs font-mono mt-0.5">{p.barcode}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white font-bold">₹{p.price}</span>
              <span className={`text-xs ${p.stock > 0 ? 'text-accent-green' : 'text-red-400'}`}>
                {p.stock > 0 ? `${p.stock} left` : 'Out of stock'}
              </span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => openEdit(p)} className="flex-1 btn-secondary !py-1.5 text-xs">Edit</button>
              <button onClick={() => handleDelete(p._id)} className="w-9 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs flex items-center justify-center transition-colors">🗑</button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-white/30">
          <p className="text-5xl mb-4">📦</p>
          <p>No products found</p>
        </div>
      )}

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-white">
                  {editing ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white text-xl">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { key: 'name', label: 'Product Name', required: true },
                  { key: 'barcode', label: 'Barcode', required: true },
                  { key: 'brand', label: 'Brand' },
                  { key: 'description', label: 'Description' },
                ].map(({ key, label, required }) => (
                  <div key={key}>
                    <label className="text-white/60 text-sm mb-1 block">{label}</label>
                    <input
                      className="input-field"
                      required={required}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={label}
                    />
                  </div>
                ))}

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'price', label: 'Price (₹)', type: 'number' },
                    { key: 'mrp', label: 'MRP (₹)', type: 'number' },
                    { key: 'stock', label: 'Stock', type: 'number' },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="text-white/60 text-xs mb-1 block">{label}</label>
                      <input type={type} className="input-field" value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder="0" min="0" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/60 text-sm mb-1 block">Category</label>
                    <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1 block">GST Rate (%)</label>
                    <input type="number" className="input-field" value={form.gstRate}
                      onChange={(e) => setForm({ ...form, gstRate: e.target.value })} min="0" max="28" />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Product Image</label>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => setImageFile(e.target.files[0])} />
                  <button type="button" onClick={() => fileRef.current.click()}
                    className="btn-secondary w-full text-sm">
                    {imageFile ? `✅ ${imageFile.name}` : '📷 Upload Image'}
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">
                    {submitting ? 'Saving...' : (editing ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
