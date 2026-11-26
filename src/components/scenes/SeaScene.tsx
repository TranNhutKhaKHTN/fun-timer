import { Bird } from "./parts";
import { SceneProps, clamp } from "./utils";

const BANK = 140; // mặt đất bờ biển
// Lòng biển: dốc từ mép bờ xuống đáy
const SEABED = "M100 140 Q112 215 138 258 Q215 286 300 266";
const BASIN = `M92 110 L100 140 Q112 215 138 258 Q215 286 300 266 L300 110 Z`;

function Person({ x, shirt, pants, wife }: { x: number; shirt: string; pants: string; wife?: boolean }) {
  return (
    <g>
      <line x1={x - 4} y1={BANK} x2={x - 4} y2={BANK - 16} stroke={pants} strokeWidth="5" strokeLinecap="round" />
      <line x1={x + 4} y1={BANK} x2={x + 4} y2={BANK - 16} stroke={pants} strokeWidth="5" strokeLinecap="round" />
      <rect x={x - 9} y={BANK - 40} width="18" height="26" rx="6" fill={shirt} />
      <circle cx={x} cy={BANK - 48} r="9" fill="#fcd9b6" />
      <g className="anim-eye">
        <circle cx={x + 3} cy={BANK - 49} r="1.4" fill="#1f2937" />
      </g>
      <path d={`M${x} ${BANK - 44} q 3 2 6 0`} stroke="#1f2937" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {wife ? (
        // nón lá
        <path d={`M${x - 16} ${BANK - 52} L${x} ${BANK - 68} L${x + 16} ${BANK - 52} Z`} fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" />
      ) : (
        // khăn rằn
        <path d={`M${x - 9} ${BANK - 51} Q${x} ${BANK - 62} ${x + 9} ${BANK - 51} Z`} fill="#1f2937" />
      )}
    </g>
  );
}

export default function SeaScene({ progress, running }: SceneProps) {
  const p = clamp(progress);
  const waterY = 128 + 146 * p;
  const empty = p >= 1;

  // Hai vợ chồng đứng trên bờ, mỗi người cầm một đầu dây gàu
  const husbandHand: [number, number] = [44, BANK - 28];
  const wifeHand: [number, number] = [86, BANK - 28];
  // Gàu thả dọc theo vách bờ xuống tới mặt nước
  const reachY = Math.min(waterY, 262);
  const bucketY = reachY - 4;
  const bucketX = 100 + ((clamp((reachY - BANK) / 118) * 38) | 0) + 16;

  // Thuyền nổi theo mặt nước, khi cạn thì nằm nghiêng dưới đáy
  const boatX = 240;
  const boatY = empty ? 268 : Math.min(waterY, 268);

  return (
    <svg viewBox="0 0 300 300" className="h-full w-full">
      <defs>
        <linearGradient id="sea-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="sea-water" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
        <clipPath id="sea-basin">
          <path d={BASIN} />
        </clipPath>
      </defs>

      <rect width="300" height="300" fill="url(#sea-sky)" />
      <circle cx="255" cy="40" r="20" fill="#fde047" />
      <g className="anim-cloud" fill="white" opacity="0.9">
        <ellipse cx="150" cy="40" rx="24" ry="9" />
        <ellipse cx="166" cy="33" rx="14" ry="9" />
      </g>

      <Bird y={70} delay={0} />
      <Bird y={88} delay={5} scale={0.75} />

      {/* đáy biển (cát) */}
      <path d={`${SEABED} L300 300 L0 300 L0 ${BANK} Z`} fill="#fcd34d" />
      <path d={SEABED} fill="none" stroke="#d97706" strokeWidth="2" opacity="0.5" />

      {/* đồ vật dưới đáy, lộ ra khi nước rút */}
      <g>
        {/* xác tàu đắm */}
        <g transform="translate(178 262) rotate(-12)">
          <path d="M-22 0 L22 0 L16 10 L-16 10 Z" fill="#78350f" />
          <line x1="0" y1="0" x2="0" y2="-22" stroke="#78350f" strokeWidth="3" />
          <path d="M2 -20 L14 -6 L2 -6 Z" fill="#e7e5e4" opacity="0.8" />
        </g>
        {/* rong biển */}
        {[150, 205, 285].map((x) => (
          <path key={x} d={`M${x} 272 q -6 -10 0 -20 q 6 -10 0 -20`} stroke="#15803d" strokeWidth="3" fill="none" className={running ? "anim-sway" : undefined} style={{ transformOrigin: `${x}px 272px` }} />
        ))}
        {/* vỏ sò */}
        <path d="M262 272 a 7 7 0 0 1 14 0 Z" fill="#fda4af" />
        <circle cx="128" cy="250" r="3" fill="#fda4af" />
      </g>

      {/* nước biển */}
      {!empty && (
        <g clipPath="url(#sea-basin)">
          <rect x="80" y={waterY} width="230" height={300 - waterY} fill="url(#sea-water)" opacity="0.9" />
          <path
            className={running ? "anim-shimmer" : undefined}
            d={`M80 ${waterY} q 12 -5 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0`}
            fill="none"
            stroke="#ecfeff"
            strokeWidth="3"
          />
          {/* sóng nhỏ chạy ngang dưới mặt nước */}
          {waterY < 250 && (
            <path
              className="anim-wave-slow"
              d={`M80 ${waterY + 16} ${Array.from({ length: 10 }, () => "q 12 -4 24 0 t 24 0").join(" ")}`}
              fill="none"
              stroke="#a5f3fc"
              strokeWidth="2"
              opacity="0.5"
            />
          )}
          {/* cá bơi */}
          {waterY < 240 && (
            <g transform={`translate(210 ${Math.max(waterY + 22, 200)})`}>
              <ellipse rx="10" ry="6" fill="#fb923c" />
              <path d="M9 0 L17 -6 L17 6 Z" fill="#fb923c" />
              <circle cx="-5" cy="-1.5" r="1.5" fill="#1f2937" />
            </g>
          )}
        </g>
      )}

      {/* cá và cua mắc cạn khi gần hết nước */}
      {p > 0.85 && (
        <g>
          <g transform="translate(225 276) rotate(-15)">
            <g className={running || empty ? "anim-wobble-fast" : undefined} style={{ transformOrigin: "0px 0px" }}>
              <ellipse rx="10" ry="6" fill="#fb923c" />
              <path d="M9 0 L17 -6 L17 6 Z" fill="#fb923c" />
              <circle cx="-5" cy="-1.5" r="1.5" fill="#1f2937" />
            </g>
          </g>
          <g transform="translate(158 270)">
            <ellipse rx="9" ry="6" fill="#ef4444" />
            <path d="M-8 -3 l-6 -6 M8 -3 l6 -6" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            <circle cx="-3" cy="-6" r="1.6" fill="#1f2937" />
            <circle cx="3" cy="-6" r="1.6" fill="#1f2937" />
          </g>
        </g>
      )}

      {/* thuyền */}
      <g transform={`translate(${boatX} ${boatY}) rotate(${empty ? 14 : 0})`}>
        <g className={running && !empty ? "anim-bob" : undefined}>
          <path d="M-22 -6 L22 -6 L15 4 L-15 4 Z" fill="#b45309" />
          <line x1="0" y1="-6" x2="0" y2="-30" stroke="#78350f" strokeWidth="2.5" />
          <path d="M2 -28 L18 -10 L2 -10 Z" fill="white" />
        </g>
      </g>

      {/* bờ đất bên trái */}
      <path d={`M0 ${BANK} L100 ${BANK} Q112 215 138 258 L138 300 L0 300 Z`} fill="#a16207" />
      <rect x="0" y={BANK - 4} width="102" height="6" rx="3" fill="#65a30d" />

      {/* gàu sòng và dây */}
      <g className={running && !empty ? "anim-scoop" : undefined} style={{ transformOrigin: `${(husbandHand[0] + wifeHand[0]) / 2}px ${husbandHand[1]}px` }}>
        <line x1={husbandHand[0]} y1={husbandHand[1]} x2={bucketX - 8} y2={bucketY - 6} stroke="#78350f" strokeWidth="1.8" />
        <line x1={wifeHand[0]} y1={wifeHand[1]} x2={bucketX + 8} y2={bucketY - 6} stroke="#78350f" strokeWidth="1.8" />
        <path d={`M${bucketX - 11} ${bucketY - 7} L${bucketX + 11} ${bucketY - 7} L${bucketX + 6} ${bucketY + 6} L${bucketX - 6} ${bucketY + 6} Z`} fill="#ca8a04" stroke="#78350f" strokeWidth="1.5" />
      </g>

      {/* nước hắt lên bờ */}
      {running && !empty && (
        <g>
          {[0, 0.35, 0.7].map((d) => (
            <g key={d} className="anim-splash-x" style={{ animationDelay: `${d}s` }}>
              <circle className="anim-fly-y" style={{ animationDelay: `${d}s` }} cx="110" cy="100" r="3.5" fill="#22d3ee" />
            </g>
          ))}
        </g>
      )}

      <Person x={36} shirt="#2563eb" pants="#1e3a8a" />
      <Person x={78} shirt="#ec4899" pants="#1f2937" wife />
      {/* tim nhỏ giữa hai vợ chồng */}
      <path d="M57 74 c -4 -5 -10 0 -5 5 l5 5 l5 -5 c 5 -5 -1 -10 -5 -5 Z" fill="#f43f5e" className="anim-bob" />

      {empty && (
        <text x="200" y="200" textAnchor="middle" fontSize="20" fontWeight="800" fill="#b45309">
          Cạn rồi!
        </text>
      )}
    </svg>
  );
}
