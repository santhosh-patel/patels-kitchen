import { useEffect, useRef } from 'react';

export function useFocusTrap(isActive, onEscape) {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!isActive) return undefined;

    triggerRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return undefined;

    const getFocusable = () =>
      container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

    const focusable = getFocusable();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // Only move focus when opening the trap, not on unrelated re-renders.
    if (!container.contains(document.activeElement)) {
      first?.focus();
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onEscapeRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;

      const items = getFocusable();
      if (items.length === 0) return;

      const firstEl = items[0];
      const lastEl = items[items.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        }
      } else if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl?.focus();
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => {
      container.removeEventListener('keydown', onKeyDown);
      triggerRef.current?.focus?.();
    };
  }, [isActive]);

  return containerRef;
}
