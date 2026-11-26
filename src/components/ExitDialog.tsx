"use client";

import { useEffect, useRef } from "react";

type Props = {
  emoji: string;
  accent: string;
  /** Câu cảnh báo riêng của từng bộ đếm */
  warning: string;
  /** Thời gian đã tập trung, đã định dạng sẵn */
  elapsed: string;
  onStay: () => void;
  onLeave: () => void;
};

/** Popup hỏi lại trước khi thoát giữa chừng. Esc hoặc bấm ra ngoài = ở lại. */
export default function ExitDialog({ emoji, accent, warning, elapsed, onStay, onLeave }: Props) {
  const stayRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    stayRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onStay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStay]);

  return (
    <div
      className="dialog-backdrop fixed inset-0 z-60 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm"
      onClick={onStay}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="exit-title"
        aria-describedby="exit-desc"
        onClick={(e) => e.stopPropagation()}
        className="dialog-pop relative w-full max-w-md rounded-4xl border-4 border-stone-900 bg-white p-6 text-center text-stone-900 shadow-[10px_10px_0_0_#1c1917] sm:p-8"
      >
        <div className="relative mx-auto -mt-16 mb-2 flex h-24 w-24 items-center justify-center rounded-full border-4 border-stone-900 text-5xl shadow-[4px_4px_0_0_#1c1917]" style={{ background: accent }}>
          <span className="dialog-shake inline-block">{emoji}</span>
          <span className="absolute -right-2 -top-2 rotate-12 text-3xl">😱</span>
        </div>

        <h2 id="exit-title" className="text-3xl font-extrabold">
          Khoan đã!
        </h2>
        <p id="exit-desc" className="mt-2 text-lg font-semibold text-stone-700">
          {warning}
        </p>

        <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-stone-900 bg-amber-50 px-4 py-2">
          <span className="text-sm font-bold text-stone-600">Bạn đã tập trung</span>
          <span className="text-2xl font-extrabold tabular-nums">{elapsed}</span>
        </div>
        <p className="mt-2 text-sm text-stone-500">Thoát bây giờ là mất hết và phải làm lại từ đầu.</p>

        <div className="mt-6 flex flex-col gap-3">
          <button ref={stayRef} onClick={onStay} className="btn w-full text-white" style={{ background: accent }}>
            💪 Ở lại tập trung tiếp
          </button>
          <button onClick={onLeave} className="w-full rounded-2xl py-2 font-bold text-stone-500 underline-offset-4 hover:text-red-600 hover:underline">
            Thoát & làm lại từ đầu
          </button>
        </div>
      </div>
    </div>
  );
}
