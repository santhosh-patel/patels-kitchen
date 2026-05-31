import logoImg from '../assets/logo.jpg';
import { ArrowDown, Award } from 'lucide-react';
import { navigate } from '../lib/navigation';

export default function Hero({ onScrollToSection }) {
  return (
    <section className="hero-section">
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

      <div className="hero-inner">
        <div className="hero-logo-wrap" style={{
          display: 'inline-block',
          position: 'relative',
          marginBottom: '2.5rem',
          animation: 'scaleIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <div style={{
            position: 'absolute',
            top: '-15px',
            left: '-15px',
            right: '-15px',
            bottom: '-15px',
            border: '1.5px solid var(--royal-gold)',
            borderRadius: '50%',
            opacity: 0.3
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
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--royal-gold)',
              boxShadow: '0 15px 45px rgba(184, 138, 59, 0.25)',
              display: 'block'
            }}
          />
        </div>

        <div className="hero-tagline">
          <Award size={14} aria-hidden="true" />
          <span>Serving Tradition Since Generations</span>
          <Award size={14} aria-hidden="true" />
        </div>

        <h1 className="hero-headline">
          Authentic Hyderabadi &<br />
          <span style={{ color: 'var(--traditional-brown)', fontStyle: 'italic' }}>South Indian</span> Flavors
        </h1>

        <h3 className="hero-subheadline">
          Where Patel Heritage Meets Timeless Taste
        </h3>

        <div className="gold-divider">
          <span className="motif">✦ ❈ ✦</span>
        </div>

        <p className="hero-description">
          Experience authentic South Indian breakfasts, legendary Hyderabadi biryanis, and traditional recipes crafted with fresh ingredients, pure cow ghee, and royal, timeless spices.
        </p>

        <div className="hero-cta-row">
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="btn-primary"
          >
            Explore Menu
          </button>

          <button
            type="button"
            onClick={() => onScrollToSection('about-section')}
            className="btn-secondary"
          >
            Our Heritage
          </button>
        </div>
      </div>

      <div
        onClick={() => onScrollToSection('about-section')}
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
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onScrollToSection('about-section')}
        aria-label="Scroll to about section"
      >
        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>Scroll Down</span>
        <ArrowDown size={14} style={{ animation: 'bounce 2s infinite' }} />
      </div>

      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
          60% { transform: translateY(-2px); }
        }
      `}</style>
    </section>
  );
}
