import { SceneProps, clamp } from "./utils";

const SLICES = 8;
const CX = 150;
const CY = 155;
const R = 105;

function polar(r: number, a: number): [number, number] {
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function slicePath(i: number, r: number) {
  const a1 = (i / SLICES) * Math.PI * 2 - Math.PI / 2;
  const a2 = ((i + 1) / SLICES) * Math.PI * 2 - Math.PI / 2;
  const [x1, y1] = polar(r, a1);
  const [x2, y2] = polar(r, a2);
  return `M${CX} ${CY} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} Z`;
}

export default function PizzaScene({ progress, running }: SceneProps) {
  const p = clamp(progress);
  const eaten = Math.min(SLICES, Math.floor(p * SLICES));

  return (
    <svg viewBox="0 0 300 300" className="h-full w-full">
      <rect width="300" height="300" fill="#fff1f2" />
      {/* khăn caro */}
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={i * 50} y="0" width="25" height="300" fill="#fecdd3" opacity="0.6" />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={`h${i}`} x="0" y={i * 50} width="300" height="25" fill="#fecdd3" opacity="0.6" />
      ))}

      {/* đĩa */}
      <circle cx={CX} cy={CY + 4} r={R + 22} fill="#cbd5e1" />
      <circle cx={CX} cy={CY} r={R + 20} fill="white" />

      {Array.from({ length: SLICES }).map((_, i) => {
        if (i < eaten) return null;
        const mid = ((i + 0.5) / SLICES) * Math.PI * 2 - Math.PI / 2;
        const [px1, py1] = polar(R * 0.55, mid - 0.12);
        const [px2, py2] = polar(R * 0.3, mid + 0.1);
        const [ox, oy] = polar(R * 0.78, mid);
        const isNext = i === eaten && running;
        return (
          <g key={i} className={isNext ? "anim-wiggle" : undefined} style={{ transformOrigin: `${CX}px ${CY}px` }}>
            <path d={slicePath(i, R)} fill="#f59e0b" stroke="#fff7ed" strokeWidth="2" />
            <path d={slicePath(i, R - 12)} fill="#fcd34d" />
            <circle cx={px1} cy={py1} r="10" fill="#dc2626" />
            <circle cx={px2} cy={py2} r="8" fill="#dc2626" />
            <circle cx={ox} cy={oy} r="4" fill="#16a34a" />
          </g>
        );
      })}

      {/* hơi nóng bốc lên */}
      {eaten < SLICES &&
        [120, 150, 180].map((x, i) => (
          <path
            key={x}
            className="anim-steam"
            style={{ animationDelay: `${i * 0.9}s` }}
            d={`M${x} ${CY - 30} q -8 -10 0 -20 t 0 -20`}
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.8"
          />
        ))}

      {/* vụn bánh khi hết */}
      {eaten >= SLICES && (
        <g fill="#f59e0b">
          <circle cx="130" cy="140" r="3" />
          <circle cx="170" cy="170" r="2.5" />
          <circle cx="150" cy="120" r="2" />
          <circle cx="120" cy="180" r="2.5" />
          <text x="150" y="160" textAnchor="middle" fontSize="22" fontWeight="800" fill="#9f1239">
            Hết sạch!
          </text>
        </g>
      )}

      <text x="150" y="292" textAnchor="middle" fontSize="15" fontWeight="700" fill="#9f1239">
        Còn {SLICES - eaten}/{SLICES} miếng
      </text>
    </svg>
  );
}
