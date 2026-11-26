import { SceneProps, clamp } from "./utils";

const GROUND = 240;

function mountainPoints(cx: number, w: number, h: number) {
  return [
    [cx - w / 2, GROUND],
    [cx - w * 0.2, GROUND - h * 0.75],
    [cx, GROUND - h],
    [cx + w * 0.25, GROUND - h * 0.7],
    [cx + w / 2, GROUND],
  ]
    .map((pt) => pt.join(","))
    .join(" ");
}

function snowCap(cx: number, w: number, h: number) {
  const top = GROUND - h;
  return [
    [cx, top],
    [cx + w * 0.167, top + h * 0.2],
    [cx + w * 0.08, top + h * 0.25],
    [cx, top + h * 0.2],
    [cx - w * 0.08, top + h * 0.25],
    [cx - w * 0.16, top + h * 0.2],
  ]
    .map((pt) => pt.join(","))
    .join(" ");
}

export default function MountainScene({ progress, running }: SceneProps) {
  const p = clamp(progress);
  const h1 = 170 * (1 - p);
  const w1 = 40 + 140 * (1 - p);
  const h2 = 120 * p;
  const w2 = 40 + 100 * p;

  return (
    <svg viewBox="0 0 300 300" className="h-full w-full">
      <defs>
        <linearGradient id="mt-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#bae6fd" />
          <stop offset="1" stopColor="#fef3c7" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill="url(#mt-sky)" />
      <circle cx="250" cy="50" r="22" fill="#fde047" />

      {/* mây */}
      <g className="anim-cloud" fill="white" opacity="0.9">
        <ellipse cx="60" cy="45" rx="26" ry="10" />
        <ellipse cx="78" cy="38" rx="16" ry="10" />
      </g>

      {/* núi cũ (bên trái) */}
      {h1 > 1 && (
        <g>
          <polygon points={mountainPoints(85, w1, h1)} fill="#78716c" />
          {h1 > 60 && <polygon points={snowCap(85, w1, h1)} fill="white" />}
        </g>
      )}

      {/* núi mới (bên phải) */}
      {h2 > 1 && <polygon points={mountainPoints(240, w2, h2)} fill="#a16207" />}

      {/* mặt đất */}
      <rect y={GROUND} width="300" height={300 - GROUND} fill="#84cc16" />
      <rect y={GROUND} width="300" height="6" fill="#65a30d" />

      {/* đất bay */}
      {running && p < 1 && (
        <g>
          {[0, 0.4, 0.8].map((d) => (
            <g key={d} className="anim-fly-x" style={{ animationDelay: `${d}s` }}>
              <circle className="anim-fly-y" style={{ animationDelay: `${d}s` }} cx="135" cy="215" r="5" fill="#92400e" />
            </g>
          ))}
        </g>
      )}

      {/* Ngu Công */}
      <g transform="translate(160 0)">
        <g className={running ? "anim-dig" : undefined}>
          {/* cuốc */}
          <line x1="-10" y1="190" x2="-38" y2="232" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
          <path d="M-44 228 L-30 238 L-40 242 Z" fill="#64748b" />
          {/* thân */}
          <path d="M-14 190 Q0 182 14 190 L18 238 L-18 238 Z" fill="#b45309" />
          <rect x="-16" y="208" width="32" height="5" fill="#78350f" />
          {/* đầu */}
          <circle cx="0" cy="175" r="13" fill="#fcd9b6" />
          {/* râu bạc */}
          <path d="M-9 180 Q0 206 9 180 Q0 186 -9 180 Z" fill="white" />
          <circle cx="-5" cy="172" r="1.6" fill="#1f2937" />
          <circle cx="5" cy="172" r="1.6" fill="#1f2937" />
          {/* nón lá */}
          <path d="M-24 166 L0 146 L24 166 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
          {/* tay */}
          <line x1="-10" y1="196" x2="-18" y2="212" stroke="#fcd9b6" strokeWidth="5" strokeLinecap="round" />
        </g>
      </g>

      {/* biển báo */}
      <g transform="translate(18 200)">
        <rect x="8" y="10" width="4" height="30" fill="#78350f" />
        <rect x="-4" y="0" width="34" height="16" rx="3" fill="#fde68a" stroke="#78350f" />
        <text x="13" y="11" fontSize="8" textAnchor="middle" fill="#78350f" fontWeight="700">
          {Math.round(p * 100)}%
        </text>
      </g>
    </svg>
  );
}
