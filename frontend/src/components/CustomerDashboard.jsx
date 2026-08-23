import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, MapPin, RefreshCw, XCircle, CheckCircle2, Truck, Package, Store, Navigation } from 'lucide-react';
import { api } from '../api';
import DeliveryTrackerModal from './DeliveryTrackerModal';
import { getSafeImageUrl, handleImageError } from '../utils/imageUtils';

export default function CustomerDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [trackingOrderModal, setTrackingOrderModal] = useState(null);
  const [returnForm, setReturnForm] = useState({ orderItemId: '', requestType: 'RETURN', quantity: 1, reason: '' });


  useEffect(() => {
    fetchUserData();
    // Live status polling every 5 seconds to sync staff updates automatically
    const interval = setInterval(() => {
      fetchUserData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const [userOrders, userReturns] = await Promise.all([
        api.getMyOrders(),
        api.getMyReturns()
      ]);
      setOrders(userOrders);
      setReturns(userReturns);
    } catch (err) {
      console.error(err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Item stocks will be restored.')) return;
    try {
      await api.cancelOrder(orderId);
      fetchUserData();
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    try {
      await api.createReturnRequest({
        orderId: selectedOrderForReturn.id,
        orderItemId: Number(returnForm.orderItemId),
        requestType: returnForm.requestType,
        quantity: Number(returnForm.quantity),
        reason: returnForm.reason
      });
      alert('Return/Exchange request submitted successfully!');
      setSelectedOrderForReturn(null);
      fetchUserData();
    } catch (err) {
      alert(err.message || 'Failed to submit return request');
    }
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'PLACED': return 1;
      case 'PREPARING': return 2;
      case 'READY_FOR_PICKUP':
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      case 'CANCELLED': return -1;
      default: return 1;
    }
  };

  const getStatusDisplay = (status, orderType) => {
    switch (status) {
      case 'PLACED':
        return { label: 'Order Placed', desc: 'Received by store, awaiting staff confirmation.', color: 'var(--warning)', bg: 'badge-low-stock' };
      case 'PREPARING':
        return { label: 'Confirmed & Preparing', desc: 'Store staff is packing your items fresh.', color: 'var(--secondary)', bg: 'badge-low-stock' };
      case 'OUT_FOR_DELIVERY':
        return { label: 'Dispatched / Out for Delivery', desc: 'Delivery agent is on the way to your address.', color: 'var(--accent-purple)', bg: 'badge-in-stock' };
      case 'READY_FOR_PICKUP':
        return { label: 'Ready for Store Pickup', desc: 'Packed and waiting for you at store counter.', color: 'var(--primary)', bg: 'badge-in-stock' };
      case 'DELIVERED':
        return { label: 'Delivered & Completed', desc: 'Order successfully fulfilled.', color: 'var(--success)', bg: 'badge-in-stock' };
      case 'CANCELLED':
        return { label: 'Cancelled', desc: 'Order was cancelled and inventory restored.', color: 'var(--danger)', bg: 'badge-out-of-stock' };
      default:
        return { label: status, desc: '', color: '#fff', bg: '' };
    }
  };

  return (
    <div>
      {/* Profile Header Card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', padding: 24, borderRadius: 'var(--radius-lg)', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>Customer Account</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0' }}>Welcome, {user?.fullName}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email: {user?.email} | Phone: {user?.phone || 'Not set'} | Default Address: {user?.address || 'Not set'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => fetchUserData()} title="Refresh Status Now">
            <RefreshCw size={14} /> Refresh Status
          </button>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{orders.length}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Orders</div>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16 }}>My Orders & Real-Time Fulfillment Tracking</h3>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', padding: 40, textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
          <ShoppingBag size={40} style={{ color: 'var(--text-dim)', marginBottom: 12 }} />
          <p style={{ color: 'var(--text-muted)' }}>No orders placed yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {orders.map((order) => {
            const step = getStepIndex(order.status);
            const statusInfo = getStatusDisplay(order.status, order.orderType);

            return (
              <div key={order.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid var(--border-glass)', paddingBottom: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Order #{order.orderNumber}</span>
                      <span className={`brand-badge ${statusInfo.bg}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      {statusInfo.desc}
                    </p>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 4, display: 'block' }}>
                      Placed on: {new Date(order.createdAt).toLocaleString()} | Type: <strong>{order.orderType === 'STORE_PICKUP' ? 'Store Pickup' : 'Home Delivery'}</strong>
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>₹{order.totalAmount}</span>
                    {order.status === 'PLACED' && (
                      <div>
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancelOrder(order.id)} style={{ marginTop: 6 }}>
                          <XCircle size={14} /> Cancel Order
                        </button>
                      </div>
                    )}
                    {order.status === 'DELIVERED' && (
                      <div>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedOrderForReturn(order); setReturnForm({ orderItemId: order.items[0]?.id || '', requestType: 'RETURN', quantity: 1, reason: '' }); }} style={{ marginTop: 6 }}>
                          <RefreshCw size={14} /> Request Return/Exchange
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pickup Code Card if applicable */}
                {order.orderType === 'STORE_PICKUP' && order.pickupCode && (
                  <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>Store Pickup Verification Code</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: 3, color: '#fff' }}>{order.pickupCode}</div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pickup Branch: <strong>{order.storeLocation?.name || 'Central Store'}</strong></span>
                  </div>
                )}

                {/* Live Delivery Tracking Details Card */}
                {order.orderType === 'HOME_DELIVERY' && order.status !== 'CANCELLED' && (
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))', 
                    border: '1px solid rgba(59, 130, 246, 0.3)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: 16, 
                    marginBottom: 20,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Truck size={18} style={{ color: 'var(--accent-purple)' }} />
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>Live Express Delivery Tracking</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {order.trackingNumber && (
                          <span style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', fontSize: '0.75rem', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                            ID: {order.trackingNumber}
                          </span>
                        )}
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => setTrackingOrderModal(order)} 
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', fontSize: '0.78rem' }}
                        >
                          <Navigation size={14} /> 📍 Track Live GPS Map
                        </button>
                      </div>

                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Estimated Arrival</span>
                        <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>{order.estimatedDeliveryTime || '25-35 Mins'}</strong>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Delivery Partner</span>
                        <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{order.deliveryPartner || 'D-Mart Express Rider'}</strong>
                      </div>

                      {order.deliveryRiderName && (
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Assigned Rider</span>
                          <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{order.deliveryRiderName}</strong>
                          {order.deliveryRiderPhone && (
                            <a 
                              href={`tel:${order.deliveryRiderPhone}`} 
                              style={{ display: 'inline-block', marginTop: 4, fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'underline', fontWeight: 700 }}
                            >
                              📞 Call Rider ({order.deliveryRiderPhone})
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* Real-time Order Progression Stepper with Rich Icons */}
                {order.status !== 'CANCELLED' && (
                  <div style={{ 
                    background: 'rgba(15, 23, 42, 0.6)', 
                    border: '1px solid var(--border-glass)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '16px 20px', 
                    marginBottom: 20 
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                      {/* Step 1 */}
                      <div style={{ textAlign: 'center', opacity: step >= 1 ? 1 : 0.45 }}>
                        <div style={{ 
                          width: 42, 
                          height: 42, 
                          borderRadius: '50%', 
                          background: step >= 1 ? 'var(--primary)' : 'rgba(255,255,255,0.08)', 
                          color: step >= 1 ? '#fff' : 'var(--text-muted)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          margin: '0 auto 8px',
                          boxShadow: step >= 1 ? '0 0 16px rgba(16,185,129,0.5)' : 'none'
                        }}>
                          <ShoppingBag size={20} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: step >= 1 ? '#fff' : 'var(--text-muted)', display: 'block' }}>1. Order Placed</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Confirmed</span>
                      </div>

                      {/* Step 2 */}
                      <div style={{ textAlign: 'center', opacity: step >= 2 ? 1 : 0.45 }}>
                        <div style={{ 
                          width: 42, 
                          height: 42, 
                          borderRadius: '50%', 
                          background: step >= 2 ? 'var(--primary)' : 'rgba(255,255,255,0.08)', 
                          color: step >= 2 ? '#fff' : 'var(--text-muted)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          margin: '0 auto 8px',
                          boxShadow: step >= 2 ? '0 0 16px rgba(16,185,129,0.5)' : 'none'
                        }}>
                          <Package size={20} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: step >= 2 ? '#fff' : 'var(--text-muted)', display: 'block' }}>2. Confirmed & Prep</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Packing in Store</span>
                      </div>

                      {/* Step 3 */}
                      <div style={{ textAlign: 'center', opacity: step >= 3 ? 1 : 0.45 }}>
                        <div style={{ 
                          width: 42, 
                          height: 42, 
                          borderRadius: '50%', 
                          background: step >= 3 ? 'var(--primary)' : 'rgba(255,255,255,0.08)', 
                          color: step >= 3 ? '#fff' : 'var(--text-muted)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          margin: '0 auto 8px',
                          boxShadow: step >= 3 ? '0 0 16px rgba(16,185,129,0.5)' : 'none'
                        }}>
                          {order.orderType === 'STORE_PICKUP' ? <Store size={20} /> : <Truck size={20} />}
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: step >= 3 ? '#fff' : 'var(--text-muted)', display: 'block' }}>
                          {order.orderType === 'STORE_PICKUP' ? '3. Ready at Counter' : '3. Dispatched'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {order.orderType === 'STORE_PICKUP' ? 'Pickup Ready' : 'En Route'}
                        </span>
                      </div>

                      {/* Step 4 */}
                      <div style={{ textAlign: 'center', opacity: step >= 4 ? 1 : 0.45 }}>
                        <div style={{ 
                          width: 42, 
                          height: 42, 
                          borderRadius: '50%', 
                          background: step >= 4 ? 'var(--primary)' : 'rgba(255,255,255,0.08)', 
                          color: step >= 4 ? '#fff' : 'var(--text-muted)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          margin: '0 auto 8px',
                          boxShadow: step >= 4 ? '0 0 16px rgba(16,185,129,0.5)' : 'none'
                        }}>
                          <CheckCircle2 size={20} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: step >= 4 ? '#fff' : 'var(--text-muted)', display: 'block' }}>4. Delivered</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Completed</span>
                      </div>
                    </div>
                  </div>
                )}


                {/* Order Items List */}
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', padding: 12 }}>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img 
                          src={getSafeImageUrl(item.product?.imageUrl)} 
                          alt={item.product?.name} 
                          style={{ width: 38, height: 38, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} 
                          referrerPolicy="no-referrer"
                          onError={handleImageError}
                        />

                        <div>
                          <h5 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.product?.name}</h5>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} × ₹{item.unitPrice}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>₹{item.totalPrice}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Return Request Modal */}
      {selectedOrderForReturn && (
        <div className="modal-overlay" onClick={() => setSelectedOrderForReturn(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 16 }}>Request Return or Exchange</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>Order #{selectedOrderForReturn.orderNumber}</p>

            <form onSubmit={handleSubmitReturn}>
              <div className="form-group">
                <label className="form-label">Select Item</label>
                <select className="form-control" value={returnForm.orderItemId} onChange={(e) => setReturnForm({ ...returnForm, orderItemId: e.target.value })}>
                  {selectedOrderForReturn.items.map(item => (
                    <option key={item.id} value={item.id}>{item.product?.name} (Qty: {item.quantity})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Request Type</label>
                <select className="form-control" value={returnForm.requestType} onChange={(e) => setReturnForm({ ...returnForm, requestType: e.target.value })}>
                  <option value="RETURN">Return (Refund to original payment)</option>
                  <option value="EXCHANGE">Exchange (Replace item)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input type="number" min="1" max="10" className="form-control" value={returnForm.quantity} onChange={(e) => setReturnForm({ ...returnForm, quantity: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Return/Exchange</label>
                <textarea className="form-control" rows={3} required placeholder="e.g. Expired, damaged packaging, or wrong size received" value={returnForm.reason} onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedOrderForReturn(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Tracking Live Map Modal */}
      {trackingOrderModal && (
        <DeliveryTrackerModal 
          order={trackingOrderModal} 
          onClose={() => setTrackingOrderModal(null)} 
        />
      )}

    </div>
  );
}

