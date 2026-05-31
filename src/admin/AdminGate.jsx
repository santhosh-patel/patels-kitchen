import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

const DEMO_DEFAULT_PIN = '1234';
const PIN_KEY = 'pk_admin_pin';
const UNLOCK_KEY = 'pk_admin_unlocked';

export function getAdminPin() {
  return localStorage.getItem(PIN_KEY) || DEMO_DEFAULT_PIN;
}

export function setAdminPin(pin) {
  localStorage.setItem(PIN_KEY, pin);
}

export default function AdminGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(UNLOCK_KEY) === '1');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSetup, setIsSetup] = useState(() => !localStorage.getItem(PIN_KEY));
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(PIN_KEY)) {
      localStorage.setItem(PIN_KEY, DEMO_DEFAULT_PIN);
      setIsSetup(false);
    }
  }, []);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (pin === getAdminPin()) {
      sessionStorage.setItem(UNLOCK_KEY, '1');
      setUnlocked(true);
      setError('');
    } else {
      setError('Incorrect PIN. Default is 1234 unless changed in Settings.');
    }
  };

  const handleSetup = (e) => {
    e.preventDefault();
    if (pin.length < 4 || pin.length > 6) {
      setError('PIN must be 4–6 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }
    setAdminPin(pin);
    sessionStorage.setItem(UNLOCK_KEY, '1');
    setIsSetup(false);
    setUnlocked(true);
    setError('');
  };

  if (unlocked) return children;

  return (
    <div className="admin-gate-screen">
      <div className="admin-gate-card">
        <div className="admin-gate-icon">
          <Lock size={32} />
        </div>
        <h1>Admin Access</h1>
        <p>Enter your PIN to access the Patel's Kitchen admin panel.</p>

        <form onSubmit={isSetup ? handleSetup : handleUnlock}>
          <label>PIN</label>
          <div className="admin-gate-input-row">
            <input
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter PIN"
              autoFocus
            />
            <button type="button" className="admin-gate-eye" onClick={() => setShowPin(!showPin)} aria-label="Toggle PIN visibility">
              {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {isSetup && (
            <>
              <label style={{ marginTop: '1rem' }}>Confirm PIN</label>
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Confirm PIN"
              />
            </>
          )}

          {error && <p className="admin-gate-error">{error}</p>}

          <button type="submit" className="admin-gate-submit">
            {isSetup ? 'Set PIN & Enter' : 'Unlock Dashboard'}
          </button>
        </form>

        <a href="/" className="admin-gate-back">← Back to Customer Site</a>
      </div>
    </div>
  );
}
