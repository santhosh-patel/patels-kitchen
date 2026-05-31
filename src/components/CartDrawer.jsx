import React, { useState, useEffect } from 'react';
import { X, Trash2, ShieldCheck, ShoppingBag } from 'lucide-react';
import { getCoupons, calculateDiscount } from '../data/store';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
  activeCoupon,
  setActiveCoupon
}) {
  const [couponInput, setCouponInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync coupon code input with activeCoupon state from parent
  useEffect(() => {
    if (activeCoupon) {
      setCouponInput(activeCoupon.code);
    } else {
      setCouponInput('');
    }
  }, [activeCoupon]);

  if (!isOpen) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate discount if coupon is applied
  const discount = activeCoupon ? calculateDiscount(activeCoupon, subtotal) : 0;
  const gst = Math.round((subtotal - discount) * 0.05);
  const grandTotal = subtotal - discount + gst;

  const handleApplyCoupon = () => {
    setErrorMsg('');
    if (!couponInput.trim()) return;

    const coupons = getCoupons();
    const found = coupons.find(c => c.code.toUpperCase() === couponInput.trim().toUpperCase());
    
    if (!found) {
      setErrorMsg('Invalid coupon code');
      return;
    }
    
    if (!found.isActive) {
      setErrorMsg('This coupon code is expired or inactive');
      return;
    }
    
    if (subtotal < found.minOrder) {
      setErrorMsg(`Minimum order of ₹${found.minOrder} required for this coupon`);
      return;
    }

    if (found.usageLimit && found.usageCount >= found.usageLimit) {
      setErrorMsg('This coupon has reached its usage limit');
      return;
    }

    // Check expiry date
    if (found.expiryDate && new Date(found.expiryDate) < new Date()) {
      setErrorMsg('This coupon has expired');
      return;
    }

    // Coupon is valid! Apply it!
    setActiveCoupon(found);
    setErrorMsg('');
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    setCouponInput('');
    setErrorMsg('');
  };

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        
        <div className="cart-header">
          <div className="cart-title-row">
            <ShoppingBag size={22} style={{ color: 'var(--royal-gold)' }} />
            <h3 className="cart-title">Your Plate</h3>
            <span className="cart-badge">{totalItems} items</span>
          </div>
          <button className="btn-cart-close" onClick={onClose} aria-label="Close cart">
            <X size={24} />
          </button>
        </div>

        <div className="cart-items-list">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.id} className="cart-item-card">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                
                <div className="cart-item-info">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <span className="cart-item-price">₹{item.price * item.quantity}</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.6rem' }}>
                    <div className="cart-item-qty">
                      <button 
                        className="qty-btn"
                        onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <button 
                      className="btn-trash"
                      onClick={() => onRemoveItem(item.id)}
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '6rem 2rem',
              color: '#888888',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <ShoppingBag size={48} style={{ color: 'var(--sandstone)', marginBottom: '1.2rem' }} />
              <h4 style={{ fontFamily: 'var(--font-headings)', color: 'var(--deep-charcoal)' }}>
                Your plate is empty
              </h4>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Add delectable South Indian specialties or signature biryanis to start your feast.
              </p>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-totals">
            
            <div className="royal-seal">
              <ShieldCheck size={14} style={{ color: 'var(--royal-gold)' }} />
              <span>Royal Patel Hospitality Guaranteed</span>
            </div>

            {/* Promo Code Input */}
            <div className="promo-code-container" style={{
              background: '#F9F6EE',
              border: '1px solid rgba(184, 138, 59, 0.15)',
              borderRadius: '12px',
              padding: '0.8rem',
              marginBottom: '1rem'
            }}>
              <label style={{
                fontFamily: 'var(--font-headings)',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--traditional-brown)',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.4rem',
                letterSpacing: '0.05em'
              }}>
                Apply Royal Promo Code
              </label>
              
              {!activeCoupon ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Enter code (e.g. WELCOME10)"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setErrorMsg('');
                    }}
                    style={{
                      flex: 1,
                      padding: '0.4rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid var(--sandstone)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      background: 'var(--pure-white)',
                      textTransform: 'uppercase'
                    }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    style={{
                      background: 'var(--royal-gold)',
                      color: 'var(--pure-white)',
                      border: 'none',
                      padding: '0.4rem 1rem',
                      borderRadius: '8px',
                      fontFamily: 'var(--font-headings)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(184, 138, 59, 0.08)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px dashed var(--royal-gold)' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--traditional-brown)', fontFamily: 'monospace' }}>{activeCoupon.code}</span>
                    <span style={{ fontSize: '0.72rem', color: '#666', marginLeft: '0.5rem' }}>({activeCoupon.description})</span>
                  </div>
                  <button 
                    onClick={handleRemoveCoupon}
                    style={{ background: 'transparent', border: 'none', color: '#cc3333', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              )}
              
              {errorMsg && (
                <span style={{ display: 'block', color: '#cc3333', fontSize: '0.72rem', marginTop: '0.3rem', fontWeight: 600 }}>
                  {errorMsg}
                </span>
              )}
            </div>

            <div className="totals-row">
              <span>Feast Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            {discount > 0 && (
              <div className="totals-row" style={{ color: 'var(--royal-gold)', fontWeight: 600 }}>
                <span>Royal Discount ({activeCoupon.code})</span>
                <span>-₹{discount}</span>
              </div>
            )}

            <div className="totals-row">
              <span>Taxes & GST (5%)</span>
              <span>₹{gst}</span>
            </div>

            <div className="totals-row grand-total">
              <span>Grand Total</span>
              <span>₹{grandTotal}</span>
            </div>

            <button 
              onClick={onCheckout}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.05rem',
                marginTop: '1rem',
                boxShadow: '0 6px 20px rgba(184, 138, 59, 0.3)'
              }}
            >
              Order Now & Generate Receipt
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
