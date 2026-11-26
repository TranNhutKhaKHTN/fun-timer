"use client";

import { useMemo } from "react";

/** Pháo giấy rơi khi hoàn thành */
export default function Confetti({ emoji }: { emoji: string }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 2.5 + Math.random() * 2,
        size: 18 + Math.random() * 18,
        char: ["🎉", "✨", "⭐", "🎊", emoji][i % 5],
      })),
    [emoji],
  );
  return (
    <>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti"
          style={{
            left: `${p.left}vw`,
            fontSize: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.char}
        </span>
      ))}
    </>
  );
}
