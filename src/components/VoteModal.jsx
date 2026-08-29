import { useState } from 'react';
import { CATEGORIES, submitVote } from '../services/firestoreService';
import StarRating from './StarRating';
import LoadingSpinner from './LoadingSpinner';

function categoryMeta(key) {
  return CATEGORIES.find((c) => c.key === key) || { label: key, emoji: '📋' };
}

const RATING_DESCRIPTIONS = {
  0: 'Selecciona una calificación',
  1: 'Muy malo',
  2: 'Malo',
  3: 'Regular',
  4: 'Bueno',
  5: 'Excelente',
};

export default function VoteModal({ contact, deviceId, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!contact) return null;
  const meta = categoryMeta(contact.category);

  async function handleSubmit() {
    if (rating === 0) {
      setError('Selecciona una calificación primero');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await submitVote(contact.phoneNormalized, deviceId, rating);
      onSuccess?.();
    } catch (err) {
      setError(err?.message || 'No se pudo registrar la calificación');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Calificar contacto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose?.();
      }}
    >
      <div className="modal-panel-center">
        <h2 className="vote-title">¿Cómo fue el servicio?</h2>
        <p className="vote-subtitle">
          {contact.name} — {meta.emoji} {meta.label}
        </p>

        <p className="vote-question">Selecciona tu calificación</p>
        <div className="vote-stars-wrap">
          <StarRating
            value={rating}
            interactive
            onChange={(v) => {
              setRating(v);
              setError('');
            }}
            size={44}
          />
        </div>
        <div className="vote-rating-desc">{RATING_DESCRIPTIONS[rating]}</div>

        {error && <div className="vote-error">{error}</div>}

        <div className="vote-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onClose?.()}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary-full"
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
          >
            {submitting ? <LoadingSpinner size={20} color="#ffffff" /> : 'Enviar calificación'}
          </button>
        </div>
      </div>
    </div>
  );
}
