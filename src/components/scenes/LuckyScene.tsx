import { SceneProps, clamp } from "./utils";

type LuckyProps = SceneProps & {
  /** Số đang hiện trên máy; bỏ trống thì tự sinh theo progress (dùng cho thẻ xem trước) */
  value?: number | null;
  /** Con số người dùng chọn */
  target?: number | null;
  /** Đã quay trúng */
  won?: boolean;
  /** Đang quay (ô số nhảy loạn) */
  spinning?: boolean;
  /** Số ô số trên máy */
  digits?: number;
};

const fmt = (n: number) => n.toLocaleString("vi-VN");
const PREVIEW_TARGET = 777;

function previewValue(p: number) {
  // Số giả ngẫu nhiên thay đổi theo progress để thẻ xem trước trông như đang quay
  return Math.floor(((Math.sin(Math.floor(p * 40) * 12.9898) * 43758.5453) % 1 + 1) % 1 * 999) + 1;
}

export default function LuckyScene({ progress, running, value, target, won, spinning, digits: digitCount = 4 }: LuckyProps) {
  const p = clamp(progress);
  const isPreview = value === undefined;
  const shownTarget = isPreview ? PREVIEW_TARGET : target;
  const isWon = isPreview ? p >= 1 : !!won;
  const shown = isPreview ? (isWon ? PREVIEW_TARGET : previewValue(p)) : value;
  const digits = shown == null ? "?".repeat(digitCount) : String(shown).padStart(digitCount, "0").slice(-digitCount);
  // Chia đều các ô số trong khung cửa sổ rộng 172
  const gap = digitCount > 6 ? 3 : 6;
  const boxW = (172 - 12 - gap * (digitCount - 1)) / digitCount;
  const fontSize = Math.min(38, boxW * 1.25);
  const lit = running || isWon;

  return (
    <svg viewBox="0 0 300 300" className="h-full w-full">
      <defs>
        <linearGradient id="lucky-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f43f5e" />
          <stop offset="1" stopColor="#be123c" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill="#ede9fe" />
      {/* tia sáng phía sau khi trúng */}
      {isWon && (
        <g className="anim-spin-slow" style={{ transformOrigin: "150px 140px" }} opacity="0.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <path key={i} d="M150 140 L140 -40 L160 -40 Z" fill="#fde047" transform={`rotate(${i * 30} 150 140)`} />
          ))}
        </g>
      )}

      {/* bảng đèn trên nóc */}
      <rect x="62" y="34" width="176" height="40" rx="14" fill="#7c3aed" stroke="#1c1917" strokeWidth="4" />
      <text x="150" y="61" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fde047" letterSpacing="2">
        {isWon ? "TRÚNG RỒI!" : "QUAY SỐ"}
      </text>
      {Array.from({ length: 8 }).map((_, i) => (
        <circle
          key={i}
          cx={74 + i * 22}
          cy="34"
          r="4"
          fill={i % 2 ? "#fde047" : "#f9fafb"}
          stroke="#1c1917"
          strokeWidth="1.5"
          className={lit ? "anim-chase" : undefined}
          style={{ animationDelay: `${(i % 2) * 0.45}s` }}
        />
      ))}

      {/* thân máy */}
      <rect x="50" y="74" width="200" height="170" rx="22" fill="url(#lucky-body)" stroke="#1c1917" strokeWidth="4" />
      <rect x="64" y="96" width="172" height="74" rx="12" fill="#1c1917" />

      {/* các ô số */}
      {digits.split("").map((d, i) => (
        <g key={i} className={spinning ? "anim-reel" : undefined} style={{ animationDelay: `${i * 0.05}s` }}>
          <rect x={70 + i * (boxW + gap)} y="104" width={boxW} height="58" rx={Math.min(6, boxW / 4)} fill={isWon ? "#bbf7d0" : "#fff"} />
          <text
            x={70 + i * (boxW + gap) + boxW / 2}
            y={133 + fontSize * 0.35}
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight="800"
            fill={isWon ? "#15803d" : "#1c1917"}
            opacity={spinning ? 0.6 : 1}
          >
            {d}
          </text>
        </g>
      ))}

      {/* số của bạn */}
      <rect x="78" y="184" width="144" height="40" rx="10" fill="#fff1f2" stroke="#1c1917" strokeWidth="3" />
      <text x="150" y="200" textAnchor="middle" fontSize="10" fontWeight="700" fill="#9f1239">
        SỐ CỦA BẠN
      </text>
      <text x="150" y="218" textAnchor="middle" fontSize="16" fontWeight="800" fill="#1c1917" letterSpacing="1">
        {shownTarget == null ? "????" : fmt(shownTarget)}
      </text>

      {/* cần gạt */}
      <g className={spinning ? "anim-lever" : undefined} style={{ transformOrigin: "262px 170px" }}>
        <rect x="258" y="110" width="8" height="62" rx="4" fill="#94a3b8" stroke="#1c1917" strokeWidth="2" />
        <circle cx="262" cy="106" r="12" fill="#facc15" stroke="#1c1917" strokeWidth="3" />
      </g>
      <rect x="248" y="160" width="20" height="20" rx="5" fill="#64748b" stroke="#1c1917" strokeWidth="3" />

      {/* chân máy và đồng xu */}
      <rect x="70" y="244" width="160" height="22" rx="6" fill="#7c3aed" stroke="#1c1917" strokeWidth="4" />
      {isWon &&
        [
          [90, 270],
          [130, 282],
          [175, 274],
          [212, 284],
        ].map(([x, y], i) => (
          <g key={i} className="anim-pop" style={{ animationDelay: `${i * 0.1}s` }}>
            <circle cx={x} cy={y} r="10" fill="#facc15" stroke="#a16207" strokeWidth="2" />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#a16207">
              $
            </text>
          </g>
        ))}
    </svg>
  );
}
