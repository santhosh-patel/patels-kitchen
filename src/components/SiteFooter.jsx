import { Clock, MapPin, Phone } from 'lucide-react';
import { useSettings } from '../context/StoreContext';
import logoImg from '../assets/logo.jpg';

const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

export default function SiteFooter({ compact = false }) {
  const settings = useSettings();

  const formatHours = () => {
    const hours = settings.openingHours || {};
    return Object.entries(hours).slice(0, compact ? 2 : 4).map(([day, h]) => {
      const label = DAY_LABELS[day] || day;
      if (!h.isOpen) return `${label}: Closed`;
      return `${label}: ${h.open} - ${h.close}`;
    });
  };

  if (compact) {
    return (
      <footer style={{
        backgroundColor: 'var(--heritage-cream)',
        borderTop: '1px solid rgba(184, 138, 59, 0.15)',
        padding: '1.5rem 2rem',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: '#666'
      }}>
        <span>© 2026 Patel's Kitchen · </span>
        <a href="/terms" style={{ color: 'var(--royal-gold)', textDecoration: 'none' }}>Terms</a>
        <span> · </span>
        <a href="/privacy" style={{ color: 'var(--royal-gold)', textDecoration: 'none' }}>Privacy</a>
      </footer>
    );
  }

  return (
    <footer className="page-section" style={{
      backgroundColor: 'var(--heritage-cream)',
      color: 'var(--deep-charcoal)',
      paddingTop: 'var(--section-padding-y)',
      paddingBottom: '3rem',
      borderTop: '1px solid rgba(184, 138, 59, 0.15)'
    }}>
      <div className="page-container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: 'clamp(1.5rem, 4vw, 3rem)',
        borderBottom: '1px solid rgba(184, 138, 59, 0.12)',
        paddingBottom: '3rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
            <img src={logoImg} alt="Footer Logo" style={{ width: '45px', height: '45px', borderRadius: '50%', border: '1.5px solid var(--royal-gold)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontFamily: 'var(--font-headings)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--deep-charcoal)', letterSpacing: '0.05em' }}>
                {settings.name?.split("'")[0]?.toUpperCase() || 'PATEL'}'S
              </span>
              <span style={{ fontFamily: 'var(--font-headings)', fontSize: '0.65rem', color: 'var(--royal-gold)', letterSpacing: '0.25em' }}>KITCHEN</span>
            </div>
          </div>
          <p style={{ color: '#555555', fontSize: '0.85rem', lineHeight: '1.6' }}>
            Experience traditional Patel family hospitality and sensory royal Indian culinary masterworks slow-cooked with generations of love.
          </p>
        </div>

        <div>
          <h4 style={{ fontFamily: 'var(--font-headings)', fontSize: '1rem', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>RESTAURANT HOURS</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem', color: '#555555' }}>
            {formatHours().map((line, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={14} style={{ color: 'var(--royal-gold)' }} />
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ fontFamily: 'var(--font-headings)', fontSize: '1rem', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>THE MANOR ESTATE</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem', color: '#555555' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <MapPin size={16} style={{ color: 'var(--royal-gold)', flexShrink: 0, marginTop: '2px' }} />
              <span>{settings.address || '14 Royal Palace Lane, Jubilee Hills, Hyderabad'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={14} style={{ color: 'var(--royal-gold)' }} />
              <span>{settings.phone || '+91 98480 22338'}{settings.altPhone ? ` / ${settings.altPhone}` : ''}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 style={{ fontFamily: 'var(--font-headings)', fontSize: '1rem', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>ADMINISTRATION</h4>
          <p style={{ color: '#555555', fontSize: '0.8rem', lineHeight: '1.5', margin: '0 0 0.8rem' }}>
            Authorized personnel portal to manage menus, track kitchen preparation, and process orders.
          </p>
          <a href="/admin" style={{ color: 'var(--royal-gold)', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>
            Access Admin Dashboard →
          </a>
        </div>
      </div>

      <div className="page-container" style={{
        marginTop: '2rem',
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
          <a href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Table Service</a>
          <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
        </div>
      </div>
    </footer>
  );
}
