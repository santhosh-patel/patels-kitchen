import React from 'react';
import { Award, Shield, Check, Box } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export default function PackagingShowcase({ selectedPackaging, setSelectedPackaging }) {
  return (
    <section id="packaging-section" className="packaging-showcase-section">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Section Title */}
        <span style={{
          fontFamily: 'var(--font-headings)',
          color: 'var(--royal-gold)',
          fontSize: '0.85rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.2em'
        }}>
          Sensory Touchpoints
        </span>
        
        <h2 style={{
          fontSize: '2.5rem',
          fontFamily: 'var(--font-headings)',
          color: 'var(--deep-charcoal)',
          marginTop: '0.5rem',
          marginBottom: '1rem'
        }}>
          Royal Takeaway Packaging
        </h2>
        
        <div className="gold-divider">
          <span className="motif">✦ ❈ ✦</span>
        </div>
        
        <p style={{ maxWidth: '650px', margin: '0 auto', fontSize: '0.95rem' }}>
          Our heritage hospitality doesn't stop at the table. Every delivery and takeaway order is packed inside biodegradable, heat-retentive custom materials adorned with gold foil detailing.
        </p>

        {/* 3D Box Showcase Cards */}
        <div className="showcase-grid">
          
          {/* Card 1: Takeaway Box */}
          <div 
            className="pkg-card-3d"
            onClick={() => setSelectedPackaging(selectedPackaging === 'box' ? 'none' : 'box')}
            style={{
              borderColor: selectedPackaging === 'box' ? 'var(--royal-gold)' : 'rgba(216, 196, 165, 0.3)',
              background: selectedPackaging === 'box' ? 'var(--ivory)' : 'var(--pure-white)'
            }}
          >
            {/* Box 3D Shape Mockup */}
            <div className="pkg-box-mockup">
              <div className="pkg-box-seal">
                <img src={logoImg} alt="Seal" className="pkg-box-seal-icon" style={{ borderRadius: '50%' }} />
              </div>
            </div>

            <h3 className="pkg-title">Heritage Takeaway Box</h3>
            
            <p className="pkg-desc" style={{ marginBottom: '1.2rem' }}>
              Rigid, steam-vented cardboard containers dressed in Heritage Cream with our embossed Royal Gold turban logo. Keeps biryanis steaming-hot.
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: selectedPackaging === 'box' ? 'var(--royal-gold)' : 'var(--deep-charcoal)',
              background: selectedPackaging === 'box' ? 'var(--pure-white)' : 'var(--heritage-cream)',
              padding: '0.5rem 1.2rem',
              borderRadius: '99px',
              transition: 'var(--transition-fast)'
            }}>
              {selectedPackaging === 'box' ? (
                <>
                  <Check size={14} />
                  <span>Selected for Order</span>
                </>
              ) : (
                <span>Select for Delivery (+₹30)</span>
              )}
            </div>
          </div>

          {/* Card 2: Matte Sandstone Bag */}
          <div 
            className="pkg-card-3d"
            onClick={() => setSelectedPackaging(selectedPackaging === 'bag' ? 'none' : 'bag')}
            style={{
              borderColor: selectedPackaging === 'bag' ? 'var(--royal-gold)' : 'rgba(216, 196, 165, 0.3)',
              background: selectedPackaging === 'bag' ? 'var(--ivory)' : 'var(--pure-white)'
            }}
          >
            {/* Bag 3D Shape Mockup */}
            <div className="pkg-box-mockup bag">
              <div className="pkg-box-seal" style={{ top: '35%' }}>
                <img src={logoImg} alt="Seal" className="pkg-box-seal-icon" style={{ borderRadius: '50%' }} />
              </div>
            </div>

            <h3 className="pkg-title">Embossed Sandstone Bag</h3>
            
            <p className="pkg-desc" style={{ marginBottom: '1.2rem' }}>
              Matte-finish thick cotton-fiber bags in sandstone hues, featuring heavy braided handles and our traditional gold signature foil. Perfect for gifting.
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: selectedPackaging === 'bag' ? 'var(--royal-gold)' : 'var(--deep-charcoal)',
              background: selectedPackaging === 'bag' ? 'var(--pure-white)' : 'var(--heritage-cream)',
              padding: '0.5rem 1.2rem',
              borderRadius: '99px',
              transition: 'var(--transition-fast)'
            }}>
              {selectedPackaging === 'bag' ? (
                <>
                  <Check size={14} />
                  <span>Selected for Order</span>
                </>
              ) : (
                <span>Select for Delivery (+₹15)</span>
              )}
            </div>
          </div>

        </div>

        {/* Traditional Value Statement */}
        <div style={{
          marginTop: '3.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '2.5rem',
          flexWrap: 'wrap',
          opacity: 0.85
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <Shield size={16} style={{ color: 'var(--royal-gold)' }} />
            <span>100% Recyclable Materials</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <Award size={16} style={{ color: 'var(--royal-gold)' }} />
            <span>Royal Aesthetic Detailing</span>
          </div>
        </div>

      </div>
    </section>
  );
}
