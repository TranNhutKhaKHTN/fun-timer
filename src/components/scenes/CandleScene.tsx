import { SceneProps, clamp } from "./utils";

export default function CandleScene({ progress, running }: SceneProps) {
  const p = clamp(progress);
  const base = 250;
  const h = 8 + 160 * (1 - p);
  const top = base - h;
  const done = p >= 1;

  return (
    <svg viewBox="0 0 300 300" className="h-full w-full">
      <defs>
        <radialGradient id="candle-glow">
          <stop offset="0" stopColor="#fde68a" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="300" fill="#1e1b4b" />
      {[
        [40, 40],
        [80, 90],
        [250, 60],
        [220, 120],
        [30, 160],
        [270, 180],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="white" className="anim-twinkle" />
      ))}

      {!done && <circle cx="150" cy={top - 20} r="90" fill="url(#candle-glow)" className={running ? "anim-glow" : undefined} />}

      {/* đĩa */}
      <ellipse cx="150" cy={base + 4} rx="70" ry="12" fill="#cbd5e1" />
      <ellipse cx="150" cy={base} rx="58" ry="8" fill="#e2e8f0" />

      {/* thân nến */}
      <rect x="122" y={top} width="56" height={h} rx="6" fill="#f472b6" />
      <rect x="128" y={top + 4} width="8" height={Math.max(0, h - 10)} rx="4" fill="#fbcfe8" opacity="0.7" />
      <ellipse cx="150" cy={top} rx="28" ry="6" fill="#f9a8d4" />
      {/* sáp chảy */}
      {p > 0.15 && (
        <g fill="#fbcfe8">
          <path d={`M168 ${top} q 6 0 6 6 v ${Math.min(30, p * 60)} a 4 4 0 0 1 -8 0 v -10 Z`} />
          <path d={`M126 ${top} q -4 0 -4 6 v ${Math.min(18, p * 40)} a 4 4 0 0 0 8 0 Z`} />
        </g>
      )}

      {/* bấc */}
      <line x1="150" y1={top - 1} x2="150" y2={top - 12} stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />

      {/* lửa hoặc khói */}
      {!done ? (
        <g className={running ? "anim-flicker" : undefined} style={{ transformOrigin: `150px ${top - 10}px` }}>
          <path d={`M150 ${top - 52} C 168 ${top - 30} 164 ${top - 8} 150 ${top - 8} C 136 ${top - 8} 132 ${top - 30} 150 ${top - 52} Z`} fill="#f59e0b" />
          <path d={`M150 ${top - 36} C 159 ${top - 24} 157 ${top - 12} 150 ${top - 12} C 143 ${top - 12} 141 ${top - 24} 150 ${top - 36} Z`} fill="#fef08a" />
          <ellipse cx="150" cy={top - 16} rx="3" ry="5" fill="#fff" opacity="0.8" />
        </g>
      ) : null}
      {!done && running && (
        <g fill="#fbbf24">
          {[
            [-6, 0, "-10px"],
            [4, 0.6, "12px"],
            [0, 1.2, "-4px"],
          ].map(([dx, d, drift]) => (
            <circle
              key={String(d)}
              className="anim-ember"
              style={{ animationDelay: `${d}s`, ["--dx" as string]: drift }}
              cx={150 + Number(dx)}
              cy={top - 44}
              r="2"
            />
          ))}
        </g>
      )}
      {done && (
        <g fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round">
          <path className="anim-smoke" d={`M150 ${top - 14} q -10 -12 0 -24 t 0 -24`} />
          <path className="anim-smoke" style={{ animationDelay: "0.8s" }} d={`M150 ${top - 14} q 10 -12 0 -24 t 0 -24`} />
        </g>
      )}
      {/* sao băng thỉnh thoảng vụt qua */}
      <g className="anim-bird" style={{ animationDuration: "9s", animationDelay: "3s" }}>
        <line x1="0" y1="30" x2="-24" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      </g>
    </svg>
  );
}
