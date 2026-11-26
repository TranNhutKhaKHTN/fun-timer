"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Celebration from "./Celebration";
import ExitDialog from "./ExitDialog";
import { SCENES } from "./scenes";
import { useExitGuard } from "@/hooks/useExitGuard";
import { trackEvent } from "@/lib/analytics";
import { testBadgeText, useTestSeconds } from "@/hooks/useTestMode";
import { formatTime, isDarkColor, playFanfare, playFirework, unlockAudio } from "@/lib/timer-utils";
import { LEVELS, LEVEL_KEYS, getTimer, type Level } from "@/lib/timers";

type Status = "idle" | "running" | "paused" | "done";

function randomDuration(level: Level) {
  const { minH, maxH } = LEVELS[level];
  const minutes = minH * 60 + Math.floor(Math.random() * ((maxH - minH) * 60 + 1));
  return minutes * 60;
}

const DEFAULT_DURATION = 60 * 60;

export default function TimerRunner({ slug }: { slug: string }) {
  const timer = getTimer(slug)!;
  const Scene = SCENES[slug];
  const dark = isDarkColor(timer.bg);

  const [level, setLevel] = useState<Level>(timer.level);
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [status, setStatus] = useState<Status>("idle");
  const [endAt, setEndAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(DEFAULT_DURATION * 1000);
  const [now, setNow] = useState(0);
  const audioRef = useRef<AudioContext | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const testSeconds = useTestSeconds();

  // Đang có lượt dở dang thì thoát phải xác nhận; thoát là mất tiến độ (không lưu lại)
  const inProgress = status === "running" || status === "paused";
  const { exitPrompt, exitTo } = useExitGuard(inProgress);


  // Đồng hồ chạy
  useEffect(() => {
    if (status !== "running") return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [status]);

  const leftMs = status === "running" && endAt ? Math.max(0, endAt - now) : remaining;
  const totalMs = duration * 1000;
  const elapsedMs = Math.min(totalMs, Math.max(0, totalMs - leftMs));
  const progress = Math.min(1, Math.max(0, elapsedMs / totalMs));

  // Hết giờ
  useEffect(() => {
    if (status === "running" && endAt && now >= endAt) {
      setStatus("done");
      setRemaining(0);
      setEndAt(null);
      playFanfare(audioRef.current);
      trackEvent("timer_complete", { timer: slug, level, minutes: Math.round(duration / 60) });
    }
  }, [status, endAt, now, slug, level, duration]);

  // Tiêu đề tab hiển thị thời gian còn lại
  useEffect(() => {
    const original = document.title;
    if (status === "running" || status === "paused") {
      document.title = `${status === "paused" ? "⏸ " : ""}${formatTime(elapsedMs)} · ${timer.short}`;
    } else if (status === "done") {
      document.title = `✅ Xong! · ${timer.short}`;
    }
    return () => {
      document.title = original;
    };
  }, [status, elapsedMs, timer.short]);

  const start = useCallback(() => {
    audioRef.current = unlockAudio(audioRef.current);
    let base = remaining;
    if (status !== "paused") {
      // Lượt mới: bốc thăm thời gian tập trung, giấu kín không cho xem
      const sec = testSeconds ?? randomDuration(level);
      trackEvent("timer_start", { timer: slug, level, test: testSeconds != null });
      setDuration(sec);
      base = sec * 1000;
    }
    const t = Date.now();
    setNow(t);
    setEndAt(t + base);
    setStatus("running");
  }, [status, remaining, level, testSeconds, slug]);

  const pause = useCallback(() => {
    if (!endAt) return;
    setRemaining(Math.max(0, endAt - Date.now()));
    setEndAt(null);
    setStatus("paused");
  }, [endAt]);

  const reset = useCallback(() => {
    setStatus("idle");
    setEndAt(null);
    setRemaining(duration * 1000);
  }, [duration]);

  const chooseLevel = (l: Level) => {
    setLevel(l);
    reset();
  };

  // Phím tắt: Space để bắt đầu / tạm dừng
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || exitPrompt) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "BUTTON" || tag === "A") return;
      e.preventDefault();
      if (status === "running") pause();
      else start();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, start, pause, exitPrompt]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else stageRef.current?.requestFullscreen?.();
  };

  const milestone =
    status === "idle"
      ? "Chọn chế độ rồi bấm Bắt đầu. Tập trung bao lâu thì... bí mật!"
      : status === "done"
        ? timer.doneMessage
        : timer.milestones[Math.min(timer.milestones.length - 1, Math.floor(progress * timer.milestones.length))];

  const running = status === "running";
  const textMuted = dark ? "text-white/70" : "text-stone-600";

  return (
    <div className="min-h-screen" style={{ background: timer.bg, color: dark ? "#fff" : "#1c1917" }}>
      {status === "done" && (
        <Celebration emoji={timer.emoji} title={timer.doneTitle} onBurst={() => playFirework(audioRef.current)} />
      )}
      {exitPrompt && (
        <ExitDialog
          emoji={timer.emoji}
          accent={timer.accent}
          warning={timer.exitWarning}
          elapsed={formatTime(elapsedMs)}
          onStay={exitPrompt.stay}
          onLeave={exitPrompt.leave}
        />
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            exitTo("/");
          }}
          className={`text-sm font-semibold hover:underline ${textMuted}`}
        >
          ← Tất cả bộ đếm
        </Link>
        {testSeconds != null && (
          <p className="mt-2 inline-block rounded-full border-2 border-dashed border-stone-900 bg-lime-200 px-3 py-0.5 text-sm font-bold text-stone-900">
            {testBadgeText(testSeconds)}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-5xl">
          {timer.emoji} {status === "done" ? timer.doneTitle : timer.title}
        </h1>

        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Sân khấu */}
          <div
            ref={stageRef}
            className="relative mx-auto flex w-full max-w-130 flex-col items-center justify-center overflow-hidden rounded-4xl border-4 border-stone-900 bg-white shadow-[8px_8px_0_0_#1c1917] [&:fullscreen]:max-w-none [&:fullscreen]:rounded-none [&:fullscreen]:border-0"
            style={{ background: timer.bg }}
          >
            <div className="aspect-square w-full in-[:fullscreen]:h-[80vh] in-[:fullscreen]:w-auto">
              <Scene progress={progress} running={running} />
            </div>
            <div className="hidden pb-6 text-6xl font-extrabold tabular-nums in-[:fullscreen]:block" style={{ color: dark ? "#fff" : "#1c1917" }}>
              {formatTime(elapsedMs)}
            </div>
          </div>

          {/* Bảng điều khiển */}
          <div className="flex flex-col gap-6">
            <div>
              <p className={`mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wide ${textMuted}`}>
                {running && <span className="anim-live inline-block h-2.5 w-2.5 rounded-full bg-red-500" />}
                Đã tập trung
              </p>
              <div className="text-7xl font-extrabold tabular-nums leading-none sm:text-8xl">{formatTime(elapsedMs)}</div>
              <div className="mt-4 h-4 w-full overflow-hidden rounded-full border-2 border-stone-900 bg-white">
                <div
                  className={`h-full transition-[width] duration-300 ${running ? "progress-stripes" : ""}`}
                  style={{ width: `${progress * 100}%`, background: timer.accent }}
                />
              </div>
              <p key={milestone} className={`anim-msg-in mt-3 min-h-12 text-lg font-semibold ${dark ? "text-white" : "text-stone-800"}`}>
                💬 {milestone}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {running ? (
                <button onClick={pause} className="btn" style={{ background: "#fde047", color: "#1c1917" }}>
                  ⏸ Tạm dừng
                </button>
              ) : (
                <button onClick={start} className="btn" style={{ background: timer.accent, color: "#fff" }}>
                  {status === "paused" ? "▶ Tiếp tục" : status === "done" ? "🔁 Làm lại" : "▶ Bắt đầu"}
                </button>
              )}
              {status !== "idle" && (
                <button onClick={() => reset()} className="btn bg-white text-stone-900">
                  ↺ Đặt lại
                </button>
              )}
              <button onClick={toggleFullscreen} className="btn bg-white text-stone-900">
                ⛶ Toàn màn hình
              </button>
            </div>

            <div>
              <p className={`mb-2 text-sm font-bold uppercase tracking-wide ${textMuted}`}>Chế độ</p>
              <div className="grid grid-cols-3 gap-2">
                {LEVEL_KEYS.map((key) => {
                  const l = LEVELS[key];
                  const active = level === key;
                  const locked = status === "running" || status === "paused";
                  return (
                    <button
                      key={key}
                      disabled={locked}
                      onClick={() => chooseLevel(key)}
                      className="flex flex-col items-center rounded-2xl border-2 border-stone-900 px-2 py-2 font-bold transition disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        background: active ? (key === "hell" ? "#b91c1c" : timer.accent) : "#fff",
                        color: active ? "#fff" : "#1c1917",
                      }}
                    >
                      <span className="text-2xl">{l.emoji}</span>
                      <span>{l.label}</span>
                      <span className="text-xs font-medium opacity-80">{l.note}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className={`text-sm ${textMuted}`}>
              Tập trung bao lâu là bí mật, cứ tập trung đến khi xong thì thôi! Bấm{" "}
              <kbd className="rounded border border-current px-1">Space</kbd> để bắt đầu / tạm dừng. Thoát giữa chừng là bộ đếm bắt đầu lại từ đầu.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
