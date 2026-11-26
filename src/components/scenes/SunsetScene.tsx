import { Bird } from "./parts";
import { SceneProps, clamp, mixColors } from "./utils";

const STARS = [
  [30, 40], [70, 80], [110, 30], [160, 60], [200, 25], [240, 90], [275, 45], [50, 130], [130, 110], [215, 140],
];

export default function SunsetScene({ progress, running }: SceneProps) {
  const p = clamp(progress);
  const skyTop = mixColors(["#38bdf8", "#60a5fa", "#7c3aed", "#1e1b4b", "#0f172a"], p);
  const skyBottom = mixColors(["#bae6fd", "#fde68a", "#fb923c", "#9d174d", "#1e1b4b"], p);
  const sunColor = mixColors(["#fde047", "#fbbf24", "#f97316", "#dc2626"], p);
  const sea = mixColors(["#0ea5e9", "#0369a1", "#4c1d95", "#1e1b4b"], p);
  const sunY = 70 + 175 * p;
  const starOpacity = clamp((p - 0.65) / 0.35);
  const horizon = 210;

  return (
    <svg viewBox="0 0 300 300" className="h-full w-full">
      <defs>
        <linearGradient id="sunset-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBottom} />
        </linearGradient>
        <clipPath id="sunset-above">
          <rect width="300" height={horizon} />
        </clipPath>
      </defs>
      <rect width="300" height="300" fill="url(#sunset-sky)" />

      <g opacity={starOpacity}>
        {STARS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2 : 1.3} fill="white" className={running ? "anim-twinkle" : undefined} style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
        <path d="M250 40 a 18 18 0 1 0 14 30 a 14 14 0 1 1 -14 -30 Z" fill="#fef9c3" />
      </g>

      <g clipPath="url(#sunset-above)">
        <circle cx="150" cy={sunY} r="38" fill={sunColor} />
        <circle cx="150" cy={sunY} r="52" fill={sunColor} opacity="0.25" />
      </g>

      {/* hải âu, tối dần theo trời */}
      {p < 0.85 && (
        <g opacity={1 - p}>
          <Bird y={110} delay={0} color="#1f2937" />
          <Bird y={130} delay={1.2} color="#1f2937" scale={0.7} />
        </g>
      )}

      {/* biển */}
      <rect y={horizon} width="300" height={300 - horizon} fill={sea} />
      {/* sóng chạy ngang */}
      {[0, 1].map((i) => (
        <path
          key={i}
          className={i ? "anim-wave-slow" : "anim-wave"}
          d={`M-48 ${horizon + 40 + i * 30} ${Array.from({ length: 9 }, () => "q 12 -5 24 0 t 24 0").join(" ")}`}
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity={0.35 - i * 0.1}
        />
      ))}
      {sunY < horizon + 38 &&
        [0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={150 - (40 - i * 8)}
            y={horizon + 8 + i * 14}
            width={(40 - i * 8) * 2}
            height="4"
            rx="2"
            fill={sunColor}
            opacity={0.6 - i * 0.12}
            className={running ? "anim-shimmer" : undefined}
          />
        ))}

      {/* thuyền */}
      <g transform={`translate(${60 + p * 30} ${horizon + 2})`}>
        <path d="M-18 0 L18 0 L12 8 L-12 8 Z" fill="#1f2937" />
        <line x1="0" y1="0" x2="0" y2="-24" stroke="#1f2937" strokeWidth="2" />
        <path d="M2 -22 L16 -4 L2 -4 Z" fill="#1f2937" />
      </g>
    </svg>
  );
}
