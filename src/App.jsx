import { useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import OrderingOverlays from './components/OrderingOverlays';
import SiteFooter from './components/SiteFooter';
import { useOrdering } from './context/OrderingContext';
import { Award, Compass, Heart, Sparkles } from 'lucide-react';
import logoImg from './assets/logo.jpg';
import { navigate } from './lib/navigation';

export default function App() {
  const {
    cart,
    setIsCartOpen,
    setIsAIAssistantOpen
  } = useOrdering();

  const handleScrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && !hash.startsWith('#/')) {
      const sectionId = hash.slice(1);
      if (sectionId) {
        setTimeout(() => handleScrollToSection(sectionId), 150);
      }
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        variant="home"
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        onScrollToSection={handleScrollToSection}
      />

      <Hero onScrollToSection={handleScrollToSection} />

      <main id="main-content">
      <section id="about-section" className="temple-border-top page-section" style={{
        background: 'var(--pure-white)',
        borderBottom: '1px solid rgba(184, 138, 59, 0.15)'
      }}>
        <div className="page-container-narrow" style={{ textAlign: 'center' }}>
          <span className="section-eyebrow">
            Our Sacred Roots
          </span>
          <h2 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
            Tradition Served Fresh
          </h2>
          <div className="gold-divider"><span className="motif">✦ ❈ ✦</span></div>
          <p style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            lineHeight: '1.8',
            color: '#444444',
            maxWidth: '800px',
            margin: '2rem auto 3rem',
            fontFamily: 'var(--font-body)'
          }}>
            Welcome to <strong>Patel's Kitchen</strong>, where authentic South Indian traditions and Hyderabadi culinary heritage come together. From crispy dosas and fluffy idlis to slow-cooked biryanis and wood-charred paneer curries, every dish is prepared with carefully selected organic ingredients and family recipes inspired by generations of home cooking.
          </p>
          <div className="feature-grid">
            {[
              { icon: Award, title: 'Royal Heritage', desc: 'Recipes handed down by the royal kitchens of Hyderabad.' },
              { icon: Compass, title: 'Pure Ingredients', desc: 'Freshly stone-ground spices, zero preservatives, pure cow ghee.' },
              { icon: Heart, title: 'Patel Warmth', desc: 'Traditional Indian hospitality served with modern refinement.' }
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="feature-card">
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--heritage-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--royal-gold)', marginBottom: '0.8rem' }}>
                  <Icon size={24} />
                </div>
                <h4 style={{ fontFamily: 'var(--font-headings)', fontSize: '1rem', marginBottom: '0.4rem' }}>{title}</h4>
                <p style={{ fontSize: '0.8rem', color: '#777' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section" style={{
        background: 'var(--heritage-cream)',
        borderTop: '1px solid rgba(184, 138, 59, 0.15)',
        borderBottom: '1px solid rgba(184, 138, 59, 0.15)'
      }}>
        <div className="page-container-narrow ai-promo-row">
          <div className="ai-promo-content">
            <span className="section-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={14} />
              Intelligent Culinary Guidance
            </span>
            <h2 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
              Your Personal AI Food Concierge
            </h2>
            <p style={{ color: '#444444', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              Chef AI maps your dietary profile, respects allergies, and designs perfect multi-course feasts within your budget — available when you browse our menu.
            </p>
            <button
              type="button"
              onClick={() => { navigate('/menu'); setIsAIAssistantOpen(true); }}
              className="btn-primary"
              style={{ padding: '0.8rem 1.5rem', fontSize: '0.85rem' }}
            >
              Try Chef AI
            </button>
          </div>
          <div className="ai-promo-card">
            <img src={logoImg} alt="Chef AI" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--royal-gold)', marginBottom: '1rem' }} />
            <h4 style={{ fontFamily: 'var(--font-headings)', fontSize: '1rem', marginBottom: '1rem' }}>Chef AI Concierge</h4>
            <button type="button" onClick={() => navigate('/menu')} className="btn-secondary" style={{ width: '100%', padding: '0.8rem' }}>
              View Full Menu
            </button>
          </div>
        </div>
      </section>
      </main>

      <SiteFooter />
      <OrderingOverlays />
    </div>
  );
}
