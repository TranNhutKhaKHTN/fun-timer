"use client";

import { useEffect, useState } from "react";
import PreviewCard from "./PreviewCard";
import { LEVELS, LEVEL_KEYS, TIMERS, isLevel, type Level } from "@/lib/timers";

type Filter = Level | "all";

const PARAM = "che-do";

/** Danh sách bộ đếm kèm thanh lọc theo chế độ. Chế độ đang chọn được giữ trên URL (?che-do=...) để chia sẻ được. */
export default function TimerGallery() {
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get(PARAM);
    if (isLevel(v)) setFilter(v);
  }, []);

  const choose = (f: Filter) => {
    setFilter(f);
    const url = new URL(window.location.href);
    if (f === "all") url.searchParams.delete(PARAM);
    else url.searchParams.set(PARAM, f);
    window.history.replaceState(null, "", url);
  };

  const shown = filter === "all" ? TIMERS : TIMERS.filter((t) => t.level === filter);
  const chips: { id: Filter; label: string; emoji: string; count: number }[] = [
    { id: "all", label: "Tất cả", emoji: "✨", count: TIMERS.length },
    ...LEVEL_KEYS.map((id) => ({
      id,
      label: LEVELS[id].label,
      emoji: LEVELS[id].emoji,
      count: TIMERS.filter((t) => t.level === id).length,
    })),
  ];

  return (
    <>
      <nav aria-label="Lọc theo chế độ" className="mb-8 flex flex-wrap justify-center gap-2">
        {chips.map((c) => {
          const active = filter === c.id;
          const activeBg = c.id === "hell" ? "bg-red-600" : "bg-stone-900";
          return (
            <button
              key={c.id}
              onClick={() => choose(c.id)}
              aria-pressed={active}
              className={`rounded-full border-2 border-stone-900 px-4 py-1.5 font-bold transition ${
                active
                  ? `${activeBg} text-white`
                  : "bg-white text-stone-900 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#1c1917]"
              }`}
            >
              {c.emoji} {c.label}
              <span className={`ml-1.5 text-sm ${active ? "text-white/70" : "text-stone-500"}`}>{c.count}</span>
            </button>
          );
        })}
      </nav>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((t) => (
          <PreviewCard key={t.slug} timer={t} />
        ))}
      </section>
    </>
  );
}
