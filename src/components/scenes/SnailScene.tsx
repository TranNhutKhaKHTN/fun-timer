import { SceneProps, clamp } from "./utils";

function Butterfly({ x, y, color, delay }: { x: number; y: number; color: string; delay: number }) {
  return (
    <g className="anim-butterfly" style={{ animationDelay: `${delay}s` }}>
      <g transform={`translate(${x} ${y})`}>
        <g className="anim-flap" style={{ animationDuration: "0.25s" }}>
          <ellipse cx="-5" cy="0" rx="5" ry="7" fill={color} />
          <ellipse cx="5" cy="0" rx="5" ry="7" fill={color} />
        </g>
        <rect x="-1" y="-6" width="2" height="12" rx="1" fill="#1f2937" />
      </g>
    </g>
  );
}

export default function SnailScene({ progress, running }: SceneProps) {
  const p = clamp(progress);
  const startX = 40;
  const endX = 180;
  const x = startX + (endX - startX) * p;
  const ground = 225;

  return (
    <svg viewBox="0 0 300 300" className="h-full w-full">
      <rect width="300" height="300" fill="#bbf7d0" />
      <circle cx="50" cy="55" r="24" fill="#fde047" />
      <rect y={ground} width="300" height={300 - ground} fill="#4ade80" />
      {[20, 70, 120, 170, 220, 270].map((gx) => (
        <path key={gx} d={`M${gx} ${ground + 30} l4 -10 l4 10`} stroke="#16a34a" strokeWidth="2" fill="none" />
      ))}

      <Butterfly x={60} y={120} color="#f472b6" delay={0} />
      <Butterfly x={150} y={90} color="#fb923c" delay={3} />
      {/* hoa */}
      {[95, 140, 225].map((fx, i) => (
        <g key={fx} className="anim-sway" style={{ transformOrigin: `${fx}px ${ground}px`, animationDelay: `${i * 0.7}s` }}>
          <line x1={fx} y1={ground} x2={fx} y2={ground - 18} stroke="#16a34a" strokeWidth="2" />
          <circle cx={fx} cy={ground - 20} r="5" fill={["#f472b6", "#facc15", "#a78bfa"][i]} />
          <circle cx={fx} cy={ground - 20} r="2" fill="#fff7ed" />
        </g>
      ))}

      {/* vạch xuất phát */}
      <g transform={`translate(${startX - 22} ${ground})`}>
        <line x1="0" y1="0" x2="0" y2="-50" stroke="#475569" strokeWidth="3" />
        <path d="M0 -50 L22 -43 L0 -36 Z" fill="#ef4444" />
      </g>

      {/* nhà nấm */}
      <g transform={`translate(255 ${ground})`}>
        <rect x="-18" y="-46" width="36" height="46" rx="6" fill="#fef3c7" />
        <rect x="-7" y="-24" width="14" height="24" rx="7" fill="#92400e" />
        <path d="M-38 -42 Q0 -100 38 -42 Z" fill="#ef4444" />
        <circle cx="-14" cy="-60" r="6" fill="white" />
        <circle cx="10" cy="-70" r="5" fill="white" />
        <circle cx="22" cy="-52" r="4" fill="white" />
      </g>

      {/* vệt nhớt */}
      {x > startX + 2 && (
        <line x1={startX} y1={ground - 2} x2={x - 10} y2={ground - 2} stroke="#a5f3fc" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
      )}

      {/* ốc sên */}
      <g transform={`translate(${x} ${ground})`}>
        <g className={running ? "anim-crawl" : undefined}>
          <path d="M-36 0 Q-40 -14 -20 -14 L20 -14 Q30 -14 32 -30 Q40 -30 40 -18 Q40 0 30 0 Z" fill="#fcd34d" />
          {/* râu */}
          <line x1="32" y1="-28" x2="28" y2="-46" stroke="#fcd34d" strokeWidth="3" strokeLinecap="round" />
          <line x1="37" y1="-28" x2="42" y2="-45" stroke="#fcd34d" strokeWidth="3" strokeLinecap="round" />
          <circle cx="28" cy="-47" r="4" fill="white" stroke="#fcd34d" strokeWidth="2" />
          <circle cx="42" cy="-46" r="4" fill="white" stroke="#fcd34d" strokeWidth="2" />
          <g className="anim-eye">
            <circle cx="29" cy="-47" r="2" fill="#1f2937" />
            <circle cx="43" cy="-46" r="2" fill="#1f2937" />
          </g>
          <path d="M33 -20 q 3 3 6 0" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* vỏ */}
          <circle cx="0" cy="-34" r="26" fill="#a855f7" />
          <path
            d="M0 -34 m 0 -4 a 4 4 0 1 1 -4 4 a 9 9 0 0 1 9 -9 a 14 14 0 0 1 14 14 a 19 19 0 0 1 -19 19 a 23 23 0 0 1 -23 -23"
            fill="none"
            stroke="#7e22ce"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  );
}
