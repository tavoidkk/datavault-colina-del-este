function StarIcon({ size = 20, fillPercent = 100, color = 'var(--color-star-filled)' }) {
  const id = `clip-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <svg
      className="star-svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ display: 'inline-block' }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width={24 * (fillPercent / 100)} height="24" />
        </clipPath>
      </defs>
      <path
        d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 17.77l-5.9 2.9 1.13-6.57L2.45 9.44l6.6-.96L12 2.5z"
        fill="var(--color-star-empty)"
      />
      <path
        d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 17.77l-5.9 2.9 1.13-6.57L2.45 9.44l6.6-.96L12 2.5z"
        fill={color}
        clipPath={`url(#${id})`}
      />
    </svg>
  );
}

export default function StarRating({
  value = 0,
  interactive = false,
  onChange,
  size = 20,
  showValue = false,
}) {
  const stars = [1, 2, 3, 4, 5];
  const filled = Math.max(0, Math.min(5, Number(value) || 0));

  if (interactive) {
    return (
      <div className="star-row" role="radiogroup" aria-label="Calificación">
        {stars.map((s) => {
          const isActive = s <= filled;
          return (
            <button
              key={s}
              type="button"
              className="star-interactive"
              role="radio"
              aria-checked={s === Math.round(filled)}
              aria-label={`${s} estrella${s > 1 ? 's' : ''}`}
              onClick={() => onChange?.(s)}
            >
              <StarIcon
                size={size}
                fillPercent={isActive ? 100 : 0}
                color="var(--color-star-filled)"
              />
            </button>
          );
        })}
        {showValue && filled > 0 && (
          <span style={{ marginLeft: 8, fontWeight: 600 }}>{filled.toFixed(0)}/5</span>
        )}
      </div>
    );
  }

  return (
    <div className="star-row" aria-label={`${filled.toFixed(1)} de 5`}>
      {stars.map((s) => {
        let pct = 0;
        if (filled >= s) pct = 100;
        else if (filled >= s - 0.5) pct = 50;
        return (
          <span key={s}>
            <StarIcon size={size} fillPercent={pct} color="var(--color-star-filled)" />
          </span>
        );
      })}
      {showValue && filled > 0 && (
        <span style={{ marginLeft: 6, fontWeight: 600 }}>{filled.toFixed(1)}</span>
      )}
    </div>
  );
}
