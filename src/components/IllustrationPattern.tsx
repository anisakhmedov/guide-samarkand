// Decorative geometric-tile illustration (Timurid majolica motif), used as the hero visual
// for story cards that don't have a real uploaded photo. Deliberately abstract/ornamental —
// it never pretends to be an actual photograph of the place.
export function IllustrationPattern({
  color,
  colorDark,
  seed = 0,
  icon,
}: {
  color: string;
  colorDark: string;
  seed?: number;
  icon?: React.ReactNode;
}) {
  const patternId = `tile-${seed}`;
  const rotate = (seed * 37) % 45;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: colorDark }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`grad-${seed}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={colorDark} />
          </linearGradient>
          <pattern id={patternId} width="64" height="64" patternUnits="userSpaceOnUse" patternTransform={`rotate(${rotate})`}>
            <rect width="64" height="64" fill="none" />
            <g opacity="0.5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" fill="none">
              <path d="M32 4 L60 32 L32 60 L4 32 Z" />
              <circle cx="32" cy="32" r="14" />
              <path d="M32 18 L46 32 L32 46 L18 32 Z" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grad-${seed})`} />
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      {icon && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.92)',
          }}
        >
          {icon}
        </div>
      )}
    </div>
  );
}
