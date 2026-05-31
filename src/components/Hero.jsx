import React from 'react';
import logoImg from '../assets/logo.jpg';
import { ArrowDown, Flame, ShieldAlert, Award } from 'lucide-react';

export default function Hero({ onScrollToSection }) {
  return (
    <section style={{
      padding: '6rem 2rem 5rem',
      background: 'radial-gradient(circle at 50% 30%, #FFFDF8 0%, #F7F1E8 100%)',
      textAlign: 'center',
      position: 'relative',
      borderBottom: '1px solid rgba(184, 138, 59, 0.15)',
      overflow: 'hidden'
    }}>
      {/* Background Decorative Temple-like Silhouette/Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.02,
        backgroundImage: 'radial-gradient(circle at 50% 50%, var(--traditional-brown) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 5
      }}>
        {/* Large Towel Roll Logo Centered */}
        <div style={{
          display: 'inline-block',
          position: 'relative',
          marginBottom: '2.5rem',
          animation: 'scaleIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          {/* Circular Gold Ripple Ring */}
          <div style={{
            position: 'absolute',
            top: '-15px',
            left: '-15px',
            right: '-15px',
            bottom: '-15px',
            border: '1.5px solid var(--royal-gold)',
            borderRadius: '50%',
            opacity: 0.3,
            transform: 'scale(1)'
          }} />
          <div style={{
            position: 'absolute',
            top: '-8px',
            left: '-8px',
            right: '-8px',
            bottom: '-8px',
            border: '1px dashed var(--royal-gold)',
            borderRadius: '50%',
            opacity: 0.5
          }} />
          <img 
            src={logoImg} 
            alt="Patel's Kitchen Turban Logo" 
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--royal-gold)',
              boxShadow: '0 15px 45px rgba(184, 138, 59, 0.25)',
              display: 'block'
            }}
          />
        </div>

        {/* Brand Taglines */}
        <div style={{
          textTransform: 'uppercase',
          fontSize: '0.8rem',
          letterSpacing: '0.3em',
          fontWeight: 800,
          color: 'var(--royal-gold)',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem'
        }}>
          <Award size={14} />
          <span>Serving Tradition Since Generations</span>
          <Award size={14} />
        </div>

        {/* Primary Headline */}
        <h1 style={{
          fontSize: '3.8rem',
          fontFamily: 'var(--font-headings)',
          color: 'var(--deep-charcoal)',
          margin: '0.5rem 0 1.2rem',
          lineHeight: '1.15',
          letterSpacing: '0.01em',
          fontWeight: 700
        }}>
          Authentic Hyderabadi &<br />
          <span style={{ color: 'var(--traditional-brown)', fontStyle: 'italic' }}>South Indian</span> Flavors
        </h1>

        {/* Subheadline */}
        <h3 style={{
          fontFamily: 'var(--font-headings)',
          fontSize: '1.25rem',
          fontWeight: 500,
          color: 'var(--royal-gold)',
          letterSpacing: '0.05em',
          marginBottom: '1.5rem'
        }}>
          Where Patel Heritage Meets Timeless Taste
        </h3>

        {/* Gold Flourish Divider */}
        <div className="gold-divider">
          <span className="motif">✦ ❈ ✦</span>
        </div>

        {/* Headline Description */}
        <p style={{
          fontSize: '1.15rem',
          color: '#5c5c5c',
          maxWidth: '720px',
          margin: '1.5rem auto 3rem',
          lineHeight: '1.7',
          fontFamily: 'var(--font-body)',
          fontWeight: 400
        }}>
          Experience authentic South Indian breakfasts, legendary Hyderabadi biryanis, and traditional recipes crafted with fresh ingredients, pure cow ghee, and royal, timeless spices.
        </p>

        {/* Magnetic Button Call To Actions */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => onScrollToSection('menu-section')}
            className="btn-primary"
            style={{ fontSize: '1.05rem', padding: '1.1rem 2.8rem' }}
          >
            Explore Menu
          </button>
          
          <button 
            onClick={() => onScrollToSection('about-section')}
            className="btn-secondary"
            style={{ fontSize: '1.05rem', padding: '1.05rem 2.6rem' }}
          >
            Our Heritage
          </button>
        </div>
      </div>

      {/* Decorative Bottom Scroll indicator */}
      <div 
        onClick={() => onScrollToSection('menu-section')}
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'pointer',
          opacity: 0.6,
          transition: 'var(--transition-fast)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.3rem'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
      >
        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>Scroll Down</span>
        <ArrowDown size={14} className="bounce-anim" style={{ animation: 'bounce 2s infinite' }} />
      </div>

      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
          60% { transform: translateY(-2px); }
        }
        @media (max-width: 768px) {
          section { padding: 4rem 1.5rem 3.5rem; }
          h1 { font-size: 2.3rem !important; }
          h3 { font-size: 1rem !important; }
          p { font-size: 0.95rem !important; margin-bottom: 2rem !important; }
        }
      `}</style>
    </section>
  );
}
