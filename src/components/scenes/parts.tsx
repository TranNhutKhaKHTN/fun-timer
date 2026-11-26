/** Các chi tiết nhỏ dùng chung giữa các cảnh để tăng độ sinh động */

/** Chim bay ngang qua cảnh, vỗ cánh */
export function Bird({ y, delay = 0, color = "#1f2937", scale = 1 }: { y: number; delay?: number; color?: string; scale?: number }) {
  return (
    <g className="anim-bird" style={{ animationDelay: `${delay}s` }}>
      <g transform={`translate(0 ${y}) scale(${scale})`}>
        <path
          className="anim-flap"
          d="M-8 0 Q-4 -5 0 0 Q4 -5 8 0"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          style={{ animationDelay: `${delay / 3}s` }}
        />
      </g>
    </g>
  );
}

/** Ngôi sao lấp lánh 4 cánh */
export function Sparkle({ x, y, size = 8, delay = 0, color = "#fde047" }: { x: number; y: number; size?: number; delay?: number; color?: string }) {
  const s = size;
  return (
    <path
      className="anim-sparkle"
      style={{ animationDelay: `${delay}s` }}
      d={`M${x} ${y - s} Q${x + s * 0.15} ${y - s * 0.15} ${x + s} ${y} Q${x + s * 0.15} ${y + s * 0.15} ${x} ${y + s} Q${x - s * 0.15} ${y + s * 0.15} ${x - s} ${y} Q${x - s * 0.15} ${y - s * 0.15} ${x} ${y - s} Z`}
      fill={color}
    />
  );
}
