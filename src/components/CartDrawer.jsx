import React from 'react';
import { X, Trash2, ShieldCheck, ShoppingBag } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onCheckout
}) {
  if (!isOpen) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gst;

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

            <div className="totals-row">
              <span>Feast Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

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
