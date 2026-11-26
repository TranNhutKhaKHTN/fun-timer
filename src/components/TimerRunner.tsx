"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ExitDialog from "./ExitDialog";
import { SCENES } from "./scenes";
import { LEVELS, LEVEL_KEYS, getTimer, type Level } from "@/lib/timers";

type Status = "idle" | "running" | "paused" | "done";

function randomDuration(level: Level) {
  const { minH, maxH } = LEVELS[level];
  const minutes = minH * 60 + Math.floor(Math.random() * ((maxH - minH) * 60 + 1));
  return minutes * 60;
}

const DEFAULT_DURATION = 60 * 60;

function formatTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function isDarkColor(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45;
}

/** Tiếng "ting ting ting" khi hoàn thành, tạo bằng Web Audio nên không cần file âm thanh. */
function playChime(ctx: AudioContext | null) {
  if (!ctx) return;
  const notes = [659.25, 783.99, 1046.5, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime + i * 0.18;
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.55);
  });
}

function Confetti({ emoji }: { emoji: string }) {
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

  const router = useRouter();
  const exitingRef = useRef(false);
  /** Popup xác nhận thoát đang mở: lưu lại việc cần làm khi chọn ở lại / thoát */
  const [exitPrompt, setExitPrompt] = useState<{ stay: () => void; leave: () => void } | null>(null);
  // Đang có lượt dở dang thì thoát phải xác nhận; thoát là mất tiến độ (không lưu lại)
  const inProgress = status === "running" || status === "paused";

  // Dọn dữ liệu cũ từ phiên bản trước (từng lưu tiến độ vào localStorage)
  useEffect(() => {
    try {
      localStorage.removeItem(`fun-timer:${slug}`);
    } catch {
      // bỏ qua
    }
  }, [slug]);

  // Đóng tab / tải lại trang: trình duyệt hiện hộp xác nhận mặc định
  useEffect(() => {
    if (!inProgress) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [inProgress]);

  // Nút Back của trình duyệt: chèn một mốc lịch sử để chặn lại và hỏi xác nhận
  useEffect(() => {
    if (!inProgress) return;
    const pushGuard = () => window.history.pushState(window.history.state, "", window.location.href);
    pushGuard();
    let guardActive = true;
    let leaving = false;
    const onPopState = () => {
      if (leaving || !guardActive) return;
      // Mốc chặn vừa bị Back gỡ đi; hỏi người dùng
      guardActive = false;
      setExitPrompt({
        stay: () => {
          pushGuard();
          guardActive = true;
          setExitPrompt(null);
        },
        leave: () => {
          leaving = true;
          setExitPrompt(null);
          window.history.back();
        },
      });
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      // Lượt đã xong / đặt lại mà chưa thoát: gỡ mốc lịch sử đã chèn
      if (guardActive && !leaving && !exitingRef.current) window.history.back();
    };
  }, [inProgress]);

  // Lượt kết thúc trong lúc popup đang mở thì đóng popup
  useEffect(() => {
    if (!inProgress) setExitPrompt(null);
  }, [inProgress]);

  const exitTo = (href: string) => {
    if (!inProgress) return router.push(href);
    setExitPrompt({
      stay: () => setExitPrompt(null),
      leave: () => {
        // Thay thế mốc lịch sử đã chèn để không để lại trang thừa trong lịch sử
        exitingRef.current = true;
        setExitPrompt(null);
        router.replace(href);
      },
    });
  };

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
      playChime(audioRef.current);
    }
  }, [status, endAt, now]);

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
    // Tạo AudioContext trong lúc người dùng bấm để trình duyệt cho phép phát âm thanh
    if (!audioRef.current && typeof window !== "undefined" && "AudioContext" in window) {
      audioRef.current = new AudioContext();
    }
    audioRef.current?.resume();
    let base = remaining;
    if (status !== "paused") {
      // Lượt mới: bốc thăm thời gian tập trung, giấu kín không cho xem
      const sec = randomDuration(level);
      setDuration(sec);
      base = sec * 1000;
    }
    const t = Date.now();
    setNow(t);
    setEndAt(t + base);
    setStatus("running");
  }, [status, remaining, level]);

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
      {status === "done" && <Confetti emoji={timer.emoji} />}
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
              <p className={`mb-1 text-sm font-bold uppercase tracking-wide ${textMuted}`}>Đã tập trung</p>
              <div className="text-7xl font-extrabold tabular-nums leading-none sm:text-8xl">{formatTime(elapsedMs)}</div>
              <div className="mt-4 h-4 w-full overflow-hidden rounded-full border-2 border-stone-900 bg-white">
                <div
                  className="h-full transition-[width] duration-300"
                  style={{ width: `${progress * 100}%`, background: timer.accent }}
                />
              </div>
              <p className={`mt-3 min-h-12 text-lg font-semibold ${dark ? "text-white" : "text-stone-800"}`}>
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
