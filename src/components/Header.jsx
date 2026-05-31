import React from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export default function Header({ cart, onOpenCart, onScrollToSection, activeCategory, setActiveCategory }) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const categories = [
    { id: 'all', name: 'Royal Feast' },
    { id: 'breakfast', name: 'Dawn' },
    { id: 'biryanis', name: 'Biryanis' },
    { id: 'starters', name: 'Starters' },
    { id: 'desserts', name: 'Desserts & Brews' }
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      background: 'rgba(255, 253, 248, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(184, 138, 59, 0.15)',
      zIndex: 50,
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0.8rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo & Wordmark */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            cursor: 'pointer'
          }}
        >
          <img 
            src={logoImg} 
            alt="Patel's Kitchen Turban Logo" 
            style={{
              height: '50px',
              width: '50px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1.5px solid var(--royal-gold)',
              boxShadow: '0 4px 10px rgba(184, 138, 59, 0.15)'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{
              fontFamily: 'var(--font-headings)',
              fontSize: '1.4rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: 'var(--deep-charcoal)'
            }}>
              PATEL'S
            </span>
            <span style={{
              fontFamily: 'var(--font-headings)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.3em',
              color: 'var(--royal-gold)',
              marginTop: '0.1rem'
            }}>
              KITCHEN
            </span>
          </div>
        </div>

        {/* Dynamic Category Navigation Anchors */}
        <nav className="desktop-only" style={{
          display: 'flex',
          gap: '1.8rem',
          alignItems: 'center'
        }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                onScrollToSection('menu-section');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                fontWeight: activeCategory === cat.id ? '700' : '500',
                color: activeCategory === cat.id ? 'var(--royal-gold)' : 'var(--deep-charcoal)',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                transition: 'all 0.25s ease',
                position: 'relative',
                padding: '0.4rem 0'
              }}
            >
              {cat.name}
              {activeCategory === cat.id && (
                <span style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: 'var(--royal-gold)',
                  borderRadius: '2px',
                  animation: 'fadeIn 0.3s ease'
                }} />
              )}
            </button>
          ))}
          
          <button 
            onClick={() => onScrollToSection('packaging-section')}
            style={{
              background: 'transparent',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              color: 'var(--deep-charcoal)',
              opacity: 0.8,
              cursor: 'pointer',
              fontWeight: '500',
              letterSpacing: '0.04em',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '1'}
            onMouseLeave={(e) => e.target.style.opacity = '0.8'}
          >
            Packaging
          </button>
        </nav>

        {/* Cart Action Button */}
        <button 
          onClick={onOpenCart}
          className="cart-trigger-btn"
          style={{
            background: 'var(--deep-charcoal)',
            color: 'var(--pure-white)',
            border: '1.5px solid var(--royal-gold)',
            borderRadius: '999px',
            padding: '0.6rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            cursor: 'pointer',
            boxShadow: 'var(--soft-shadow)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(184, 138, 59, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--soft-shadow)';
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <ShoppingBag size={18} style={{ color: 'var(--royal-gold)' }} />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: 'var(--royal-gold)',
                color: 'var(--pure-white)',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                animation: 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}>
                {totalItems}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--sandstone)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Plate
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.1rem', fontFamily: 'var(--font-body)' }}>
              {totalItems > 0 ? `₹${cartSubtotal}` : 'Empty'}
            </span>
          </div>
        </button>
      </div>

      {/* Mobile-Only Category Quick Bar */}
      <div className="mobile-only" style={{
        display: 'none', /* managed via responsive CSS display overrides in index.css if needed, or inline helper */
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        padding: '0.5rem 1rem',
        background: 'var(--ivory)',
        borderTop: '1px solid rgba(184, 138, 59, 0.08)'
      }}>
        {/* Inline CSS handles visibility in mobile responsive */}
        <style>{`
          @media (max-width: 768px) {
            .desktop-only { display: none !important; }
            .mobile-only { display: flex !important; gap: 0.8rem; }
          }
        `}</style>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              onScrollToSection('menu-section');
            }}
            style={{
              display: 'inline-block',
              background: activeCategory === cat.id ? 'var(--royal-gold)' : 'var(--pure-white)',
              border: activeCategory === cat.id ? 'none' : '1px solid var(--sandstone)',
              color: activeCategory === cat.id ? 'var(--pure-white)' : 'var(--deep-charcoal)',
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </header>
  );
}
