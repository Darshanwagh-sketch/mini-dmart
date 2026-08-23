import React, { useState } from 'react';
import { ShoppingBag, Search, User, Store, Shield, LogOut, AlertTriangle, X } from 'lucide-react';

export default function Navbar({ 
  user, 
  activeView, 
  setActiveView, 
  cartCount, 
  onOpenCart, 
  onOpenAuth, 
  onLogout,
  searchQuery,
  setSearchQuery,
  stores,
  selectedStore,
  setSelectedStore
}) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          {/* Brand */}
          <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); setActiveView('storefront'); }}>
            <ShoppingBag className="text-primary" size={28} style={{ color: 'var(--primary)' }} />
            <span>Mini <span style={{ color: 'var(--primary)' }}>D-Mart</span></span>
            <span className="brand-badge">Express</span>
          </a>

          {/* Search */}
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search 1,000+ groceries, fruits, beverages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Store Branch Picker */}
          <div className="store-picker" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-glass)', fontSize: '0.8rem' }}>
            <Store size={15} style={{ color: 'var(--primary)' }} />
            <select 
              value={selectedStore?.id || ''} 
              onChange={(e) => {
                const store = stores.find(s => s.id === Number(e.target.value));
                setSelectedStore(store);
              }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
            >
              {stores.map(s => (
                <option key={s.id} value={s.id} style={{ background: '#111827', color: '#fff' }}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nav Actions */}
          <div className="nav-actions">
            {/* Staff View Button (Only visible when logged in as Staff or Admin) */}
            {(user?.role === 'ROLE_STAFF' || user?.role === 'ROLE_ADMIN') && (
              <button 
                className={`btn btn-sm ${activeView === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveView('staff')}
              >
                <Shield size={16} /> Staff Queue
              </button>
            )}

            {/* Admin View Button (Only visible when logged in as Admin) */}
            {user?.role === 'ROLE_ADMIN' && (
              <button 
                className={`btn btn-sm ${activeView === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ background: activeView === 'admin' ? 'var(--accent-purple)' : '' }}
                onClick={() => setActiveView('admin')}
              >
                <Shield size={16} /> Admin Portal
              </button>
            )}

            {/* Cart Trigger */}
            <button className="btn btn-secondary" onClick={onOpenCart} style={{ position: 'relative' }}>
              <ShoppingBag size={18} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span style={{ 
                  position: 'absolute', 
                  top: -6, 
                  right: -6, 
                  background: 'var(--primary)', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: 20, 
                  height: 20, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.75rem', 
                  fontWeight: 700 
                }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Sign In */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button 
                  className={`btn btn-sm ${activeView === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveView('customer')}
                >
                  <User size={16} /> {user.fullName.split(' ')[0]}
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setShowLogoutConfirm(true)} 
                  title="Sign Out"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={onOpenAuth}>
                <User size={18} /> Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sign Out Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420, textAlign: 'center', padding: 28 }}>
            <button 
              onClick={() => setShowLogoutConfirm(false)} 
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              background: 'rgba(239, 68, 68, 0.15)', 
              border: '1px solid var(--danger)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px',
              color: 'var(--danger)'
            }}>
              <AlertTriangle size={30} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8, color: '#fff' }}>
              Confirm Sign Out
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
              Are you sure you want to sign out of your account (<strong style={{ color: '#fff' }}>{user?.fullName}</strong>)?
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowLogoutConfirm(false)} 
                style={{ flex: 1, padding: '10px 16px' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }} 
                style={{ flex: 1, padding: '10px 16px', background: 'var(--danger)', borderColor: 'var(--danger)' }}
              >
                <LogOut size={16} /> Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
