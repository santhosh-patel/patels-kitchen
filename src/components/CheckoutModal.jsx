import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Shield, Truck, Landmark, User, MapPin, Phone, Box, ShoppingBag, CheckCircle2, QrCode } from 'lucide-react';
import { addOrder, getSettings } from '../data/store';
import { calculateOrderTotals } from '../lib/pricing';
import { buildUpiPaymentUri, generateUpiQrDataUrl } from '../lib/upiQr';
import { useFocusTrap } from '../hooks/useFocusTrap';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  onOrderComplete,
  activeCoupon,
  setActiveCoupon,
  initialPackaging = 'none',
  initialDeliveryMode = 'dinein'
}) {
  const [step, setStep] = useState(2);
  const [deliveryMode, setDeliveryMode] = useState('dinein');
  const [checkoutPackaging, setCheckoutPackaging] = useState('none');
  const [paymentPhase, setPaymentPhase] = useState('idle'); // idle | qr | success
  const [paymentRef, setPaymentRef] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrError, setQrError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    tableNumber: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const orderCompletedRef = useRef(false);

  const isDineIn = deliveryMode === 'dinein';
  const paymentStep = isDineIn ? 2 : 3;
  const settings = getSettings();

  useEffect(() => {
    if (isOpen) {
      orderCompletedRef.current = false;
      setStep(2);
      setDeliveryMode(initialDeliveryMode);
      setCheckoutPackaging(initialPackaging === 'none' ? 'none' : initialPackaging);
      setPaymentPhase('idle');
      setPaymentRef('');
      setQrDataUrl('');
      setQrError('');
      setFormData({ name: '', phone: '', address: '', tableNumber: '', notes: '' });
      setFormErrors({});
    }
  }, [isOpen, initialPackaging, initialDeliveryMode]);

  const totals = calculateOrderTotals({
    cart,
    deliveryMode,
    packaging: checkoutPackaging,
    coupon: activeCoupon,
    settings
  });
  const { subtotal, discount, packagingFee, deliveryFee, foodGst, packagingGst, tax: gst, grandTotal, taxRate } = totals;

  useEffect(() => {
    if (step !== paymentStep || paymentPhase !== 'idle') return;
    setPaymentRef(`PK${Date.now().toString(36).toUpperCase()}`);
    setPaymentPhase('qr');
  }, [step, paymentStep, paymentPhase]);

  const upiVpa = settings.upiVpa || 'sanrthoshpatel002@ptyes';
  const upiPayeeName = settings.upiPayeeName || "Patel's Kitchen".replace(/'/g, '');

  useEffect(() => {
    if (paymentPhase !== 'qr' || !paymentRef) {
      setQrDataUrl('');
      setQrError('');
      return undefined;
    }

    let cancelled = false;
    const upiUri = buildUpiPaymentUri({
      vpa: upiVpa,
      payeeName: upiPayeeName,
      amount: grandTotal,
      transactionRef: paymentRef,
      transactionNote: `Patels Kitchen order ${paymentRef}`
    });

    if (!upiUri) {
      setQrError('Unable to build payment link. Check UPI settings.');
      setQrDataUrl('');
      return undefined;
    }

    generateUpiQrDataUrl(upiUri)
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
          setQrError('');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrError('Could not generate QR code. Please try again.');
          setQrDataUrl('');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [paymentPhase, paymentRef, grandTotal, upiVpa, upiPayeeName]);

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const completeOrder = useCallback(() => {
    if (orderCompletedRef.current) return;
    orderCompletedRef.current = true;

    const orderId = `PK-${Math.floor(10000 + Math.random() * 90000)}`;
    const timestamp = new Date().toISOString();
    const dineInAddress = formData.tableNumber
      ? `Table ${formData.tableNumber} - Royal Dining Hall`
      : 'Table 14 - Royal Dining Hall';
    const finalOrder = addOrder({
      id: orderId,
      customerName: formData.name || 'Honored Patel Guest',
      phone: formData.phone || '+91 98480 22338',
      deliveryMode,
      address: isDineIn ? dineInAddress : (formData.address || 'Royal Suite Delivery'),
      packagingFee,
      packagingType: checkoutPackaging,
      subtotal,
      foodGst,
      packagingGst,
      tax: gst,
      deliveryFee,
      total: grandTotal,
      items: cart.map(item => ({
        ...item,
        lineTotal: item.price * item.quantity
      })),
      couponCode: activeCoupon ? activeCoupon.code : null,
      discount,
      specialInstructions: formData.notes || '',
      deliveryType: isDineIn ? 'Dine-in' : 'Delivery',
      timestamp
    });

    onOrderComplete({
      orderId: finalOrder.id,
      date: new Date(timestamp).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      deliveryMode,
      customerName: finalOrder.customerName,
      phone: finalOrder.phone,
      address: finalOrder.address,
      cart: cart.map(item => ({ ...item })),
      packagingFee,
      deliveryFee,
      discount,
      couponCode: activeCoupon ? activeCoupon.code : null,
      foodGst,
      packagingGst,
      gst,
      taxRate,
      grandTotal
    });
  }, [onOrderComplete, formData, deliveryMode, isDineIn, checkoutPackaging, packagingFee, deliveryFee, foodGst, packagingGst, gst, grandTotal, cart, activeCoupon, subtotal, discount, taxRate]);

  useEffect(() => {
    if (paymentPhase !== 'success') return;
    const timer = setTimeout(completeOrder, 1500);
    return () => clearTimeout(timer);
  }, [paymentPhase, completeOrder]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen || cart.length === 0) return null;

  const handleDeliveryModeChange = (mode) => {
    setDeliveryMode(mode);
    if (mode === 'dinein') {
      setCheckoutPackaging('none');
    }
  };

  const handleNextStep = () => {
    if (step === 2 && !isDineIn) {
      const errors = {};
      if (!formData.name.trim()) {
        errors.name = 'Guest name is required';
      }
      
      const cleanPhone = formData.phone.replace(/\s+/g, '');
      if (!formData.phone.trim()) {
        errors.phone = 'Phone number is required';
      } else if (!/^\+?[0-9]{10,14}$/.test(cleanPhone)) {
        errors.phone = 'Please enter a valid 10-12 digit phone number';
      }
      
      if (!formData.address.trim()) {
        errors.address = 'Delivery address is required';
      } else if (formData.address.trim().length < 8) {
        errors.address = 'Please enter a detailed street address';
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      setFormErrors({});
    }
    setStep(3);
  };

  const handleBack = () => {
    if (step === 2) {
      onClose();
      return;
    }
    if (step === paymentStep && paymentPhase !== 'idle') {
      setPaymentPhase('idle');
      setPaymentRef('');
      setQrDataUrl('');
      setQrError('');
    }
    if (step > 2) {
      setStep(step - 1);
      setPaymentPhase('idle');
      setPaymentRef('');
      setQrDataUrl('');
      setQrError('');
    } else {
      onClose();
    }
  };

  const stepPills = isDineIn
    ? [
        { label: 'Payment', active: true, completed: false }
      ]
    : [
        { label: '1. Delivery details', active: step >= 2, completed: step > 2 },
        { label: '2. Payment', active: step >= 3, completed: false }
      ];

  const qrData = buildUpiPaymentUri({
    vpa: upiVpa,
    payeeName: upiPayeeName,
    amount: grandTotal,
    transactionRef: paymentRef,
    transactionNote: paymentRef ? `Patels Kitchen order ${paymentRef}` : undefined
  });

  const isOnPayment = step === paymentStep;
  const showFooter = paymentPhase !== 'success';

  return (
    <div className="checkout-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Checkout">
      <div className="checkout-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        
        <div className="checkout-header">
          <h3 className="checkout-title">Royal Checkout</h3>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--traditional-brown)', cursor: 'pointer' }} onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="checkout-step-indicator">
          {stepPills.map((pill, idx) => (
            <span
              key={idx}
              className={`step-pill ${pill.active ? 'active' : ''} ${pill.completed ? 'completed' : ''}`}
            >
              {pill.label}
            </span>
          ))}
        </div>

        <div className="checkout-body">

          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.4s ease forwards' }}>
              <h4 style={{ fontFamily: 'var(--font-headings)', fontSize: '1.1rem', marginBottom: '1.2rem', color: 'var(--traditional-brown)' }}>
                Select Your Dining Experience
              </h4>
              <div className="delivery-options-row">
                
                <div 
                  className={`delivery-option-card ${deliveryMode === 'delivery' ? 'selected' : ''}`}
                  onClick={() => handleDeliveryModeChange('delivery')}
                >
                  <Truck size={30} className="delivery-icon" style={{ margin: '0 auto 0.5rem' }} />
                  <div className="delivery-name">Royal Delivery</div>
                  <p style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.3rem' }}>
                    Carefully driven directly to your royal estate by our premium valets.
                  </p>
                </div>

                <div 
                  className={`delivery-option-card ${deliveryMode === 'dinein' ? 'selected' : ''}`}
                  onClick={() => handleDeliveryModeChange('dinein')}
                >
                  <Landmark size={30} className="delivery-icon" style={{ margin: '0 auto 0.5rem' }} />
                  <div className="delivery-name">Table Dine-In</div>
                  <p style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.3rem' }}>
                    Served fresh in brass dinnerware directly to your table at the restaurant.
                  </p>
                </div>

              </div>

              {deliveryMode === 'delivery' && (
                <div className="cart-packaging-section" style={{ marginTop: '0.5rem' }}>
                  <h4 className="cart-packaging-title">Premium Packaging</h4>
                  <div className="packaging-options-row">
                    <div 
                      className={`packaging-option-card ${checkoutPackaging === 'box' ? 'selected' : ''}`}
                      onClick={() => setCheckoutPackaging(checkoutPackaging === 'box' ? 'none' : 'box')}
                    >
                      <div className="packaging-option-icon-container">
                        <Box size={20} />
                      </div>
                      <div className="packaging-option-name">Heritage Box</div>
                      <div className="packaging-option-desc">Cream gold-foiled box (+₹30)</div>
                    </div>

                    <div 
                      className={`packaging-option-card ${checkoutPackaging === 'bag' ? 'selected' : ''}`}
                      onClick={() => setCheckoutPackaging(checkoutPackaging === 'bag' ? 'none' : 'bag')}
                    >
                      <div className="packaging-option-icon-container">
                        <ShoppingBag size={20} />
                      </div>
                      <div className="packaging-option-name">Sandstone Bag</div>
                      <div className="packaging-option-desc">Premium matte finish (+₹15)</div>
                    </div>
                  </div>
                </div>
              )}

              {deliveryMode === 'dinein' && (
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">
                    <Landmark size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Table Number (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 14 — defaults to Table 14"
                    value={formData.tableNumber}
                    onChange={(e) => handleInputChange('tableNumber', e.target.value)}
                  />
                </div>
              )}

              <div style={{ background: 'var(--heritage-cream)', borderRadius: '16px', padding: '1.2rem', marginTop: '1.5rem' }}>
                <h5 style={{ fontFamily: 'var(--font-headings)', fontSize: '0.85rem', marginBottom: '0.6rem', color: 'var(--traditional-brown)' }}>
                  Order summary
                </h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span>Dishes total ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--royal-gold)', fontWeight: 600 }}>
                    <span>Discount ({activeCoupon.code})</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                {packagingFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span>Heritage Packaging</span>
                    <span>₹{packagingFee}</span>
                  </div>
                )}
                {deliveryFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span>Delivery fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span>Food GST ({taxRate}%)</span>
                  <span>₹{foodGst}</span>
                </div>
                {packagingFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span>Packaging GST (18%)</span>
                    <span>₹{packagingGst}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px dashed var(--sandstone)', paddingTop: '0.5rem', marginTop: '0.5rem', fontWeight: 700 }}>
                  <span>Grand total to pay:</span>
                  <span style={{ color: 'var(--royal-gold)' }}>₹{grandTotal}</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && !isDineIn && (
            <div style={{ animation: 'fadeIn 0.4s ease forwards' }}>
              <h4 style={{ fontFamily: 'var(--font-headings)', fontSize: '1.1rem', marginBottom: '1.2rem', color: 'var(--traditional-brown)' }}>
                Delivery details
              </h4>
              
              <div className="form-group">
                <label className="form-label">
                  <User size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Guest name
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => {
                    handleInputChange('name', e.target.value);
                    if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
                  }}
                  required
                  style={formErrors.name ? { borderColor: '#cc3333', boxShadow: '0 0 0 2px rgba(204,51,51,0.1)' } : {}}
                />
                {formErrors.name && <span style={{ color: '#cc3333', fontSize: '0.72rem', marginTop: '0.2rem', display: 'block' }}>{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Phone number
                </label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="e.g. +91 98480 22338"
                  value={formData.phone}
                  onChange={(e) => {
                    handleInputChange('phone', e.target.value);
                    if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  required
                  style={formErrors.phone ? { borderColor: '#cc3333', boxShadow: '0 0 0 2px rgba(204,51,51,0.1)' } : {}}
                />
                {formErrors.phone && <span style={{ color: '#cc3333', fontSize: '0.72rem', marginTop: '0.2rem', display: 'block' }}>{formErrors.phone}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <MapPin size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Delivery address
                </label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  placeholder="Street, area, landmark..."
                  value={formData.address}
                  onChange={(e) => {
                    handleInputChange('address', e.target.value);
                    if (formErrors.address) setFormErrors(prev => ({ ...prev, address: '' }));
                  }}
                  required
                  style={{
                    resize: 'none',
                    ...(formErrors.address ? { borderColor: '#cc3333', boxShadow: '0 0 0 2px rgba(204,51,51,0.1)' } : {})
                  }}
                />
                {formErrors.address && <span style={{ color: '#cc3333', fontSize: '0.72rem', marginTop: '0.2rem', display: 'block' }}>{formErrors.address}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Special instructions (optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Prepare extremely spicy; extra lemons."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
              </div>
            </div>
          )}

          {isOnPayment && (
            <div className="qr-payment-container" style={{ animation: 'fadeIn 0.4s ease forwards' }}>
              {paymentPhase === 'qr' && (
                <>
                  <h4 style={{ fontFamily: 'var(--font-headings)', fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--traditional-brown)' }}>
                    Scan to Pay
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                    Scan the UPI QR code with any payment app
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#888', fontWeight: 500, marginBottom: '1.2rem' }}>
                    Demo mode: tap confirm below after scanning, or without scanning.
                  </p>

                  <div className="qr-code-frame">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="UPI Payment QR Code" className="qr-code-image" />
                    ) : (
                      <div className="qr-code-placeholder">
                        {qrError || 'Generating QR code...'}
                      </div>
                    )}
                  </div>

                  <p className="qr-upi-id">
                    Pay to: <strong>{upiVpa}</strong>
                  </p>

                  {qrData && (
                    <p className="qr-ref-id">Ref: {paymentRef}</p>
                  )}

                  <div className="qr-amount-display">
                    <QrCode size={16} style={{ color: 'var(--royal-gold)' }} />
                    <span>₹{grandTotal}</span>
                  </div>

                  {isDineIn && (
                    <div style={{ marginTop: '0.8rem', width: '100%', maxWidth: '240px', margin: '0.8rem auto 0' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', color: 'var(--traditional-brown)', fontWeight: 600, marginBottom: '0.3rem' }}>
                        <Landmark size={12} style={{ color: 'var(--royal-gold)' }} />
                        Table Number (Optional)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 14 — defaults to Table 14"
                        value={formData.tableNumber}
                        onChange={(e) => handleInputChange('tableNumber', e.target.value.replace(/\D/g, ''))}
                        style={{ textAlign: 'center', fontSize: '0.85rem', padding: '0.4rem', border: '1px solid var(--sandstone)', borderRadius: '8px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  )}

                  <div className="qr-scanning-indicator">
                    <div className="qr-scan-line" />
                    <span>Waiting for payment...</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#666666', marginTop: '1.2rem', justifyContent: 'center' }}>
                    <Shield size={14} style={{ color: 'var(--royal-gold)' }} />
                    <span>256-bit encrypted via Patel Trust UPI</span>
                  </div>
                </>
              )}

              {paymentPhase === 'success' && (
                <div className="payment-success-animation">
                  <div className="payment-success-circle">
                    <CheckCircle2 size={48} className="payment-success-icon" />
                  </div>
                  <h4 className="payment-success-title">Payment Successful</h4>
                  <p className="payment-success-subtitle">Generating your royal receipt...</p>
                </div>
              )}
            </div>
          )}

        </div>

        {showFooter && (
          <div className="checkout-footer">
            <button type="button" className="btn-secondary" onClick={handleBack}>
              {step === 2 ? 'Cancel' : 'Back'}
            </button>

            {isOnPayment && paymentPhase === 'qr' ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setPaymentPhase('success')}
              >
                I&apos;ve completed payment
              </button>
            ) : step < paymentStep ? (
              <button
                type="button"
                className="btn-primary"
                onClick={handleNextStep}
              >
                Next
              </button>
            ) : null}
          </div>
        )}

      </div>
    </div>
  );
}
