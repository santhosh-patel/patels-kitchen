import { useEffect } from 'react';

export default function Toast({ message, action, onAction, onDismiss, duration = 3000 }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      <div className="toast-inner">
        <span className="toast-message">{message}</span>
        {action && onAction && (
          <button type="button" className="toast-action" onClick={onAction}>
            {action}
          </button>
        )}
        <button type="button" className="toast-dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      </div>
    </div>
  );
}
