import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { restaurantSettings as initialSettings } from '../../data/adminData';
import logoImg from '../../assets/logo.jpg';

export default function SettingsModule() {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateHours = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: { ...prev.openingHours[day], [field]: value }
      }
    }));
    setSaved(false);
  };

  const updateSocial = (key, value) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value }
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Restaurant Settings</h2>
        <button className="admin-btn admin-btn-primary" onClick={handleSave}>
          <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* General Info */}
      <div className="admin-settings-section">
        <h3>General Information</h3>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ flexShrink: 0 }}>
            <img
              src={logoImg}
              alt="Logo"
              style={{
                width: '80px', height: '80px', borderRadius: '50%',
                objectFit: 'cover', border: '2px solid var(--royal-gold)'
              }}
            />
            <p style={{ fontSize: '0.72rem', color: '#888', textAlign: 'center', marginTop: '0.5rem' }}>Restaurant Logo</p>
          </div>
          <div style={{ flex: 1 }}>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Restaurant Name</label>
                <input
                  className="admin-form-input"
                  value={settings.name}
                  onChange={(e) => update('name', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Tagline</label>
                <input
                  className="admin-form-input"
                  value={settings.tagline}
                  onChange={(e) => update('tagline', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Address</label>
          <textarea
            className="admin-form-textarea"
            value={settings.address}
            onChange={(e) => update('address', e.target.value)}
            rows={2}
          />
        </div>

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Phone</label>
            <input
              className="admin-form-input"
              value={settings.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Alt Phone</label>
            <input
              className="admin-form-input"
              value={settings.altPhone}
              onChange={(e) => update('altPhone', e.target.value)}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Email</label>
            <input
              className="admin-form-input"
              value={settings.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Opening Hours */}
      <div className="admin-settings-section">
        <h3>Opening Hours</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {days.map(day => (
            <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{
                width: '100px', textTransform: 'capitalize', fontWeight: 600,
                fontSize: '0.85rem'
              }}>
                {day}
              </span>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={settings.openingHours[day].isOpen}
                  onChange={(e) => updateHours(day, 'isOpen', e.target.checked)}
                />
                <span className="admin-toggle-slider" />
              </label>
              {settings.openingHours[day].isOpen ? (
                <>
                  <input
                    className="admin-form-input"
                    type="time"
                    value={settings.openingHours[day].open}
                    onChange={(e) => updateHours(day, 'open', e.target.value)}
                    style={{ width: '130px', padding: '0.4rem 0.6rem' }}
                  />
                  <span style={{ color: '#888' }}>to</span>
                  <input
                    className="admin-form-input"
                    type="time"
                    value={settings.openingHours[day].close}
                    onChange={(e) => updateHours(day, 'close', e.target.value)}
                    style={{ width: '130px', padding: '0.4rem 0.6rem' }}
                  />
                </>
              ) : (
                <span style={{ color: '#C62828', fontSize: '0.82rem', fontWeight: 600 }}>Closed</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Delivery & Tax */}
      <div className="admin-settings-section">
        <h3>Delivery & Tax Settings</h3>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Delivery Fee (₹)</label>
            <input
              className="admin-form-input"
              type="number"
              value={settings.deliveryFee}
              onChange={(e) => update('deliveryFee', parseFloat(e.target.value))}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Free Delivery Above (₹)</label>
            <input
              className="admin-form-input"
              type="number"
              value={settings.freeDeliveryAbove}
              onChange={(e) => update('freeDeliveryAbove', parseFloat(e.target.value))}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Minimum Order (₹)</label>
            <input
              className="admin-form-input"
              type="number"
              value={settings.minimumOrder}
              onChange={(e) => update('minimumOrder', parseFloat(e.target.value))}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Tax Rate (%)</label>
            <input
              className="admin-form-input"
              type="number"
              value={settings.taxRate}
              onChange={(e) => update('taxRate', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="admin-settings-section">
        <h3>Social Media Links</h3>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Instagram</label>
            <input
              className="admin-form-input"
              value={settings.socialLinks.instagram}
              onChange={(e) => updateSocial('instagram', e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Facebook</label>
            <input
              className="admin-form-input"
              value={settings.socialLinks.facebook}
              onChange={(e) => updateSocial('facebook', e.target.value)}
              placeholder="https://facebook.com/..."
            />
          </div>
        </div>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Twitter</label>
            <input
              className="admin-form-input"
              value={settings.socialLinks.twitter}
              onChange={(e) => updateSocial('twitter', e.target.value)}
              placeholder="https://twitter.com/..."
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">YouTube</label>
            <input
              className="admin-form-input"
              value={settings.socialLinks.youtube}
              onChange={(e) => updateSocial('youtube', e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
