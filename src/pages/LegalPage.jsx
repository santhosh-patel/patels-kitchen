import { ArrowLeft } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'Local Storage Notice',
        body: "Patel's Kitchen stores orders, cart, and preferences in your browser's local storage. Chef AI queries may be sent securely through our server when you use the concierge feature."
      },
      {
        heading: 'Information We Collect',
        body: 'When you place an order, name, phone, and address you provide are saved locally on your device for order tracking and kitchen preparation.'
      },
      {
        heading: 'Your Control',
        body: 'Clear your browser data or use "Restore Sample Data" in admin Settings to reset all stored information on this device.'
      }
    ]
  },
  terms: {
    title: 'Terms of Table Service',
    sections: [
      {
        heading: 'Ordering',
        body: "Patel's Kitchen online ordering is provided for your convenience. Online payments are processed via UPI; please verify your order total before confirming."
      },
      {
        heading: 'Menu & Availability',
        body: 'Menu items, prices, and availability are subject to change. Items marked unavailable cannot be ordered until restocked.'
      },
      {
        heading: 'Acceptable Use',
        body: 'Please use the admin panel responsibly. The admin PIN protects administrative features from unauthorized access.'
      }
    ]
  }
};

export default function LegalPage({ type = 'privacy' }) {
  const page = CONTENT[type] || CONTENT.privacy;

  return (
    <div className="standalone-page" style={{ background: 'var(--ivory)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%' }}>
        <header className="standalone-header">
          <a href="/" className="standalone-back-link">
            <ArrowLeft size={16} /> Back to Home
          </a>
          <div className="standalone-brand">
            <img src={logoImg} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0 }} />
            <span>PATEL'S KITCHEN</span>
          </div>
        </header>

        <article style={{
          background: 'var(--pure-white)',
          borderRadius: '20px',
          padding: 'clamp(1.25rem, 4vw, 2.5rem)',
          border: '1px solid rgba(184, 138, 59, 0.15)',
          boxShadow: 'var(--soft-shadow)'
        }}>
          <h1 className="section-title" style={{ marginBottom: '1.5rem' }}>
            {page.title}
          </h1>
          {page.sections.map((section, i) => (
            <div key={i} style={{ marginBottom: '1.5rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-headings)',
                fontSize: '1.1rem',
                color: 'var(--royal-gold)',
                marginBottom: '0.5rem'
              }}>
                {section.heading}
              </h2>
              <p style={{ lineHeight: 1.7, color: '#444', fontSize: '0.95rem' }}>{section.body}</p>
            </div>
          ))}
          <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '2rem' }}>
            Last updated: May 2026 · Patel's Kitchen
          </p>
        </article>
      </div>
    </div>
  );
}
