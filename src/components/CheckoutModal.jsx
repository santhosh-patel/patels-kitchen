import React, { useState, useEffect, useCallback } from 'react';
import { X, Shield, Truck, Landmark, User, MapPin, Phone, Box, ShoppingBag, CheckCircle2, QrCode } from 'lucide-react';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  onOrderComplete
}) {
  const [step, setStep] = useState(1);
  const [deliveryMode, setDeliveryMode] = useState('dinein');
  const [checkoutPackaging, setCheckoutPackaging] = useState('none');
  const [paymentPhase, setPaymentPhase] = useState('idle'); // idle | qr | success
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const isDineIn = deliveryMode === 'dinein';
  const paymentStep = isDineIn ? 2 : 3;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setDeliveryMode('dinein');
      setCheckoutPackaging('none');
      setPaymentPhase('idle');
      setFormData({ name: '', phone: '', address: '', notes: '' });
    }
  }, [isOpen]);

  useEffect(() => {
    if (step !== paymentStep || paymentPhase !== 'idle') return;
    setPaymentPhase('qr');
  }, [step, paymentStep, paymentPhase]);

  useEffect(() => {
    if (paymentPhase !== 'qr') return;
    const timer = setTimeout(() => setPaymentPhase('success'), 3000);
    return () => clearTimeout(timer);
  }, [paymentPhase]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const packagingFee = !isDineIn && checkoutPackaging === 'box' ? 30 : (!isDineIn && checkoutPackaging === 'bag' ? 15 : 0);
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + packagingFee + gst;

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const completeOrder = useCallback(() => {
    const orderId = `PK-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    onOrderComplete({
      orderId,
      customerName: formData.name || 'Honored Patel Guest',
      phone: formData.phone || '+91 98480 22338',
      deliveryMode,
      address: isDineIn
        ? (formData.address || 'Table 14 - Royal Dining Hall')
        : (formData.address || 'Royal Suite Delivery'),
      date: new Date().toLocaleString(),
      packagingFee,
      gst,
      grandTotal,
      cart
    });
  }, [onOrderComplete, formData, deliveryMode, isDineIn, packagingFee, gst, grandTotal, cart]);

  useEffect(() => {
    if (paymentPhase !== 'success') return;
    const timer = setTimeout(completeOrder, 1500);
    return () => clearTimeout(timer);
  }, [paymentPhase, completeOrder]);

  if (!isOpen) return null;

  const handleDeliveryModeChange = (mode) => {
    setDeliveryMode(mode);
    if (mode === 'dinein') {
      setCheckoutPackaging('none');
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(isDineIn ? 2 : 2);
    } else if (step === 2 && !isDineIn) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === paymentStep && paymentPhase !== 'idle') {
      setPaymentPhase('idle');
    }
    if (step > 1) {
      setStep(step - 1);
      setPaymentPhase('idle');
    } else {
      onClose();
    }
  };

  const stepPills = isDineIn
    ? [
        { label: '1. Feast Mode', active: step >= 1, completed: step > 1 },
        { label: '2. Payment', active: step >= 2, completed: false }
      ]
    : [
        { label: '1. Feast Mode', active: step >= 1, completed: step > 1 },
        { label: '2. Royal Details', active: step >= 2, completed: step > 2 },
        { label: '3. Payment', active: step >= 3, completed: false }
      ];

  const qrData = `upi://pay?pa=sanrthoshpatel002@ptyes&pn=Patel's Kitchen&am=${grandTotal}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}`;

  const isOnPayment = step === paymentStep;
  const showFooter = !isOnPayment || paymentPhase === 'idle';

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        
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

              <div style={{ background: 'var(--heritage-cream)', borderRadius: '16px', padding: '1.2rem', marginTop: '1.5rem' }}>
                <h5 style={{ fontFamily: 'var(--font-headings)', fontSize: '0.85rem', marginBottom: '0.6rem', color: 'var(--traditional-brown)' }}>
                  Feast Valuation:
                </h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span>Dishes total ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>₹{subtotal}</span>
                </div>
                {packagingFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span>Heritage Packaging</span>
                    <span>₹{packagingFee}</span>
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
                Recipient Designation
              </h4>
              
              <div className="form-group">
                <label className="form-label">
                  <User size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Guest Name
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Maharaja Santhosh Patel"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Royal Helpline Phone Number
                </label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="e.g. +91 98480 22338"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <MapPin size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Estate/Delivery Address
                </label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  placeholder="Provide detailed instructions to your royal estate..."
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Chef Notes (Dietary Restrictions/Spiciness)</label>
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
                  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.2rem' }}>
                    Scan the UPI QR code with any payment app
                  </p>

                  <div className="qr-code-frame">
                    <img src={qrUrl} alt="UPI Payment QR Code" className="qr-code-image" />
                  </div>

                  <div className="qr-amount-display">
                    <QrCode size={16} style={{ color: 'var(--royal-gold)' }} />
                    <span>₹{grandTotal}</span>
                  </div>

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
            <button className="btn-secondary" onClick={handleBack}>
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            
            {step < paymentStep && (
              <button 
                className="btn-primary" 
                onClick={handleNextStep}
                disabled={step === 2 && !isDineIn && (!formData.name || !formData.phone)}
                style={{
                  opacity: (step === 2 && !isDineIn && (!formData.name || !formData.phone)) ? 0.5 : 1,
                  cursor: (step === 2 && !isDineIn && (!formData.name || !formData.phone)) ? 'not-allowed' : 'pointer'
                }}
              >
                {step === 1 && isDineIn ? 'Proceed to Payment' : 'Next'}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
