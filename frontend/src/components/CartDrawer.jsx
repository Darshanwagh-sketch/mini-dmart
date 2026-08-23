import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Store, Truck, ArrowRight, CheckCircle2, Package, Home, Navigation, ShoppingBag } from 'lucide-react';
import { getSafeImageUrl, handleImageError } from '../utils/imageUtils';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  user,
  cartItems, 
  onUpdateQty, 
  onRemoveItem, 
  onClearCart, 
  stores, 
  selectedStore, 
  onPlaceOrder,
  onTrackOrder
}) {
  const [orderType, setOrderType] = useState('HOME_DELIVERY');
  const [storeId, setStoreId] = useState(selectedStore?.id || stores[0]?.id || 1);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [addressError, setAddressError] = useState('');
  const [timeSlot, setTimeSlot] = useState('Today (Within 2 Hours)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = orderType === 'HOME_DELIVERY' ? (subtotal >= 500 ? 0 : 49) : 0;
  const total = subtotal + tax + deliveryFee;

  const handleCheckout = async () => {
    if (orderType === 'HOME_DELIVERY') {
      if (!deliveryAddress || deliveryAddress.trim().length < 5) {
        setAddressError('⚠️ Delivery address is required! Please enter your full delivery address before placing your order.');
        return;
      }
    }
    setAddressError('');

    try {
      setSubmitting(true);
      const payload = {
        orderType,
        storeLocationId: orderType === 'STORE_PICKUP' ? storeId : null,
        deliveryAddress: orderType === 'HOME_DELIVERY' ? deliveryAddress.trim() : null,
        deliveryTimeSlot: timeSlot,
        notes
      };
      const order = await onPlaceOrder(payload);
      setPlacedOrder(order);
    } catch (err) {
      alert(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Express Cart ({cartItems.length})</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {placedOrder ? (
          <div style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, overflowY: 'auto' }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: 14, boxShadow: '0 0 25px rgba(16,185,129,0.4)' }}>
              <CheckCircle2 size={40} />
            </div>
            
            <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⚡ Order Confirmed & Active
            </span>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '4px 0 6px', color: '#fff' }}>
              Order #{placedOrder.orderNumber}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: 20 }}>
              Thank you! Your order is being processed by D-Mart Store staff.
            </p>

            {/* Store Pickup Verification Code Card */}
            {placedOrder.orderType === 'STORE_PICKUP' && (
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid var(--primary)', padding: 16, borderRadius: 'var(--radius-md)', width: '100%', marginBottom: 20 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>Store Pickup Code</span>
                <h1 style={{ fontSize: '2rem', letterSpacing: 4, color: '#fff', margin: '4px 0' }}>{placedOrder.pickupCode}</h1>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Show code at store counter for instant collection.</p>
              </div>
            )}

            {/* Live Visual Order Progress Slide with Stage Icons */}
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: 16, borderRadius: 'var(--radius-md)', width: '100%', marginBottom: 24, textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 14 }}>
                Live Fulfillment Progression
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, position: 'relative' }}>
                {/* Step 1: Placed */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', boxShadow: '0 0 12px rgba(16,185,129,0.5)' }}>
                    <ShoppingBag size={18} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff', display: 'block' }}>1. Placed</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Confirmed</span>
                </div>

                {/* Step 2: Packing */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                    <Package size={18} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block' }}>2. Packing</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>In Store</span>
                </div>

                {/* Step 3: Dispatched */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                    <Truck size={18} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block' }}>3. Dispatched</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>En Route</span>
                </div>

                {/* Step 4: Delivered */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                    <Home size={18} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block' }}>4. Delivered</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>Doorstep</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  if (onTrackOrder) onTrackOrder(placedOrder);
                  setPlacedOrder(null);
                  onClose();
                }}
                style={{ width: '100%', padding: '12px', fontSize: '0.92rem', fontWeight: 800 }}
              >
                <Navigation size={16} /> 📍 Track Live Order & Delivery
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={() => { setPlacedOrder(null); onClose(); }}
                style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (

          <>
            {/* Items List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                  <p>Your cart is empty.</p>
                  <span style={{ fontSize: '0.85rem' }}>Browse items from store and add to cart!</span>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-glass)', alignItems: 'center' }}>
                    <img 
                      src={getSafeImageUrl(item.product.imageUrl)} 
                      alt={item.product.name} 
                      style={{ width: 60, height: 60, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} 
                      referrerPolicy="no-referrer"
                      onError={handleImageError}
                    />

                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.product.name}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>₹{item.product.price} / {item.product.unit}</span>
                    </div>

                    {/* Qty Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                      <button 
                        onClick={() => onUpdateQty(item.id, Math.max(1, item.quantity - 1))}
                        style={{ border: 'none', background: 'none', color: '#fff', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ padding: '0 8px', fontSize: '0.85rem', fontWeight: 700 }}>{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        style={{ border: 'none', background: 'none', color: '#fff', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button onClick={() => onRemoveItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}

              {cartItems.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>Fulfillment Option</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                    <button 
                      className={`btn ${orderType === 'HOME_DELIVERY' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setOrderType('HOME_DELIVERY')}
                      style={{ fontSize: '0.85rem' }}
                    >
                      <Truck size={16} /> Home Delivery
                    </button>
                    <button 
                      className={`btn ${orderType === 'STORE_PICKUP' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setOrderType('STORE_PICKUP')}
                      style={{ fontSize: '0.85rem' }}
                    >
                      <Store size={16} /> Store Pickup
                    </button>
                  </div>

                  {orderType === 'STORE_PICKUP' ? (
                    <div className="form-group">
                      <label className="form-label">Select Pickup Store Branch</label>
                      <select 
                        className="form-control" 
                        value={storeId} 
                        onChange={(e) => setStoreId(Number(e.target.value))}
                      >
                        {stores.map(s => (
                          <option key={s.id} value={s.id}>{s.name} - {s.address}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <label className="form-label" style={{ margin: 0, color: addressError ? '#ef4444' : '#fff' }}>
                          Delivery Address <span style={{ color: '#ef4444' }}>* (Required)</span>
                        </label>
                        {user?.address && (
                          <button 
                            type="button" 
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                            onClick={() => {
                              setDeliveryAddress(user.address);
                              setAddressError('');
                            }}
                          >
                            Use Profile Address
                          </button>
                        )}
                      </div>
                      <textarea 
                        className="form-control" 
                        rows={2} 
                        placeholder="Required: House/Flat No, Building Name, Street, Area, Landmark..."
                        style={{ borderColor: addressError ? '#ef4444' : 'var(--border-glass)', background: addressError ? 'rgba(239,68,68,0.1)' : undefined }}
                        value={deliveryAddress} 
                        onChange={(e) => {
                          setDeliveryAddress(e.target.value);
                          if (e.target.value.trim().length >= 5) setAddressError('');
                        }} 
                      />
                      {addressError && (
                        <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 6, fontWeight: 700 }}>
                          {addressError}
                        </div>
                      )}
                    </div>
                  )}


                  <div className="form-group">
                    <label className="form-label">Preferred Time Slot</label>
                    <select className="form-control" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                      <option value="Today (Within 2 Hours)">Today (Within 2 Hours Express)</option>
                      <option value="Today (4:00 PM - 7:00 PM)">Today (4:00 PM - 7:00 PM)</option>
                      <option value="Tomorrow (8:00 AM - 11:00 AM)">Tomorrow Morning (8:00 AM - 11:00 AM)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {cartItems.length > 0 && (
              <div style={{ padding: 24, borderTop: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>GST (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <strong style={{ color: 'var(--primary)' }}>FREE</strong> : `₹${deliveryFee}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: 16 }}>
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>

                <button 
                  className="btn btn-primary" 
                  disabled={submitting} 
                  onClick={handleCheckout}
                  style={{ width: '100%', padding: '12px 20px', fontSize: '1rem' }}
                >
                  {submitting ? 'Processing Order...' : 'Confirm & Place Order'} <ArrowRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
