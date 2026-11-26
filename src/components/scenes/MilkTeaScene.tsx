import { SceneProps, clamp } from "./utils";

const PEARLS = [
  [115, 250], [132, 252], [150, 251], [168, 252], [185, 250],
  [122, 238], [140, 240], [158, 239], [176, 238],
  [130, 226], [148, 228], [166, 226],
  [139, 214], [157, 215],
];

export default function MilkTeaScene({ progress, running }: SceneProps) {
  const p = clamp(progress);
  const level = 92 + 168 * p;
  const pearlCount = Math.ceil(PEARLS.length * (1 - p));

  return (
    <svg viewBox="0 0 300 300" className="h-full w-full">
      <defs>
        <clipPath id="tea-cup">
          <path d="M92 80 L108 262 Q150 272 192 262 L208 80 Z" />
        </clipPath>
      </defs>

      {/* ống hút phía sau */}
      <rect x="158" y="18" width="16" height="240" rx="6" fill="#ec4899" transform="rotate(8 166 140)" />

      <g clipPath="url(#tea-cup)">
        <rect x="80" y="70" width="140" height="210" fill="#fffbeb" opacity="0.8" />
        <rect x="80" y={level} width="140" height={280 - level} fill="#d4a373" />
        <rect x="80" y={level} width="140" height="6" fill="#e9c46a" opacity="0.6" />
        {PEARLS.slice(0, pearlCount).map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="7" fill="#3f2a1d" />
        ))}
        {/* bọt khí li ti trong trà */}
        {level < 225 &&
          [122, 150, 178].map((x, i) => (
            <circle key={x} className="anim-rise" style={{ animationDelay: `${i * 0.7}s` }} cx={x} cy={Math.min(262, level + 70)} r="2" fill="#fef3c7" />
          ))}
        {/* trân châu đang được hút lên */}
        {running && p < 1 && (
          <circle className="anim-sip" cx="170" cy="240" r="6" fill="#3f2a1d" />
        )}
      </g>

      {/* ly */}
      <path d="M92 80 L108 262 Q150 272 192 262 L208 80" fill="none" stroke="#a8a29e" strokeWidth="4" strokeLinejoin="round" />
      {/* nắp */}
      <path d="M84 80 Q150 30 216 80 Z" fill="#fef3c7" stroke="#a8a29e" strokeWidth="3" opacity="0.9" />
      <rect x="82" y="76" width="136" height="8" rx="4" fill="#e7e5e4" />

      {/* mặt cute */}
      <g>
        <g className="anim-eye">
          <circle cx="132" cy="150" r="4" fill="#1f2937" />
          <circle cx="168" cy="150" r="4" fill="#1f2937" />
        </g>
        <path
          d={p < 0.7 ? "M142 160 q 8 8 16 0" : "M142 166 q 8 -6 16 0"}
          stroke="#1f2937"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx="122" cy="160" rx="6" ry="4" fill="#f9a8d4" opacity="0.7" />
        <ellipse cx="178" cy="160" rx="6" ry="4" fill="#f9a8d4" opacity="0.7" />
      </g>

      {/* ống hút phía trên nắp */}
      <rect x="166" y="10" width="16" height="70" rx="6" fill="#ec4899" transform="rotate(8 174 45)" />
    </svg>
  );
}
