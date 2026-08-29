export default function DisclaimerModal({ onAccept }) {
  return (
    <div className="disclaimer-screen">
      <svg
        className="disclaimer-icon"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="10" y="14" width="44" height="46" rx="4" fill="currentColor" />
        <rect x="18" y="22" width="8" height="8" rx="1" fill="#dfd3c2" />
        <rect x="28" y="22" width="8" height="8" rx="1" fill="#dfd3c2" />
        <rect x="38" y="22" width="8" height="8" rx="1" fill="#dfd3c2" />
        <rect x="18" y="34" width="8" height="8" rx="1" fill="#dfd3c2" />
        <rect x="28" y="34" width="8" height="8" rx="1" fill="#dfd3c2" />
        <rect x="38" y="34" width="8" height="8" rx="1" fill="#dfd3c2" />
        <rect x="28" y="46" width="8" height="14" rx="1" fill="#dfd3c2" />
      </svg>

      <h1 className="disclaimer-title">Colina Del Este</h1>
      <p className="disclaimer-subtitle">Directorio de servicios</p>

      <div className="disclaimer-divider" />

      <div className="disclaimer-notice">
        <p className="disclaimer-notice-title">⚠️ Aviso importante</p>
        <p className="disclaimer-notice-text">
          {`Este directorio es mantenido únicamente por residentes del Edificio Colina Del Este. Ni el Condominio, ni la Junta de Condominio, ni ningún residente se hacen responsables por la calidad, puntualidad, precios o resultado de los servicios de los contactos aquí listados.

Al continuar, usted acepta que cualquier contratación es de su exclusiva responsabilidad.`}
        </p>
      </div>

      <button type="button" className="btn-primary-full" onClick={onAccept}>
        Entendido, continuar
      </button>
    </div>
  );
}
