import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, Package, Truck, Utensils, 
  ChefHat, CheckCircle2, Clock, Sparkles, Receipt,
  HelpCircle
} from 'lucide-react';
import { getOrders } from '../data/store';
import logoImg from '../assets/logo.jpg';

export default function OrderTracker() {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [order, setOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Extract ID from URL Hash e.g. #/track?id=PK-12345
  const getOrderIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('id')) return params.get('id');
    const hash = window.location.hash;
    const match = hash.match(/[?&]id=([^&]+)/);
    return match ? match[1] : '';
  };

  const lookupOrder = (id) => {
    if (!id) return;
    const orders = getOrders();
    const found = orders.find(o => o.id.toUpperCase() === id.trim().toUpperCase());
    if (found) {
      setOrder(found);
      setErrorMsg('');
    } else {
      setOrder(null);
      setErrorMsg(`We couldn't find order "${id}". Please verify the ID.`);
    }
  };

  // Poll localStorage every 2 seconds to capture real-time status updates from Admin Dashboard!
  useEffect(() => {
    const id = getOrderIdFromUrl();
    if (id) {
      lookupOrder(id);
    }

    const interval = setInterval(() => {
      const currentId = getOrderIdFromUrl();
      if (currentId) {
        const orders = getOrders();
        const found = orders.find(o => o.id.toUpperCase() === currentId.trim().toUpperCase());
        if (found) {
          setOrder(found);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [window.location.hash]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;
    window.history.replaceState(null, '', `/track?id=${orderIdInput.trim().toUpperCase()}`);
    lookupOrder(orderIdInput.trim());
  };

  // Mapping internal status pool into user-facing vertical tracking steps
  const getTrackingSteps = (deliveryType, currentStatus) => {
    const isDineIn = deliveryType?.toLowerCase() === 'dine-in';

    const steps = [
      { 
        key: 'New', 
        label: 'Order Placed', 
        desc: 'Our royal kitchen has received your feast request.',
        icon: Clock 
      },
      { 
        key: 'Accepted', 
        label: 'Order Approved', 
        desc: 'Manager verified payment and assigned custom instructions.',
        icon: CheckCircle2 
      },
      { 
        key: 'Preparing', 
        label: 'Feast Cooking', 
        desc: 'Our master chefs are slow-cooking your dishes in brassware.',
        icon: ChefHat 
      },
      { 
        key: 'Ready', 
        label: 'Royal Packaging', 
        desc: 'Dishes are packaged hot inside gold-embossed containers.',
        icon: Package 
      },
      { 
        key: 'Out for Delivery', 
        label: isDineIn ? 'Serving to Table' : 'Valet Out for Delivery', 
        desc: isDineIn ? 'Our servers are carrying the feast to your table.' : 'Our valet is driving the premium container directly to you.',
        icon: isDineIn ? Utensils : Truck 
      },
      { 
        key: 'Delivered', 
        label: isDineIn ? 'Served & Honored' : 'Delivered & Honored', 
        desc: 'Feast completed! We hope you have a spectacular meal.',
        icon: Sparkles 
      }
    ];

    // Status matching function to colorize completed and active items
    const statusMap = {
      'New': 0,
      'Accepted': 1,
      'Preparing': 2,
      'Ready': 3,
      'Out for Delivery': 4,
      'Delivered': 5,
      'Served': 5,
      'Cancelled': -1
    };

    const currentIdx = statusMap[currentStatus] !== undefined ? statusMap[currentStatus] : 0;

    return steps.map((s, idx) => {
      let state = 'pending'; // pending | active | completed
      if (currentStatus === 'Cancelled') {
        state = 'cancelled';
      } else if (idx < currentIdx) {
        state = 'completed';
      } else if (idx === currentIdx) {
        state = 'active';
      }
      return { ...s, state };
    });
  };

  const trackingSteps = order ? getTrackingSteps(order.deliveryType, order.status) : [];

  return (
    <div className="standalone-page" style={{ background: 'var(--ivory)' }}>
      <main id="main-content" className="standalone-container">
        
        <header className="standalone-header">
          <a href="/" className="standalone-back-link">
            <ArrowLeft size={16} /> Back to Palace
          </a>

          <div className="standalone-brand">
            <img src={logoImg} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--royal-gold)', flexShrink: 0 }} />
            <span>PATEL'S KITCHEN</span>
          </div>
        </header>

        {!order ? (
          /* SEARCH STATE */
          <div style={{
            background: 'var(--pure-white)',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(92, 61, 46, 0.05)',
            border: '1.5px solid rgba(184, 138, 59, 0.15)',
            padding: 'clamp(1.5rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem)',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease'
          }}>
            <Sparkles size={42} style={{ color: 'var(--royal-gold)', marginBottom: '1rem' }} />
            <h2 className="section-title" style={{ marginBottom: '0.8rem' }}>
              Track Your Royal Feast
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#666', maxWidth: '450px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
              Input your unique order tracking code (e.g. PK-18239) found on your digital thermal receipt to see real-time preparation updates.
            </p>

            <form onSubmit={handleSearchSubmit} className="track-search-form">
              <input 
                type="search"
                placeholder="Enter Order ID (e.g., PK-10342)"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                aria-label="Order ID"
                style={{
                  padding: '0.8rem 1.2rem',
                  borderRadius: '10px',
                  border: '1.5px solid var(--sandstone)',
                  outline: 'none',
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  fontFamily: 'monospace'
                }}
              />
              <button type="submit" className="btn-primary" style={{
                padding: '0 1.5rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <Search size={16} /> Search
              </button>
            </form>

            {errorMsg && (
              <div style={{
                color: '#cc3333',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginTop: '1rem',
                background: '#fdf3f3',
                padding: '0.6rem',
                borderRadius: '8px',
                display: 'inline-block'
              }}>
                {errorMsg}
              </div>
            )}
          </div>
        ) : (
          /* LIVE TRACKER PRESENTATION */
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            
            {/* Order Brief Info */}
            <div style={{
              background: 'var(--pure-white)',
              borderRadius: '20px',
              border: '1.5px solid rgba(184, 138, 59, 0.15)',
              padding: '1.5rem',
              boxShadow: '0 10px 30px rgba(92, 61, 46, 0.05)',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--royal-gold)', fontWeight: 700 }}>
                  Live Tracking Portal
                </span>
                <h2 style={{ fontFamily: 'var(--font-headings)', fontSize: '1.6rem', color: 'var(--deep-charcoal)', marginTop: '0.2rem' }}>
                  Order: <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{order.id}</span>
                </h2>
                <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.8rem', color: '#666', marginTop: '0.4rem' }}>
                  <span>{order.deliveryType}</span>
                  <span>•</span>
                  <span>{new Date(order.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {order.status === 'Cancelled' ? (
                <div style={{ background: '#fdf3f3', color: '#cc3333', border: '1px solid #ecc', padding: '0.6rem 1rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem' }}>
                  Feast Cancelled
                </div>
              ) : (
                <div style={{
                  background: 'rgba(184, 138, 59, 0.08)',
                  border: '1.5px solid var(--royal-gold)',
                  borderRadius: '12px',
                  padding: '0.6rem 1rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#666', letterSpacing: '0.05em' }}>Current Status</div>
                  <div style={{ fontWeight: 800, color: 'var(--traditional-brown)', fontFamily: 'var(--font-headings)', fontSize: '1.1rem' }}>
                    {order.status}
                  </div>
                </div>
              )}
            </div>

            {/* Tracking Flow Timeline */}
            <div style={{
              background: 'var(--pure-white)',
              borderRadius: '20px',
              border: '1.5px solid rgba(184, 138, 59, 0.15)',
              padding: '2rem 1.5rem',
              boxShadow: '0 10px 30px rgba(92, 61, 46, 0.05)',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ fontFamily: 'var(--font-headings)', fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--traditional-brown)' }}>
                Preparation Progress Timeline
              </h3>

              {order.status === 'Cancelled' ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#666' }}>
                  <HelpCircle size={40} style={{ color: '#cc3333', marginBottom: '0.8rem' }} />
                  <h4 style={{ color: '#cc3333', fontWeight: 700 }}>Order was Cancelled</h4>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
                    This order was cancelled by the restaurant management. Please get in touch with our helpline for assistance.
                  </p>
                </div>
              ) : (
                <div className="vertical-timeline" style={{ position: 'relative', paddingLeft: '2.5rem' }}>
                  
                  {/* Spine connecting line */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    bottom: '12px',
                    left: '14px',
                    width: '3px',
                    background: 'var(--heritage-cream)',
                    zIndex: 1
                  }} />

                  {trackingSteps.map((step, idx) => {
                    const isActive = step.state === 'active';
                    const isCompleted = step.state === 'completed';
                    
                    return (
                      <div key={idx} style={{
                        position: 'relative',
                        marginBottom: idx === trackingSteps.length - 1 ? 0 : '1.8rem',
                        opacity: step.state === 'pending' ? 0.5 : 1,
                        transition: 'all 0.3s ease'
                      }}>
                        
                        {/* Dot Indicator */}
                        <div style={{
                          position: 'absolute',
                          left: '-2.5rem',
                          top: '2px',
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          background: isCompleted ? 'var(--royal-gold)' : (isActive ? 'var(--traditional-brown)' : 'var(--pure-white)'),
                          border: isCompleted ? '2px solid var(--royal-gold)' : (isActive ? '2px solid var(--traditional-brown)' : '2.5px solid var(--heritage-cream)'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2,
                          boxShadow: isActive ? '0 0 10px rgba(92, 61, 46, 0.4)' : 'none'
                        }}>
                          <step.icon size={14} style={{ color: (isActive || isCompleted) ? 'var(--pure-white)' : 'var(--sandstone)' }} />
                        </div>

                        {/* Text */}
                        <div>
                          <h4 style={{
                            fontFamily: 'var(--font-headings)',
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            color: isActive ? 'var(--royal-gold)' : (isCompleted ? 'var(--deep-charcoal)' : '#888'),
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {step.label}
                            {isActive && (
                              <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'var(--royal-gold)',
                                display: 'inline-block',
                                animation: 'ping 1.5s infinite'
                              }} />
                            )}
                          </h4>
                          <p style={{
                            fontSize: '0.8rem',
                            color: step.state === 'pending' ? '#999' : '#555',
                            marginTop: '0.2rem',
                            lineHeight: '1.4'
                          }}>
                            {step.desc}
                          </p>
                        </div>

                      </div>
                    );
                  })}

                </div>
              )}
            </div>

            {/* Feast Summary Details */}
            <div style={{
              background: 'var(--pure-white)',
              borderRadius: '20px',
              border: '1.5px solid rgba(184, 138, 59, 0.15)',
              padding: '1.5rem',
              boxShadow: '0 10px 30px rgba(92, 61, 46, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px dashed var(--sandstone)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
                <Receipt size={16} style={{ color: 'var(--royal-gold)' }} />
                <h3 style={{ fontFamily: 'var(--font-headings)', fontSize: '1.15rem', color: 'var(--traditional-brown)' }}>
                  Feast Summary
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {order.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>
                      <strong style={{ color: 'var(--traditional-brown)' }}>{item.quantity}x</strong> {item.name}
                    </span>
                    <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px dashed var(--sandstone)', marginTop: '1rem', paddingTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: '#666' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                {order.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--royal-gold)', fontWeight: 600 }}>
                    <span>Promo Discount ({order.couponCode})</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                {order.packagingFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Packaging Fee</span>
                    <span>₹{order.packagingFee}</span>
                  </div>
                )}
                {order.deliveryFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Delivery Fee</span>
                    <span>₹{order.deliveryFee}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tax & GST ({order.taxRate ?? 5}%)</span>
                  <span>₹{order.tax}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800, color: 'var(--deep-charcoal)', borderTop: '1px solid var(--heritage-cream)', paddingTop: '0.6rem', marginTop: '0.4rem' }}>
                  <span>Total Feast Value</span>
                  <span style={{ color: 'var(--royal-gold)' }}>₹{order.total}</span>
                </div>
              </div>

              {order.specialInstructions && (
                <div style={{ background: 'var(--light-ivory)', border: '1px solid rgba(184, 138, 59, 0.12)', borderRadius: '10px', padding: '0.8rem', marginTop: '1rem', fontSize: '0.8rem' }}>
                  <strong style={{ color: 'var(--traditional-brown)' }}>Chef Notes:</strong> {order.specialInstructions}
                </div>
              )}
            </div>

            <div className="track-actions">
              <button 
                type="button"
                onClick={() => { window.history.replaceState(null, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                className="btn-primary"
                style={{
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.85rem'
                }}
              >
                Return to Palace Home
              </button>
              <button 
                type="button"
                onClick={() => { window.history.replaceState(null, '', '/menu'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                className="btn-secondary"
                style={{
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.85rem'
                }}
              >
                Order More Delicacies
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
