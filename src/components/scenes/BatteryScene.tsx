import { SceneProps, clamp } from "./utils";

export default function BatteryScene({ progress, running }: SceneProps) {
  const p = clamp(progress);
  const level = 1 - p;
  const percent = Math.ceil(level * 100);
  const color = level > 0.5 ? "#22c55e" : level > 0.2 ? "#eab308" : "#ef4444";
  const innerW = 176;
  const dead = percent <= 0;

  return (
    <svg viewBox="0 0 300 300" className="h-full w-full">
      <rect width="300" height="300" fill="#f8fafc" />

      {/* thân pin */}
      <rect x="50" y="95" width="190" height="110" rx="18" fill="white" stroke="#0f172a" strokeWidth="6" />
      <rect x="240" y="128" width="16" height="44" rx="6" fill="#0f172a" />
      <rect
        x="57"
        y="102"
        width={innerW * level}
        height="96"
        rx="12"
        fill={color}
        className={running && level <= 0.2 && !dead ? "anim-blink" : undefined}
      />

      {/* khuôn mặt */}
      <g>
        {dead ? (
          <g stroke="#0f172a" strokeWidth="4" strokeLinecap="round">
            <path d="M110 132 l12 12 M122 132 l-12 12" />
            <path d="M168 132 l12 12 M180 132 l-12 12" />
            <path d="M128 172 h34" />
          </g>
        ) : (
          <g>
            {level > 0.3 ? (
              <>
                <circle cx="116" cy="138" r="6" fill="#0f172a" />
                <circle cx="174" cy="138" r="6" fill="#0f172a" />
              </>
            ) : (
              <g stroke="#0f172a" strokeWidth="4" strokeLinecap="round">
                <path d="M108 140 h16" />
                <path d="M166 140 h16" />
              </g>
            )}
            <path
              d={level > 0.5 ? "M128 162 q 17 16 34 0" : level > 0.2 ? "M128 168 h34" : "M128 174 q 17 -12 34 0"}
              stroke="#0f172a"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            {level <= 0.5 && <path d="M190 118 q 6 10 0 14 q -6 -4 0 -14 Z" fill="#38bdf8" />}
          </g>
        )}
      </g>

      <text x="150" y="250" textAnchor="middle" fontSize="34" fontWeight="800" fill={dead ? "#ef4444" : "#0f172a"}>
        {percent}%
      </text>
      {level <= 0.2 && (
        <text x="150" y="70" textAnchor="middle" fontSize="16" fontWeight="700" fill="#ef4444" className={running ? "anim-blink" : undefined}>
          {dead ? "Hết pin 🪫" : "Pin yếu!"}
        </text>
      )}
    </svg>
  );
}
