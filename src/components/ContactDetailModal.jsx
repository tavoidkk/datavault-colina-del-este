import { useEffect, useRef, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { CATEGORIES } from '../services/firestoreService';
import StarRating from './StarRating';

function categoryMeta(key) {
  return CATEGORIES.find((c) => c.key === key) || { label: key, emoji: '📋' };
}

const DEFAULT_COUNTRY_CODE = '58';

export function buildWhatsAppNumber(rawPhone) {
  if (!rawPhone) return '';
  const trimmed = String(rawPhone).trim();
  const hasPlus = trimmed.startsWith('+');
  let digits = trimmed.replace(/[^0-9]/g, '');
  if (hasPlus) return digits;
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.startsWith(DEFAULT_COUNTRY_CODE)) return digits;
  return DEFAULT_COUNTRY_CODE + digits;
}

function formatCreatedAt(timestamp) {
  if (!timestamp) return '—';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('es-VE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return '—';
  }
}

export default function ContactDetailModal({
  contact,
  hasVoted,
  onClose,
  onVote,
}) {
  const [copying, setCopying] = useState(false);
  const [liveContact, setLiveContact] = useState(contact);
  const unsubRef = useRef(null);

  useEffect(() => {
    setLiveContact(contact);
  }, [contact]);

  useEffect(() => {
    if (!contact?.phoneNormalized) return undefined;

    const ref = doc(db, 'contacts', contact.phoneNormalized);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setLiveContact({ id: snap.id, ...snap.data() });
        }
      },
      (err) => {
        console.error('ContactDetailModal snapshot error:', err);
      }
    );
    unsubRef.current = unsub;

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [contact?.phoneNormalized]);

  if (!liveContact) return null;

  const meta = categoryMeta(liveContact.category);
  const ratingCount = Number(liveContact.ratingCount || 0);
  const avg = Number(liveContact.averageRating || 0);
  const hasRatings = ratingCount > 0;

  async function handleCopy() {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(liveContact.phone);
      } else {
        const ta = document.createElement('textarea');
        ta.value = liveContact.phone;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
      onClose?.({ type: 'toast', level: 'success', message: 'Número copiado al portapapeles' });
    } catch {
      onClose?.({ type: 'toast', level: 'error', message: 'No se pudo copiar el número' });
    }
  }

  function handleWhatsApp() {
    const cleanPhone = buildWhatsAppNumber(liveContact.phone);
    const text = encodeURIComponent('Hola');
    const url = `https://wa.me/${cleanPhone}?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalles de ${liveContact.name}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="modal-panel-bottom">
        <div className="modal-handle" />
        <button
          type="button"
          className="modal-close"
          onClick={() => onClose?.()}
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="detail-header">
          <div className="detail-emoji" aria-hidden="true">
            {meta.emoji}
          </div>
          <h2 className="detail-name">{liveContact.name}</h2>
          <span className="category-badge">
            {meta.emoji} {meta.label}
          </span>
        </div>

        <div className="detail-section">
          <h3 className="detail-section-title">Información</h3>
          <div className="detail-row">
            <span className="detail-row-label">Teléfono</span>
            <span className="detail-row-value">{liveContact.phone}</span>
          </div>
          <div className="detail-row">
            <span className="detail-row-label">Categoría</span>
            <span className="detail-row-value">{meta.label}</span>
          </div>
          <div className="detail-row">
            <span className="detail-row-label">Registrado por</span>
            <span className="detail-row-value">
              {liveContact.addedBy} · Piso {liveContact.floor}, Apt {liveContact.apartment}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-row-label">Fecha</span>
            <span className="detail-row-value">{formatCreatedAt(liveContact.createdAt)}</span>
          </div>
        </div>

        <div className="detail-section" key={`rating-${ratingCount}-${avg}`}>
          <h3 className="detail-section-title">Calificación</h3>
          {hasRatings ? (
            <div className="rating-display">
              <StarRating value={avg} size={28} />
              <span className="rating-display-text">
                {avg.toFixed(1)} de 5 · {ratingCount}{' '}
                {ratingCount === 1 ? 'voto' : 'votos'}
              </span>
            </div>
          ) : (
            <p className="rating-display-text">
              Este contacto aún no tiene calificaciones.
            </p>
          )}
        </div>

        <div className="detail-actions">
          <button
            type="button"
            className="detail-btn detail-btn-primary-light"
            onClick={handleCopy}
            disabled={copying}
          >
            {copying ? '✓ ¡Copiado!' : '🔗 Copiar número'}
          </button>

          <button
            type="button"
            className="detail-btn detail-btn-whatsapp"
            onClick={handleWhatsApp}
          >
            💬 Enviar WhatsApp
          </button>

          {hasVoted ? (
            <button type="button" className="detail-btn detail-btn-primary" disabled>
              ⭐ Ya calificaste este contacto
            </button>
          ) : (
            <button
              type="button"
              className="detail-btn detail-btn-primary"
              onClick={() => onVote?.()}
            >
              ⭐ Puntuar contacto
            </button>
          )}

          {hasVoted && (
            <div className="already-voted">✓ Ya calificaste este contacto</div>
          )}
        </div>
      </div>
    </div>
  );
}
