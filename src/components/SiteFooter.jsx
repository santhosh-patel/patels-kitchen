import { Clock, MapPin, Phone } from 'lucide-react';
import { useSettings } from '../context/StoreContext';
import logoImg from '../assets/logo.jpg';
import { navigate } from '../lib/navigation';

const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function getOpenStatus(settings) {
  const hours = settings.openingHours || {};
  const now = new Date();
  const dayKey = DAY_KEYS[now.getDay()];
  const today = hours[dayKey];

  if (!today?.isOpen) {
    return { label: 'Closed today', isOpen: false };
  }

  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const nowMins = now.getHours() * 60 + now.getMinutes();
  const openMins = toMinutes(today.open);
  const closeMins = toMinutes(today.close);

  if (nowMins >= openMins && nowMins < closeMins) {
    return { label: `Open now · Closes ${today.close}`, isOpen: true };
  }
  if (nowMins < openMins) {
    return { label: `Closed · Opens ${today.open}`, isOpen: false };
  }
  return { label: 'Closed for today', isOpen: false };
}

export default function SiteFooter({ compact = false }) {
  const settings = useSettings();
  const openStatus = getOpenStatus(settings);

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
      <footer className="site-footer-compact">
        <span
          className={`footer-open-status ${openStatus.isOpen ? 'open' : 'closed'}`}
        >
          {openStatus.label}
        </span>
        <span>© 2026 Patel's Kitchen · </span>
        <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>Terms</a>
        <span> · </span>
        <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}>Privacy</a>
        <span> · </span>
        <a href="/admin" className="footer-staff-link" onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>Staff</a>
      </footer>
    );
  }

  return (
    <footer className="page-section site-footer-full">
      <div className="page-container site-footer-grid">
        <div>
          <div className="site-footer-brand">
            <img src={logoImg} alt="Footer Logo" className="site-footer-logo" />
            <div className="site-footer-brand-text">
              <span className="site-footer-brand-name">
                {settings.name?.split("'")[0]?.toUpperCase() || 'PATEL'}'S
              </span>
              <span className="site-footer-brand-tagline">KITCHEN</span>
            </div>
          </div>
          <p className="site-footer-desc">
            Experience traditional Patel family hospitality and sensory royal Indian culinary masterworks slow-cooked with generations of love.
          </p>
        </div>

        <div>
          <h4 className="site-footer-heading">RESTAURANT HOURS</h4>
          <div className="site-footer-hours">
            <div className={`footer-open-status ${openStatus.isOpen ? 'open' : 'closed'}`} style={{ marginBottom: '0.8rem' }}>
              <Clock size={14} style={{ color: 'var(--royal-gold)' }} />
              <span>{openStatus.label}</span>
            </div>
            {formatHours().map((line, i) => (
              <div key={i} className="site-footer-hours-row">
                <Clock size={14} style={{ color: 'var(--royal-gold)' }} />
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="site-footer-heading">THE MANOR ESTATE</h4>
          <div className="site-footer-contact">
            <div className="site-footer-contact-row">
              <MapPin size={16} style={{ color: 'var(--royal-gold)', flexShrink: 0, marginTop: '2px' }} />
              <span>{settings.address || '14 Royal Palace Lane, Jubilee Hills, Hyderabad'}</span>
            </div>
            <div className="site-footer-contact-row">
              <Phone size={14} style={{ color: 'var(--royal-gold)' }} />
              <span>{settings.phone || '+91 98480 22338'}{settings.altPhone ? ` / ${settings.altPhone}` : ''}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container site-footer-bottom">
        <span>© 2026 Patel's Kitchen. All Imperial Rights Reserved.</span>
        <div className="site-footer-bottom-links">
          <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>Terms of Table Service</a>
          <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}>Privacy</a>
          <a href="/admin" className="footer-staff-link" onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>Staff</a>
        </div>
      </div>
    </footer>
  );
}
