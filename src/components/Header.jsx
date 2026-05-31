import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import logoImg from '../assets/logo.jpg';
import { navigate } from '../lib/navigation';

const NAV_CATEGORIES = [
  { id: 'all', name: 'Royal Feast' },
  { id: 'breakfast', name: 'Dawn' },
  { id: 'biryanis', name: 'Biryanis' },
  { id: 'starters', name: 'Starters' },
  { id: 'desserts', name: 'Desserts & Brews' }
];

export default function Header({
  variant = 'home',
  cart,
  onOpenCart,
  onScrollToSection,
  activeCategory,
  setActiveCategory
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const isMenuPage = variant === 'menu';

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMobileNavOpen(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileNavOpen]);

  const handleCategoryClick = (catId) => {
    setActiveCategory?.(catId);
    setMobileNavOpen(false);
    if (isMenuPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(`/menu?category=${catId}`);
    }
  };

  const goHome = () => {
    setMobileNavOpen(false);
    navigate('/');
  };

  const goMenu = () => {
    setMobileNavOpen(false);
    navigate('/menu');
  };

  const scrollToAbout = () => {
    setMobileNavOpen(false);
    onScrollToSection?.('about-section');
  };

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div
          className="site-brand"
          onClick={goHome}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && goHome()}
        >
          <img src={logoImg} alt="Patel's Kitchen" className="site-brand-logo" />
          <div className="site-brand-text">
            <span className="site-brand-name">PATEL'S</span>
            <span className="site-brand-tagline">KITCHEN</span>
          </div>
        </div>

        <nav className="site-nav-desktop" aria-label="Main navigation">
          {!isMenuPage ? (
            <>
              <a href="/" className="site-nav-link" onClick={(e) => { e.preventDefault(); goHome(); }}>Home</a>
              <a href="/menu" className="site-nav-link active" onClick={(e) => { e.preventDefault(); goMenu(); }}>Menu</a>
              <button type="button" onClick={scrollToAbout} className="site-nav-btn">Our Story</button>
            </>
          ) : (
            <>
              <a href="/" className="site-nav-link" onClick={(e) => { e.preventDefault(); goHome(); }}>Home</a>
              {NAV_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`site-nav-btn ${activeCategory === cat.id ? 'active' : ''}`}
                >
                  {cat.name}
                </button>
              ))}
            </>
          )}
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="header-menu-toggle"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileNavOpen}
          >
            <Menu size={22} />
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            className="cart-trigger-btn"
            aria-label={`Open cart, ${totalItems} items`}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ShoppingBag size={18} style={{ color: 'var(--royal-gold)' }} />
              {totalItems > 0 && (
                <span className="cart-trigger-badge">{totalItems}</span>
              )}
            </div>
            <div className="cart-trigger-label">
              <span className="cart-trigger-sublabel">Your Plate</span>
              <span className="cart-trigger-amount">
                {totalItems > 0 ? `₹${cartSubtotal}` : 'Empty'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {isMenuPage && (
        <div className="header-mobile-cats" role="tablist" aria-label="Menu categories">
          {NAV_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`header-cat-chip ${activeCategory === cat.id ? 'active' : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {mobileNavOpen && (
        <>
          <div
            className="mobile-nav-overlay"
            onClick={closeMobileNav}
            aria-hidden="true"
          />
          <nav
            className="mobile-nav-panel"
            aria-label="Mobile navigation"
            role="dialog"
            aria-modal="true"
          >
            <div className="mobile-nav-header">
              <span className="mobile-nav-title">Navigation</span>
              <button
                type="button"
                className="mobile-nav-close"
                onClick={closeMobileNav}
                aria-label="Close navigation menu"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mobile-nav-links">
              <a href="/" className="mobile-nav-item" onClick={(e) => { e.preventDefault(); goHome(); }}>Home</a>
              <a href="/menu" className="mobile-nav-item" onClick={(e) => { e.preventDefault(); goMenu(); }}>Full Menu</a>
              {!isMenuPage && (
                <button type="button" className="mobile-nav-item" onClick={scrollToAbout}>
                  Our Story
                </button>
              )}
              <a href="/track" className="mobile-nav-item" onClick={(e) => { e.preventDefault(); closeMobileNav(); navigate('/track'); }}>
                Track Order
              </a>

              <div className="mobile-nav-divider" />
              <span className="mobile-nav-section-label">Menu Categories</span>
              {NAV_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`mobile-nav-item ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
