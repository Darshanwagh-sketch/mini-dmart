import React from 'react';
import { Plus, Check, Eye } from 'lucide-react';
import { getSafeImageUrl, handleImageError } from '../utils/imageUtils';

export default function ProductCard({ product, onAddToCart, onQuickView }) {
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold;

  return (
    <div className="product-card">
      <div className="product-img-wrapper" onClick={() => onQuickView(product)} style={{ cursor: 'pointer' }}>
        <img 
          src={getSafeImageUrl(product.imageUrl)} 
          alt={product.name} 
          className="product-img" 
          referrerPolicy="no-referrer"
          onError={handleImageError}
        />

        
        {/* Stock Badge */}
        {isOutOfStock ? (
          <span className="product-stock-badge badge-out-of-stock">Out of Stock</span>
        ) : isLowStock ? (
          <span className="product-stock-badge badge-low-stock">Only {product.stockQuantity} left</span>
        ) : (
          <span className="product-stock-badge badge-in-stock">In Stock</span>
        )}

        <button 
          className="btn btn-secondary btn-sm" 
          style={{ position: 'absolute', bottom: 8, right: 8, padding: 6, borderRadius: '50%', background: 'rgba(15,23,42,0.8)' }}
          onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
          title="Quick View"
        >
          <Eye size={14} />
        </button>
      </div>

      <div className="product-info">
        <span className="product-category">{product.category?.name || 'Grocery'}</span>
        <h4 className="product-title" onClick={() => onQuickView(product)} style={{ cursor: 'pointer' }}>
          {product.name}
        </h4>
        <span className="product-unit">{product.unit}</span>

        <div className="product-bottom">
          <div className="product-price">
            <span className="price-current">₹{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="price-original">₹{product.originalPrice}</span>
            )}
          </div>

          <button 
            className="btn btn-primary btn-sm" 
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product.id, 1)}
            style={{ opacity: isOutOfStock ? 0.5 : 1 }}
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
