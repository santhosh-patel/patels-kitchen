import { useState, useEffect } from 'react';
import { X, Trash2, ShieldCheck, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { getCoupons, getSettings } from '../data/store';
import { calculateOrderTotals } from '../lib/pricing';
import { navigate } from '../lib/navigation';
import { getDishImage } from '../lib/dishImage';
import { useFocusTrap } from '../hooks/useFocusTrap';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
  activeCoupon,
  setActiveCoupon,
  minOrderMet,
  minOrderShortfall,
  minOrder
}) {
  const [couponInput, setCouponInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showOffers, setShowOffers] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);

  useEffect(() => {
    if (activeCoupon) {
      setCouponInput(activeCoupon.code);
    } else {
      setCouponInput('');
    }
  }, [activeCoupon]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const drawerRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const settings = getSettings();
  const deliveryEstimate = calculateOrderTotals({
    cart,
    deliveryMode: 'delivery',
    packaging: 'none',
    coupon: activeCoupon,
    settings
  });
  const { subtotal, discount, tax: gst, deliveryFee, grandTotal, taxRate } = deliveryEstimate;

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

    if (found.expiryDate && new Date(found.expiryDate) < new Date()) {
      setErrorMsg('This coupon has expired');
      return;
    }

    setActiveCoupon(found);
    setErrorMsg('');
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    setCouponInput('');
    setErrorMsg('');
  };

  const browseMenu = () => {
    onClose();
    navigate('/menu');
  };

  return (
    <div className="cart-drawer-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="cart-drawer" ref={drawerRef} onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div className="cart-title-row">
            <ShoppingBag size={22} style={{ color: 'var(--royal-gold)' }} />
            <h3 className="cart-title">Your Plate</h3>
            <span className="cart-badge">{totalItems} items</span>
          </div>
          <button type="button" className="btn-cart-close" onClick={onClose} aria-label="Close cart">
            <X size={24} />
          </button>
        </div>

        <div className="cart-items-list">
          {cart.length > 0 ? (
            cart.map((item) => {
              const img = getDishImage(item) || item.image;
              return (
                <div key={item.id} className="cart-item-card">
                  {img ? (
                    <img src={img} alt={item.name} className="cart-item-img" />
                  ) : (
                    <div className="cart-item-img cart-item-img-placeholder" aria-hidden="true" />
                  )}

                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <span className="cart-item-price">₹{item.price * item.quantity}</span>

                    <div className="cart-item-actions">
                      <div className="cart-item-qty">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="btn-trash"
                        onClick={() => onRemoveItem(item.id)}
                        title="Remove Item"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="cart-empty-state">
              <ShoppingBag size={48} style={{ color: 'var(--sandstone)', marginBottom: '1.2rem' }} />
              <h4>Your plate is empty</h4>
              <p>Add South Indian specialties or signature biryanis to start your feast.</p>
              <button type="button" className="btn-primary" onClick={browseMenu} style={{ marginTop: '1.2rem' }}>
                Browse Menu
              </button>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-totals">
            <div className="royal-seal">
              <ShieldCheck size={14} style={{ color: 'var(--royal-gold)' }} />
              <span>Royal Patel Hospitality Guaranteed</span>
            </div>

            <div className="cart-promo-accordion">
              <button
                type="button"
                className="cart-promo-toggle"
                onClick={() => setPromoOpen(!promoOpen)}
                aria-expanded={promoOpen}
              >
                <span>Have a promo code?</span>
                {promoOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {promoOpen && (
                <div className="promo-code-container">
                  {!activeCoupon ? (
                    <>
                      <div className="promo-input-row">
                        <input
                          type="text"
                          placeholder="Enter code (e.g. ROYAL20)"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value);
                            setErrorMsg('');
                          }}
                          className="promo-input"
                        />
                        <button type="button" className="promo-apply-btn" onClick={handleApplyCoupon}>
                          Apply
                        </button>
                      </div>
                      <div style={{ marginTop: '0.4rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="promo-offers-link"
                          onClick={() => setShowOffers(!showOffers)}
                        >
                          {showOffers ? 'Hide Active Offers' : 'View Active Offers'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="promo-applied">
                      <div>
                        <span className="promo-code-text">{activeCoupon.code}</span>
                        <span className="promo-code-desc">({activeCoupon.description})</span>
                      </div>
                      <button type="button" className="promo-remove-btn" onClick={handleRemoveCoupon}>
                        Remove
                      </button>
                    </div>
                  )}

                  {showOffers && !activeCoupon && (
                    <div className="promo-offers-list">
                      {getCoupons().filter(c => c.isActive && new Date(c.expiryDate) > new Date()).map(c => (
                        <button
                          key={c.id}
                          type="button"
                          className="promo-offer-item"
                          onClick={() => {
                            setCouponInput(c.code);
                            setErrorMsg('');
                            setShowOffers(false);
                          }}
                        >
                          <div>
                            <span className="promo-code-text">{c.code}</span>
                            <span className="promo-code-desc">{c.description}</span>
                          </div>
                          <span className="promo-apply-label">Apply</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {errorMsg && <span className="promo-error">{errorMsg}</span>}
                </div>
              )}
            </div>

            <div className="cart-totals-scroll">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="totals-row totals-discount">
                  <span>Discount ({activeCoupon.code})</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="totals-row">
                <span>Taxes & GST ({taxRate}%)</span>
                <span>₹{gst}</span>
              </div>

              <div className="totals-row totals-muted">
                <span>Est. delivery fee (if delivery)</span>
                <span>{deliveryFee > 0 ? `₹${deliveryFee}` : 'Free'}</span>
              </div>

              <div className="totals-row grand-total">
                <span>Grand Total</span>
                <span>₹{grandTotal}</span>
              </div>

              {!minOrderMet && (
                <p className="cart-min-order-msg">
                  Add ₹{minOrderShortfall} more to reach minimum order (₹{minOrder})
                </p>
              )}
            </div>

            <div className="cart-checkout-footer">
              <button
                type="button"
                onClick={onCheckout}
                disabled={!minOrderMet}
                className="btn-primary cart-checkout-btn"
              >
                Order Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
