import { SceneProps, clamp } from "./utils";

export default function IceScene({ progress, running }: SceneProps) {
  const p = clamp(progress);
  const size = 96 * (1 - p);
  const waterY = 200 - 40 * p;
  const iceY = waterY - size * 0.55;

  return (
    <svg viewBox="0 0 300 300" className="h-full w-full">
      <defs>
        <clipPath id="ice-glass">
          <path d="M78 82 L97 258 L203 258 L222 82 Z" />
        </clipPath>
        <linearGradient id="ice-water" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>

      {/* bàn */}
      <rect x="20" y="258" width="260" height="14" rx="7" fill="#d6a874" />

      {/* nước trong ly */}
      <g clipPath="url(#ice-glass)">
        <rect x="60" y="60" width="180" height="200" fill="#f0f9ff" />
        <rect x="60" y={waterY} width="180" height={260 - waterY} fill="url(#ice-water)" opacity="0.85" />
        <path
          d={`M60 ${waterY} q 20 -6 40 0 t 40 0 t 40 0 t 40 0 t 40 0`}
          fill="none"
          stroke="#e0f2fe"
          strokeWidth="3"
        />
        {running && size > 6 && (
          <g fill="none" stroke="white" strokeWidth="2">
            <ellipse className="anim-ripple" cx="150" cy={waterY} rx={size * 0.6 + 12} ry="4" />
            <ellipse className="anim-ripple" style={{ animationDelay: "1.1s" }} cx="150" cy={waterY} rx={size * 0.6 + 12} ry="4" />
          </g>
        )}
        {[118, 160, 182].map((x, i) => (
          <circle key={x} className="anim-rise" style={{ animationDelay: `${i * 0.8}s` }} cx={x} cy="250" r="2.5" fill="white" opacity="0.7" />
        ))}
      </g>

      {/* viên đá */}
      {size > 2 && (
        <g className={running ? "anim-bob" : undefined}>
          <g transform={`translate(150 ${iceY + size / 2}) rotate(-8)`}>
            <rect
              x={-size / 2}
              y={-size / 2}
              width={size}
              height={size}
              rx={Math.max(4, size * 0.18)}
              fill="#e0f7ff"
              stroke="#7dd3fc"
              strokeWidth="3"
              opacity="0.95"
            />
            <rect
              x={-size / 2 + size * 0.12}
              y={-size / 2 + size * 0.12}
              width={size * 0.25}
              height={size * 0.12}
              rx={size * 0.06}
              fill="white"
            />
            {size > 28 && (
              <g>
                <g className="anim-eye">
                  <circle cx={-size * 0.18} cy={-size * 0.02} r={size * 0.05} fill="#0c4a6e" />
                  <circle cx={size * 0.18} cy={-size * 0.02} r={size * 0.05} fill="#0c4a6e" />
                </g>
                <path
                  d={
                    p < 0.5
                      ? `M ${-size * 0.12} ${size * 0.12} q ${size * 0.12} ${size * 0.1} ${size * 0.24} 0`
                      : `M ${-size * 0.12} ${size * 0.18} q ${size * 0.12} ${-size * 0.08} ${size * 0.24} 0`
                  }
                  fill="none"
                  stroke="#0c4a6e"
                  strokeWidth={Math.max(1.5, size * 0.035)}
                  strokeLinecap="round"
                />
                <circle cx={-size * 0.3} cy={size * 0.12} r={size * 0.06} fill="#f9a8d4" opacity="0.7" />
                <circle cx={size * 0.3} cy={size * 0.12} r={size * 0.06} fill="#f9a8d4" opacity="0.7" />
              </g>
            )}
          </g>
          {/* giọt mồ hôi */}
          {running && size > 20 && (
            <path
              className="anim-drip"
              d={`M ${150 + size * 0.45} ${iceY + size * 0.1} q 5 8 0 12 q -5 -4 0 -12 Z`}
              fill="#38bdf8"
            />
          )}
        </g>
      )}

      {/* thành ly */}
      <path d="M78 82 L97 258 L203 258 L222 82" fill="none" stroke="#94a3b8" strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="150" cy="82" rx="72" ry="6" fill="none" stroke="#94a3b8" strokeWidth="3" />
      <path d="M92 100 L106 230" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      {[
        [212, 110, 0],
        [86, 130, 1.7],
        [206, 160, 3.2],
      ].map(([x, y, d]) => (
        <ellipse key={x + y} className="anim-slide-down" style={{ animationDelay: `${d}s` }} cx={x} cy={y} rx="2.5" ry="3.5" fill="#bae6fd" />
      ))}
    </svg>
  );
}
