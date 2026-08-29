import { useEffect } from 'react';

const ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export default function Toast({ message, type = 'info', onDismiss, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onDismiss?.(), duration);
    return () => clearTimeout(t);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      <span className={`toast-icon ${type}`}>{ICONS[type] || 'ℹ'}</span>
      <span>{message}</span>
    </div>
  );
}
