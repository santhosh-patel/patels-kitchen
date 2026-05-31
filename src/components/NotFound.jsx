import { Landmark, Compass, Sparkles, MoveLeft } from 'lucide-react';
import logoImg from '../assets/logo.jpg';
import { navigate } from '../lib/navigation';

export default function NotFound() {
  const handleGoHome = () => navigate('/');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--ivory)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'var(--font-body)',
      color: 'var(--deep-charcoal)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative corners */}
      <div className="temple-border-top" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />

      {/* Decorative background circle */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(184, 138, 59, 0.05) 0%, rgba(244, 241, 234, 0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div className="not-found-card" style={{
        maxWidth: '550px',
        width: '100%',
        background: 'var(--pure-white)',
        border: '1.5px solid var(--sandstone)',
        borderRadius: '24px',
        padding: '3.5rem 2.5rem',
        textAlign: 'center',
        boxShadow: 'var(--soft-shadow)',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeIn 0.6s ease forwards'
      }}>
        {/* Logo and Crest */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={logoImg} 
              alt="Patel's Kitchen" 
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                border: '2px solid var(--royal-gold)',
                objectFit: 'cover',
                boxShadow: '0 8px 24px rgba(184, 138, 59, 0.15)'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              right: '-8px',
              background: 'var(--royal-gold)',
              color: 'var(--pure-white)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}>
              <Compass size={14} />
            </div>
          </div>
        </div>

        {/* 404 Header */}
        <span style={{
          fontFamily: 'var(--font-headings)',
          color: 'var(--royal-gold)',
          fontSize: '0.85rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.25em',
          display: 'block',
          marginBottom: '0.5rem'
        }}>
          Lost in the Royal Manor
        </span>

        <h1 className="not-found-title" style={{
          fontFamily: 'var(--font-headings)',
          fontSize: '4rem',
          fontWeight: 800,
          color: 'var(--traditional-brown)',
          margin: '0 0 1rem',
          lineHeight: '1',
          letterSpacing: '-0.02em'
        }}>
          404
        </h1>

        <div className="gold-divider" style={{ margin: '1rem auto 1.5rem' }}>
          <span className="motif">✦ ❈ ✦</span>
        </div>

        {/* Story copy */}
        <h2 style={{
          fontFamily: 'var(--font-headings)',
          fontSize: '1.4rem',
          color: 'var(--deep-charcoal)',
          fontWeight: 600,
          marginBottom: '1rem'
        }}>
          The Imperial Path Has Vanished
        </h2>

        <p style={{
          color: '#555555',
          fontSize: '0.95rem',
          lineHeight: '1.7',
          marginBottom: '2.5rem'
        }}>
          The secret hallway you are seeking has eluded our maps. It is possible the dish has retired or the palace wing is currently undergoing renovations. Let us guide you back to the grand banquet halls.
        </p>

        {/* Actions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <button 
            onClick={handleGoHome}
            className="btn-primary"
            style={{
              padding: '1rem 2rem',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              width: '100%',
              boxShadow: '0 4px 15px rgba(184, 138, 59, 0.2)'
            }}
          >
            <MoveLeft size={16} />
            <span>Return to Grand Banquet</span>
          </button>

          <a 
            href="/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: 'var(--traditional-brown)',
              textDecoration: 'none',
              fontWeight: 700,
              padding: '0.8rem',
              borderRadius: '99px',
              border: '1px solid rgba(184, 138, 59, 0.15)',
              background: 'transparent',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--heritage-cream)';
              e.currentTarget.style.borderColor = 'var(--royal-gold)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(184, 138, 59, 0.15)';
            }}
          >
            <Landmark size={14} />
            <span>Access Administrator Chambers</span>
          </a>
        </div>
      </div>
    </div>
  );
}
