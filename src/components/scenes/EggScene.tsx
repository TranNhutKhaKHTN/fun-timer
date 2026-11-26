import { Sparkle } from "./parts";
import { SceneProps, clamp } from "./utils";

const EGG = "M150 92 C 192 92 208 160 206 190 C 204 226 180 244 150 244 C 120 244 96 226 94 190 C 92 160 108 92 150 92 Z";

const CRACKS: [number, string][] = [
  [0.3, "M150 110 l-6 12 l8 8 l-5 12"],
  [0.5, "M180 150 l-10 6 l4 10 l-10 4"],
  [0.65, "M112 170 l12 -4 l2 12 l10 -2"],
  [0.8, "M140 200 l10 -8 l6 10 l10 -6"],
  [0.92, "M170 120 l-8 14 l10 4"],
];

function Nest() {
  return (
    <g>
      <ellipse cx="150" cy="252" rx="96" ry="26" fill="#a16207" />
      <path d="M60 246 q 90 30 180 0" stroke="#78350f" strokeWidth="4" fill="none" />
      <path d="M70 256 q 80 20 160 -2" stroke="#ca8a04" strokeWidth="3" fill="none" />
      <path d="M58 240 l 20 10 M242 240 l -22 10 M90 266 l 14 -8 M206 266 l -14 -8" stroke="#78350f" strokeWidth="3" />
    </g>
  );
}

export default function EggScene({ progress, running }: SceneProps) {
  const p = clamp(progress);
  const hatched = p >= 1;
  const wobble = !running ? undefined : p < 0.5 ? "anim-wobble-slow" : p < 0.85 ? "anim-wobble" : "anim-wobble-fast";

  return (
    <svg viewBox="0 0 300 300" className="h-full w-full">
      <rect width="300" height="300" fill="#fef9c3" />
      <circle cx="150" cy="170" r="110" fill="#fde68a" opacity="0.5" />

      {!hatched ? (
        <>
          <g className={wobble} style={{ transformOrigin: "150px 244px" }}>
            <path d={EGG} fill="#fffbeb" stroke="#e7e5e4" strokeWidth="3" />
            <ellipse cx="128" cy="130" rx="10" ry="16" fill="white" opacity="0.9" />
            {[
              [170, 200, 8],
              [125, 210, 6],
              [180, 160, 5],
            ].map(([x, y, r]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#fcd34d" opacity="0.5" />
            ))}
            {CRACKS.filter(([at]) => p >= at).map(([, d]) => (
              <path key={d} d={d} stroke="#57534e" strokeWidth="3" fill="none" strokeLinejoin="round" strokeLinecap="round" />
            ))}
          </g>
          <Nest />
          {running && (
            <g>
              <Sparkle x={80} y={110} delay={0} />
              <Sparkle x={222} y={130} delay={0.6} size={6} />
              <Sparkle x={210} y={70} delay={1.1} size={5} />
              <Sparkle x={90} y={190} delay={0.3} size={5} />
            </g>
          )}
        </>
      ) : (
        <>
          {/* gà con */}
          <g className="anim-hop">
          <g className="anim-pop">
            <circle cx="150" cy="170" r="52" fill="#fde047" />
            <g className="anim-eye">
              <circle cx="132" cy="162" r="6" fill="#1f2937" />
              <circle cx="168" cy="162" r="6" fill="#1f2937" />
              <circle cx="134" cy="160" r="2" fill="white" />
              <circle cx="170" cy="160" r="2" fill="white" />
            </g>
            <path d="M142 176 L158 176 L150 188 Z" fill="#f97316" />
            <ellipse cx="120" cy="180" rx="8" ry="5" fill="#fb923c" opacity="0.5" />
            <ellipse cx="180" cy="180" rx="8" ry="5" fill="#fb923c" opacity="0.5" />
            {/* vỏ trên đầu */}
            <path d="M118 128 L126 116 L134 126 L142 112 L150 124 L158 110 L166 124 L174 114 L182 128 Q150 90 118 128 Z" fill="#fffbeb" stroke="#e7e5e4" strokeWidth="2" />
          </g>
          </g>
          <Sparkle x={70} y={120} delay={0} />
          <Sparkle x={232} y={150} delay={0.5} size={7} />
          <Sparkle x={100} y={70} delay={1} size={6} />
          {/* nửa vỏ dưới */}
          <path
            d="M96 196 L108 186 L118 198 L130 184 L142 198 L154 184 L166 198 L178 184 L190 198 L204 188 C 204 228 180 244 150 244 C 120 244 96 228 96 196 Z"
            fill="#fffbeb"
            stroke="#e7e5e4"
            strokeWidth="3"
          />
          <Nest />
          <text x="225" y="100" fontSize="18" fontWeight="800" fill="#ca8a04" className="anim-bob">
            chiếp!
          </text>
        </>
      )}
    </svg>
  );
}
