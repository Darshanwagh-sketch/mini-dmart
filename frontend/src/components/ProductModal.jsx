import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, ShieldCheck } from 'lucide-react';
import { getSafeImageUrl, handleImageError } from '../utils/imageUtils';

export default function ProductModal({ product, onClose, onAddToCart }) {
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
          <div style={{ height: 260, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#0f172a' }}>
            <img 
              src={getSafeImageUrl(product.imageUrl)} 
              alt={product.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              referrerPolicy="no-referrer"
              onError={handleImageError}
            />
          </div>


          <div>
            <span className="product-category">{product.category?.name}</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '6px 0 10px' }}>{product.name}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>{product.description}</p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>₹{product.price}</span>
              {product.originalPrice && (
                <span style={{ textDecoration: 'line-through', color: 'var(--text-dim)', fontSize: '0.95rem' }}>₹{product.originalPrice}</span>
              )}
              <span className="brand-badge" style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--primary)' }}>{product.unit}</span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
              SKU: <strong style={{ color: '#fff' }}>{product.sku}</strong> | Stock: <strong style={{ color: isOutOfStock ? 'var(--danger)' : 'var(--primary)' }}>{product.stockQuantity} units available</strong>
            </div>

            {/* Qty Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={qty <= 1}
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ border: 'none' }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ padding: '0 16px', fontWeight: 700 }}>{qty}</span>
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={qty >= product.stockQuantity}
                  onClick={() => setQty(q => Math.min(product.stockQuantity, q + 1))}
                  style={{ border: 'none' }}
                >
                  <Plus size={14} />
                </button>
              </div>

              <button 
                className="btn btn-primary" 
                disabled={isOutOfStock}
                onClick={() => { onAddToCart(product.id, qty); onClose(); }}
                style={{ flex: 1 }}
              >
                <ShoppingBag size={18} /> Add to Cart (₹{(product.price * qty).toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
