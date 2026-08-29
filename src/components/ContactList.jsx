import ContactCard from './ContactCard';
import LoadingSpinner from './LoadingSpinner';

export default function ContactList({ contacts, loading, onCardTap, onAddClick }) {
  if (loading) {
    return (
      <div className="contact-list">
        <div className="spinner-page">
          <LoadingSpinner size={48} />
        </div>
      </div>
    );
  }

  if (!contacts || contacts.length === 0) {
    return (
      <div className="contact-list">
        <div className="empty-state">
          <div className="empty-emoji" aria-hidden="true">
            🔍
          </div>
          <h3 className="empty-title">Aún no hay contactos en esta categoría</h3>
          <p className="empty-text">Sé el primero en agregar uno</p>
          <button type="button" className="btn-secondary" onClick={onAddClick}>
            + Agregar el primero
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-list">
      {contacts.map((c) => (
        <ContactCard key={c.id} contact={c} onTap={onCardTap} />
      ))}
    </div>
  );
}
