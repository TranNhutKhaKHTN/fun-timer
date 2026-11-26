"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SCENES } from "./scenes";
import { LEVELS, type TimerTheme } from "@/lib/timers";

const IDLE_PROGRESS = 0.35;
const DEMO_MS = 5000;

/** Thẻ giới thiệu một bộ đếm. Di chuột vào sẽ chạy thử toàn bộ hiệu ứng trong 5 giây. */
export default function PreviewCard({ timer }: { timer: TimerTheme }) {
  const Scene = SCENES[timer.slug];
  const [progress, setProgress] = useState(IDLE_PROGRESS);
  const [hover, setHover] = useState(false);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (!hover) {
      setProgress(IDLE_PROGRESS);
      return;
    }
    const start = performance.now();
    const loop = (now: number) => {
      setProgress(((now - start) % (DEMO_MS + 800)) / DEMO_MS);
      frame.current = requestAnimationFrame(loop);
    };
    frame.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame.current);
  }, [hover]);

  return (
    <Link
      href={`/timer/${timer.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group flex flex-col overflow-hidden rounded-3xl border-4 border-stone-900 bg-white shadow-[6px_6px_0_0_#1c1917] transition hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#1c1917]"
    >
      <div className="relative aspect-square w-full" style={{ background: timer.bg }}>
        <span
          className={`absolute left-3 top-3 z-10 rounded-full border-2 border-stone-900 px-2.5 py-0.5 text-xs font-bold ${
            timer.level === "hell" ? "bg-red-600 text-white" : "bg-white/90"
          }`}
        >
          {LEVELS[timer.level].emoji} {LEVELS[timer.level].label}
        </span>
        <Scene progress={Math.min(1, progress)} running={hover} />
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t-4 border-stone-900 p-4">
        <h2 className="text-lg font-extrabold leading-tight">
          {timer.emoji} {timer.title}
        </h2>
        <p className="text-sm text-stone-600">{timer.description}</p>
      </div>
    </Link>
  );
}
