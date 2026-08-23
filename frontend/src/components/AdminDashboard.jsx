import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, AlertTriangle, FileText, Plus, Edit, Trash2, ShieldCheck, X } from 'lucide-react';
import { api } from '../api';
import { getSafeImageUrl, handleImageError } from '../utils/imageUtils';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview | products | users | audit
  const [loading, setLoading] = useState(true);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', sku: '', categoryId: '', price: '', originalPrice: '', unit: '1 kg', imageUrl: '', stockQuantity: 50, lowStockThreshold: 5, description: ''
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [dashStats, prodList, userList, logList, catList] = await Promise.all([
        api.getAdminDashboard(),
        api.getProducts(),
        api.getAdminUsers(),
        api.getAuditLogs(),
        api.getCategories()
      ]);
      setStats(dashStats);
      setProducts(prodList);
      setUsers(userList);
      setAuditLogs(logList);
      setCategories(catList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        sku: product.sku,
        categoryId: product.category?.id || categories[0]?.id || '',
        price: product.price,
        originalPrice: product.originalPrice || '',
        unit: product.unit,
        imageUrl: product.imageUrl,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        description: product.description || ''
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '', 
        sku: 'PRD-' + Math.floor(1000 + Math.random() * 9000), 
        categoryId: categories[0]?.id || 1, 
        price: '', 
        originalPrice: '', 
        unit: '1 kg', 
        imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80', 
        stockQuantity: 50, 
        lowStockThreshold: 5, 
        description: ''
      });
    }
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        sku: productForm.sku,
        category: { id: Number(productForm.categoryId) },
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : null,
        unit: productForm.unit,
        imageUrl: productForm.imageUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
        stockQuantity: Number(productForm.stockQuantity),
        lowStockThreshold: Number(productForm.lowStockThreshold),
        description: productForm.description,
        isAvailable: Number(productForm.stockQuantity) > 0
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }

      handleCloseProductModal();
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api.deleteProduct(id);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update user role');
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', padding: 20, borderRadius: 'var(--radius-lg)', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase' }}>System Executive Overview</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0' }}>Admin Management Console</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Full system oversight, product inventory management, user role permissions & security audit logs.</p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`} style={{ background: activeTab === 'overview' ? 'var(--accent-purple)' : '' }} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`btn btn-sm ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`} style={{ background: activeTab === 'products' ? 'var(--accent-purple)' : '' }} onClick={() => setActiveTab('products')}>Products ({products.length})</button>
          <button className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`} style={{ background: activeTab === 'users' ? 'var(--accent-purple)' : '' }} onClick={() => setActiveTab('users')}>Users ({users.length})</button>
          <button className={`btn btn-sm ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`} style={{ background: activeTab === 'audit' ? 'var(--accent-purple)' : '' }} onClick={() => setActiveTab('audit')}>Audit Trail</button>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', padding: 18, borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Sales Revenue</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', margin: '4px 0' }}>₹{stats.totalRevenue?.toFixed(2)}</h2>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', padding: 18, borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Orders</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>{stats.totalOrders}</h2>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', padding: 18, borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Registered Customers</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary)', margin: '4px 0' }}>{stats.totalCustomers}</h2>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', padding: 18, borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Low Stock Alert Items</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--danger)', margin: '4px 0' }}>{stats.lowStockCount}</h2>
          </div>
        </div>
      )}

      {activeTab === 'products' || activeTab === 'overview' ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Product & Stock Management</h3>
            <button className="btn btn-primary btn-sm" onClick={() => handleOpenProductModal()}>
              <Plus size={16} /> Add New Product
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img 
                          src={getSafeImageUrl(p.imageUrl)} 
                          alt={p.name} 
                          style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} 
                          referrerPolicy="no-referrer"
                          onError={handleImageError}
                        />
                        <span style={{ fontWeight: 700 }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{p.sku}</td>
                    <td>{p.category?.name}</td>
                    <td style={{ fontWeight: 700 }}>₹{p.price}</td>
                    <td>
                      <span className={`brand-badge ${p.stockQuantity <= p.lowStockThreshold ? 'badge-low-stock' : 'badge-in-stock'}`}>
                        {p.stockQuantity} units
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenProductModal(p)} title="Edit Product"><Edit size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(p.id)} title="Delete Product"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : activeTab === 'users' ? (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 700 }}>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="brand-badge" style={{ background: u.role === 'ROLE_ADMIN' ? 'var(--accent-purple)' : u.role === 'ROLE_STAFF' ? 'var(--secondary)' : 'rgba(255,255,255,0.1)' }}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.phone || 'N/A'}</td>
                  <td>
                    <select 
                      className="form-control" 
                      style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                    >
                      <option value="ROLE_CUSTOMER">CUSTOMER</option>
                      <option value="ROLE_STAFF">STAFF</option>
                      <option value="ROLE_ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User Email</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>{log.userEmail}</td>
                  <td><span className="brand-badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{log.action}</span></td>
                  <td>{log.entityName} #{log.entityId}</td>
                  <td style={{ fontSize: '0.85rem' }}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Add / Edit Form Modal */}
      {isProductModalOpen && (
        <div className="modal-overlay" onClick={handleCloseProductModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={handleCloseProductModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input type="text" className="form-control" required placeholder="e.g. Fresh Red Apples" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU Code</label>
                  <input type="text" className="form-control" required placeholder="e.g. PRD-1029" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-control" value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Unit / Size</label>
                  <input type="text" className="form-control" placeholder="e.g. 1 kg, 500 ml, 1 Pack" value={productForm.unit} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Selling Price (₹)</label>
                  <input type="number" step="0.01" className="form-control" required placeholder="99.00" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Original Price (₹)</label>
                  <input type="number" step="0.01" className="form-control" placeholder="120.00" value={productForm.originalPrice} onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Stock</label>
                  <input type="number" className="form-control" required value={productForm.stockQuantity} onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input type="text" className="form-control" placeholder="https://images.unsplash.com/..." value={productForm.imageUrl} onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Product Description</label>
                <textarea className="form-control" rows={2} placeholder="Fresh, high quality farm product..." value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseProductModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-purple)' }}>Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
