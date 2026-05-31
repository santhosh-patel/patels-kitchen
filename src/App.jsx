import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FoodDiscovery from './components/FoodDiscovery';
import PackagingShowcase from './components/PackagingShowcase';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import Receipt from './components/Receipt';
import AIAssistant from './components/AIAssistant';
import { Award, Compass, Heart, ShieldAlert, Sparkles, MapPin, Phone, Clock } from 'lucide-react';
import logoImg from './assets/logo.jpg';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [completedOrderData, setCompletedOrderData] = useState(null);
  const [selectedPackaging, setSelectedPackaging] = useState('none');

  // Scroll to element helper
  const handleScrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Cart operations
  const handleAddToPlate = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === item.id);
      if (existing) {
        return prevCart.map((i) => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });

    // Premium Micro-interaction sound indicator (Brass chime ring)
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(1046.50, audioCtx.currentTime); // C6 high brass-like ring
      gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
      oscillator.start();
      
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      // AudioContext blocked
    }
  };

  const handleUpdateQty = (itemId, qty) => {
    if (qty <= 0) {
      handleRemoveItem(itemId);
    } else {
      setCart((prev) => prev.map((item) => 
        item.id === itemId ? { ...item, quantity: qty } : item
      ));
    }
  };

  const handleRemoveItem = (itemId) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Order checkout flow
  const handleOrderComplete = (orderData) => {
    setIsCheckoutOpen(false);
    setCompletedOrderData(orderData);
  };

  const handleCloseReceipt = () => {
    setCompletedOrderData(null);
    setCart([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* 1. Glassmorphic Navigation Header */}
      <Header 
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        onScrollToSection={handleScrollToSection}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* 2. Royal Hero Presentation Banner */}
      <Hero onScrollToSection={handleScrollToSection} />

      {/* 3. About Heritage Section */}
      <section id="about-section" className="temple-border-top" style={{
        padding: '5rem 2rem',
        background: 'var(--pure-white)',
        borderBottom: '1px solid rgba(184, 138, 59, 0.15)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          
          <span style={{
            fontFamily: 'var(--font-headings)',
            color: 'var(--royal-gold)',
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.2em'
          }}>
            Our Sacred Roots
          </span>

          <h2 style={{
            fontSize: '2.5rem',
            fontFamily: 'var(--font-headings)',
            color: 'var(--deep-charcoal)',
            marginTop: '0.5rem',
            marginBottom: '1rem'
          }}>
            Tradition Served Fresh
          </h2>

          <div className="gold-divider">
            <span className="motif">✦ ❈ ✦</span>
          </div>

          <p style={{
            fontSize: '1.1rem',
            lineHeight: '1.8',
            color: '#444444',
            maxWidth: '800px',
            margin: '2rem auto 3rem',
            fontFamily: 'var(--font-body)'
          }}>
            Welcome to <strong>Patel's Kitchen</strong>, where authentic South Indian traditions and Hyderabadi culinary heritage come together. From crispy, golden-laced dosas and fluffy steamed idlis to slow-cooked aromatic biryanis and wood-charred paneer curries, every dish is prepared with carefully selected organic ingredients and family recipes inspired by generations of home cooking.
          </p>

          {/* Quick value badges */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '3rem',
            flexWrap: 'wrap',
            marginTop: '2rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '200px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--heritage-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--royal-gold)', marginBottom: '0.8rem' }}>
                <Award size={24} />
              </div>
              <h4 style={{ fontFamily: 'var(--font-headings)', fontSize: '1rem', marginBottom: '0.4rem' }}>Royal Heritage</h4>
              <p style={{ fontSize: '0.8rem', color: '#777' }}>Recipes handed down by the royal kitchens of Hyderabad.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '200px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--heritage-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--royal-gold)', marginBottom: '0.8rem' }}>
                <Compass size={24} />
              </div>
              <h4 style={{ fontFamily: 'var(--font-headings)', fontSize: '1rem', marginBottom: '0.4rem' }}>Pure Ingredients</h4>
              <p style={{ fontSize: '0.8rem', color: '#777' }}>Freshly stone-ground spices, zero preservatives, pure cow ghee.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '200px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--heritage-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--royal-gold)', marginBottom: '0.8rem' }}>
                <Heart size={24} />
              </div>
              <h4 style={{ fontFamily: 'var(--font-headings)', fontSize: '1rem', marginBottom: '0.4rem' }}>Patel Warmth</h4>
              <p style={{ fontSize: '0.8rem', color: '#777' }}>Traditional Indian hospitality served with modern refinement.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3.5. AI Food Concierge Spotlight Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'var(--heritage-cream)',
        color: 'var(--deep-charcoal)',
        borderTop: '1px solid rgba(184, 138, 59, 0.15)',
        borderBottom: '1px solid rgba(184, 138, 59, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decorative gold glow */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(184, 138, 59, 0.08)',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3rem', flexWrap: 'wrap', textAlign: 'left' }}>
          
          <div style={{ flex: '1 1 500px' }}>
            <span style={{
              fontFamily: 'var(--font-headings)',
              color: 'var(--royal-gold)',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Sparkles size={14} />
              Introducing State-of-the-Art Intelligence
            </span>
            <h2 style={{
              fontSize: '2.2rem',
              fontFamily: 'var(--font-headings)',
              color: 'var(--deep-charcoal)',
              marginTop: '0.5rem',
              marginBottom: '1rem'
            }}>
              Your Personal AI Food Concierge
            </h2>
            <p style={{ color: '#444444', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              Designed inspired by royal hospitality, our **Chef AI** maps your dietary profile, computes menu match scores in real time, respects allergies, and designs perfect multi-course feasts within your budget. Connected to Groq Llama 3 API for ultra-high-speed culinary counseling.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--traditional-brown)', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--royal-gold)' }} />
                <span>Protein & Gym Feasts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--royal-gold)' }} />
                <span>Allergy-Aware Exclusions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--royal-gold)' }} />
                <span>Smart Meal Combinations</span>
              </div>
            </div>
          </div>

          <div style={{
            flex: '0 0 280px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'var(--pure-white)',
            border: '1px solid rgba(184, 138, 59, 0.25)',
            borderRadius: '24px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: 'var(--soft-shadow)',
            backdropFilter: 'blur(8px)',
            margin: '0 auto'
          }}>
            <img 
              src={logoImg} 
              alt="Chef AI" 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--royal-gold)',
                marginBottom: '1rem',
                boxShadow: '0 8px 20px rgba(184, 138, 59, 0.1)'
              }}
            />
            <h4 style={{ fontFamily: 'var(--font-headings)', color: 'var(--deep-charcoal)', fontSize: '1rem', marginBottom: '0.3rem' }}>
              Chef AI Concierge
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--royal-gold)', fontStyle: 'italic', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Chef AI Butler Active
            </span>
            <button 
              onClick={() => {
                setIsAIAssistantOpen(true);
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.8rem 1.5rem',
                fontSize: '0.85rem',
                boxShadow: '0 2px 10px rgba(184, 138, 59, 0.15)'
              }}
            >
              Consult Chef AI
            </button>
          </div>

        </div>
      </section>

      {/* 4. Pinterest-Style Food Discovery menu Section */}
      <FoodDiscovery 
        onAddToPlate={handleAddToPlate}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        cart={cart}
      />

      {/* 5. Interactive 3D Packaging Showcase Section */}
      <PackagingShowcase 
        selectedPackaging={selectedPackaging}
        setSelectedPackaging={setSelectedPackaging}
      />

      {/* 6. Grand Luxury Footer */}
      <footer style={{
        backgroundColor: 'var(--heritage-cream)',
        color: 'var(--deep-charcoal)',
        padding: '5rem 2rem 3rem',
        borderTop: '1px solid rgba(184, 138, 59, 0.15)',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '3rem',
          borderBottom: '1px solid rgba(184, 138, 59, 0.12)',
          paddingBottom: '3rem'
        }}>
          {/* Column 1: Logo & Brand statement */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
              <img src={logoImg} alt="Footer Logo" style={{ width: '45px', height: '45px', borderRadius: '50%', border: '1.5px solid var(--royal-gold)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{ fontFamily: 'var(--font-headings)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--deep-charcoal)', letterSpacing: '0.05em' }}>PATEL'S</span>
                <span style={{ fontFamily: 'var(--font-headings)', fontSize: '0.65rem', color: 'var(--royal-gold)', letterSpacing: '0.25em' }}>KITCHEN</span>
              </div>
            </div>
            <p style={{ color: '#555555', fontSize: '0.85rem', lineHeight: '1.6' }}>
              Experience traditional Patel family hospitality and sensory royal Indian culinary masterworks slow-cooked with generations of love.
            </p>
          </div>

          {/* Column 2: Hours & Details */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-headings)', fontSize: '1rem', color: 'var(--deep-charcoal)', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
              RESTAURANT HOURS
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem', color: '#555555' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={14} style={{ color: 'var(--royal-gold)' }} />
                <span>Mon - Thu: 11:30 AM - 10:30 PM</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={14} style={{ color: 'var(--royal-gold)' }} />
                <span>Fri - Sun: 08:30 AM - 11:30 PM</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--royal-gold)', fontStyle: 'italic', marginLeft: '1.4rem' }}>
                *Breakfast served 8:30 AM - 11:30 AM Fri-Sun only
              </div>
            </div>
          </div>

          {/* Column 3: Contact Details */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-headings)', fontSize: '1rem', color: 'var(--deep-charcoal)', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
              THE MANOR ESTATE
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem', color: '#555555' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <MapPin size={16} style={{ color: 'var(--royal-gold)', flexShrink: 0, marginTop: '2px' }} />
                <span>14 Royal Palace Lane, Jubilee Hills,<br />Hyderabad, Telangana 500033</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={14} style={{ color: 'var(--royal-gold)' }} />
                <span>+91 98480 22338 / +91 40 22849182</span>
              </div>
            </div>
          </div>

          {/* Column 4: Administration */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-headings)', fontSize: '1rem', color: 'var(--deep-charcoal)', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
              ADMINISTRATION
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
              <p style={{ color: '#555555', fontSize: '0.8rem', lineHeight: '1.5', margin: 0 }}>
                Authorized personnel portal to manage menus, track kitchen preparation, run deep analytics, and process live ordering feeds.
              </p>
              <a 
                href="/#/admin"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--royal-gold)',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  marginTop: '0.4rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--traditional-brown)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--royal-gold)';
                }}
              >
                <span>Access Admin Dashboard</span>
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          maxWidth: '1200px',
          margin: '2rem auto 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.75rem',
          color: '#666666'
        }}>
          <span>© 2026 Patel's Kitchen. All Imperial Rights Reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer' }}>Royal Integrity Charter</span>
            <span style={{ cursor: 'pointer' }}>Privacy Sovereign</span>
            <span style={{ cursor: 'pointer' }}>Terms of Table Service</span>
          </div>
        </div>
      </footer>

      {/* 7. Floating Shopping Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* 8. Multi-Step Checkout Overlays */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onOrderComplete={handleOrderComplete}
      />

      {/* 9. Print-optimized Vintage Thermal Receipt Overlay */}
      <Receipt 
        orderData={completedOrderData}
        onClose={handleCloseReceipt}
      />

      {/* 10. Conversational Khansama AI Assistant Overlay widget */}
      <AIAssistant 
        onAddToPlate={handleAddToPlate}
        isOpen={isAIAssistantOpen}
        setIsOpen={setIsAIAssistantOpen}
      />

    </div>
  );
}
