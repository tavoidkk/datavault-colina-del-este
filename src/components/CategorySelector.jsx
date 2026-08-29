import { CATEGORIES } from '../services/firestoreService';

export default function CategorySelector({ onSelect, onAddClick }) {
  return (
    <div className="selector-screen app-fade">
      <div className="selector-header">
        <div className="selector-brand">Directorio de servicios</div>
        <h1 className="selector-title">¿Qué servicio necesitas?</h1>
        <p className="selector-subtitle">
          Selecciona una categoría para ver los contactos disponibles
        </p>
      </div>

      <div className="selector-content">
        <div className="category-grid">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className="category-card"
              onClick={() => onSelect(cat)}
              aria-label={`Ver contactos de ${cat.label}`}
            >
              <span className="category-emoji" aria-hidden="true">
                {cat.emoji}
              </span>
              <span className="category-label">{cat.label}</span>
            </button>
          ))}

          <button
            type="button"
            className="category-card category-card-add"
            onClick={onAddClick}
            aria-label="Agregar nuevo prestador de servicio"
          >
            <span className="category-emoji" aria-hidden="true">
              ＋
            </span>
            <span className="category-label">
              Agregar prestador
              <br />
              de servicio
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
