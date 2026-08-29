export default function LoadingSpinner({ size = 40, color = 'var(--color-primary)' }) {
  const px = `${size}px`;
  return (
    <span className="spinner-wrap" role="status" aria-label="Cargando">
      <svg
        className="spinner"
        width={size}
        height={size}
        viewBox="0 0 48 48"
        style={{ width: px, height: px }}
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke={color}
          strokeOpacity="0.2"
          strokeWidth="4"
        />
        <path
          d="M44 24a20 20 0 0 0-20-20"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
