import { SceneProps, clamp } from "./utils";

const FRUITS = [
  [-30, -10],
  [25, -20],
  [-5, 15],
  [40, 10],
  [-45, 20],
  [10, -40],
];

export default function TreeScene({ progress, running }: SceneProps) {
  const p = clamp(progress);
  const ground = 250;
  const trunkH = 10 + 120 * p;
  const trunkW = 4 + 16 * p;
  const top = ground - trunkH;
  const r = 8 + 58 * p;
  const fruitCount = p > 0.8 ? Math.ceil(((p - 0.8) / 0.2) * FRUITS.length) : 0;

  return (
    <svg viewBox="0 0 300 300" className="h-full w-full">
      <rect width="300" height="300" fill="#e0f2fe" />
      <g className={running ? "anim-spin-slow" : undefined} style={{ transformOrigin: "250px 50px" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={i}
            x1="250"
            y1="50"
            x2={250 + Math.cos((i * Math.PI) / 4) * 36}
            y2={50 + Math.sin((i * Math.PI) / 4) * 36}
            stroke="#facc15"
            strokeWidth="4"
            strokeLinecap="round"
          />
        ))}
      </g>
      <circle cx="250" cy="50" r="20" fill="#fde047" />

      <ellipse cx="150" cy={ground + 30} rx="170" ry="40" fill="#86efac" />
      <ellipse cx="150" cy={ground + 2} rx="40" ry="8" fill="#a16207" />

      <g className={running ? "anim-sway" : undefined} style={{ transformOrigin: `150px ${ground}px` }}>
        {/* thân cây */}
        <path
          d={`M${150 - trunkW / 2} ${ground} L${150 - trunkW / 3} ${top + 6} L${150 + trunkW / 3} ${top + 6} L${150 + trunkW / 2} ${ground} Z`}
          fill="#92400e"
        />

        {p < 0.2 ? (
          // mầm non: hai chiếc lá
          <g>
            <ellipse cx={150 - 10} cy={top} rx="11" ry="5" fill="#22c55e" transform={`rotate(-25 ${150 - 10} ${top})`} />
            <ellipse cx={150 + 10} cy={top} rx="11" ry="5" fill="#22c55e" transform={`rotate(25 ${150 + 10} ${top})`} />
          </g>
        ) : (
          <g>
            <circle cx={150 - r * 0.6} cy={top + r * 0.25} r={r * 0.7} fill="#16a34a" />
            <circle cx={150 + r * 0.6} cy={top + r * 0.25} r={r * 0.7} fill="#16a34a" />
            <circle cx="150" cy={top - r * 0.15} r={r} fill="#22c55e" />
            <circle cx={150 - r * 0.3} cy={top - r * 0.45} r={r * 0.25} fill="#4ade80" opacity="0.7" />
          </g>
        )}

        {FRUITS.slice(0, fruitCount).map(([fx, fy], i) => (
          <g key={i} className="anim-pop">
            <circle cx={150 + fx} cy={top + fy} r="8" fill="#ef4444" />
            <circle cx={150 + fx - 2.5} cy={top + fy - 2.5} r="2" fill="white" opacity="0.7" />
          </g>
        ))}
      </g>
    </svg>
  );
}
