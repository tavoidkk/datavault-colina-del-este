import { CATEGORIES } from '../services/firestoreService';

function categoryMeta(key) {
  return CATEGORIES.find((c) => c.key === key) || { label: key, emoji: '📋' };
}

export default function ContactCard({ contact, onTap }) {
  const meta = categoryMeta(contact.category);
  const hasRatings = (contact.ratingCount || 0) > 0;
  const avg = Number(contact.averageRating || 0);

  return (
    <button
      type="button"
      className="contact-card"
      onClick={() => onTap(contact)}
      aria-label={`Ver detalles de ${contact.name}`}
    >
      <div className="contact-card-top">
        <div className="contact-emoji" aria-hidden="true">
          {meta.emoji}
        </div>
        <div className="contact-info">
          <div className="contact-name">{contact.name}</div>
          <div className="contact-category">{meta.label}</div>
        </div>
      </div>

      <div className="contact-card-bottom">
        <div className="contact-rating-row">
          {hasRatings ? (
            <>
              <span className="contact-rating-stars">
                <span aria-hidden="true">
                  {'★'.repeat(Math.round(avg))}
                  {'☆'.repeat(5 - Math.round(avg))}
                </span>
                {avg.toFixed(1)} ({contact.ratingCount} {contact.ratingCount === 1 ? 'voto' : 'votos'})
              </span>
            </>
          ) : (
            <span className="contact-rating-empty">Sin calificaciones aún</span>
          )}
          <span className="contact-added-by">
            Agregado por: {contact.addedBy} · P{contact.floor}-{contact.apartment}
          </span>
        </div>
        <span className="contact-arrow" aria-hidden="true">
          →
        </span>
      </div>
    </button>
  );
}
