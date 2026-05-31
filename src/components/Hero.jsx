import logoImg from '../assets/logo.jpg';
import biryaniImg from '../assets/chicken_biryani.png';
import dosaImg from '../assets/ghee_roast_dosa.png';
import { ArrowDown, Award } from 'lucide-react';
import { navigate } from '../lib/navigation';

export default function Hero({ onScrollToSection }) {
  return (
    <section className="hero-section">
      <div className="hero-bg-layer hero-bg-left" style={{ backgroundImage: `url(${dosaImg})` }} aria-hidden="true" />
      <div className="hero-bg-layer hero-bg-right" style={{ backgroundImage: `url(${biryaniImg})` }} aria-hidden="true" />
      <div className="hero-bg-overlay" aria-hidden="true" />

      <div
        className="hero-dot-pattern"
        aria-hidden="true"
      />

      <div className="hero-inner">
        <div className="hero-logo-wrap">
          <div className="hero-logo-ring hero-logo-ring-outer" />
          <div className="hero-logo-ring hero-logo-ring-inner" />
          <img
            src={logoImg}
            alt="Patel's Kitchen Turban Logo"
            className="hero-logo-img"
          />
        </div>

        <div className="hero-tagline">
          <Award size={14} aria-hidden="true" />
          <span>Serving Tradition Since Generations</span>
          <Award size={14} aria-hidden="true" />
        </div>

        <h1 className="hero-headline">
          Authentic Hyderabadi &<br />
          <span className="hero-headline-accent">South Indian</span> Flavors
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
            className="btn-primary hero-cta-primary"
          >
            Explore Menu
          </button>

          <button
            type="button"
            onClick={() => onScrollToSection('about-section')}
            className="btn-secondary hero-cta-secondary"
          >
            Our Heritage
          </button>
        </div>
      </div>

      <button
        type="button"
        className="hero-scroll-hint"
        onClick={() => onScrollToSection('about-section')}
        aria-label="Scroll to about section"
      >
        <span>Scroll Down</span>
        <ArrowDown size={14} className="hero-scroll-arrow" />
      </button>
    </section>
  );
}
