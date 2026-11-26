"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Confetti from "./Confetti";
import ExitDialog from "./ExitDialog";
import LuckyScene from "./scenes/LuckyScene";
import { useExitGuard } from "@/hooks/useExitGuard";
import { formatTime, playChime, unlockAudio } from "@/lib/timer-utils";
import { LEVELS, getTimer } from "@/lib/timers";

type Status = "idle" | "running" | "paused" | "done";

/** Mỗi lần quay cách nhau 5 giây */
const ROLL_MS = 5000;
/** Thời gian hiệu ứng ô số nhảy loạn trước khi dừng ở kết quả */
const SPIN_MS = 800;
/** Khoảng số được phép chọn và được quay: từ 1.000 đến dưới 10 tỷ (chế độ Địa ngục) */
const MIN = 1_000;
const MAX = 9_999_999_999;
const DIGITS = String(MAX).length;
const HISTORY_SIZE = 12;
/** Lệch trong khoảng này thì báo "suýt nữa" */
const NEAR_MISS = 10_000_000;

const randInt = () => MIN + Math.floor(Math.random() * (MAX - MIN + 1));
const fmt = (n: number) => n.toLocaleString("vi-VN");
/** Đọc số người dùng nhập, chấp nhận cả dấu chấm/phẩy/khoảng trắng phân cách hàng nghìn */
const parseNumber = (v: string) => (/^[\d.,\s]+$/.test(v.trim()) ? Number(v.replace(/[.,\s]/g, "")) : NaN);

export default function LuckyRunner({ slug }: { slug: string }) {
  const timer = getTimer(slug)!;

  const level = LEVELS[timer.level];
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [target, setTarget] = useState<number | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [elapsedBase, setElapsedBase] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  const [rolls, setRolls] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [closest, setClosest] = useState<{ value: number; diff: number } | null>(null);
  const [display, setDisplay] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [flicker, setFlicker] = useState(0);
  const [celebrate, setCelebrate] = useState(false);

  const audioRef = useRef<AudioContext | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const spinTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const inProgress = status === "running" || status === "paused";
  const { exitPrompt, exitTo } = useExitGuard(inProgress);

  const elapsedMs = elapsedBase + (status === "running" && startedAt ? Math.max(0, now - startedAt) : 0);
  const nextRollPct = status === "idle" ? 0 : (elapsedMs % ROLL_MS) / ROLL_MS;

  // Đồng hồ chạy
  useEffect(() => {
    if (status !== "running") return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [status]);

  // Ô số nhảy loạn trong lúc quay
  useEffect(() => {
    if (!spinning) return;
    const id = setInterval(() => setFlicker(randInt()), 60);
    return () => clearInterval(id);
  }, [spinning]);

  useEffect(() => () => clearTimeout(spinTimeout.current), []);

  // Đến lượt quay: tính theo thời gian đã trôi qua, nên tab bị ẩn lâu cũng không bỏ sót lượt nào
  useEffect(() => {
    if (status !== "running" || target == null) return;
    const due = Math.floor(elapsedMs / ROLL_MS);
    if (due <= rolls) return;

    const results: number[] = [];
    let hit = false;
    for (let i = rolls; i < due && !hit; i++) {
      const r = randInt();
      results.push(r);
      if (r === target) hit = true;
    }
    const last = results[results.length - 1];
    const best = results.reduce((b, v) => (Math.abs(v - target) < Math.abs(b - target) ? v : b), last);

    setRolls(rolls + results.length);
    setHistory((h) => [...results.slice(-HISTORY_SIZE).reverse(), ...h].slice(0, HISTORY_SIZE));
    setClosest((c) => {
      const diff = Math.abs(best - target);
      return !c || diff < c.diff ? { value: best, diff } : c;
    });

    if (hit) {
      // Dừng đồng hồ ngay lúc trúng, hiệu ứng ăn mừng chạy sau khi ô số dừng lại
      setElapsedBase(Math.min(elapsedMs, (rolls + results.length) * ROLL_MS));
      setStartedAt(null);
      setStatus("done");
    }

    setSpinning(true);
    clearTimeout(spinTimeout.current);
    spinTimeout.current = setTimeout(() => {
      setSpinning(false);
      setDisplay(last);
      if (hit) {
        setCelebrate(true);
        playChime(audioRef.current);
      }
    }, SPIN_MS);
  }, [elapsedMs, status, target, rolls]);

  // Tiêu đề tab
  useEffect(() => {
    const original = document.title;
    if (inProgress) {
      document.title = `${status === "paused" ? "⏸ " : "🎰 "}${formatTime(elapsedMs)} · ${timer.short}`;
    } else if (celebrate) {
      document.title = `✅ Trúng rồi! · ${timer.short}`;
    }
    return () => {
      document.title = original;
    };
  }, [inProgress, status, elapsedMs, celebrate, timer.short]);

  const clearRound = () => {
    clearTimeout(spinTimeout.current);
    setElapsedBase(0);
    setStartedAt(null);
    setRolls(0);
    setHistory([]);
    setClosest(null);
    setDisplay(null);
    setSpinning(false);
    setCelebrate(false);
  };

  const start = useCallback(() => {
    if (status === "paused") {
      setStartedAt(Date.now());
      setNow(Date.now());
      setStatus("running");
      return;
    }
    const n = parseNumber(input);
    if (!Number.isInteger(n) || n < MIN || n > MAX) {
      setInputError(`Nhập một số nguyên từ ${fmt(MIN)} đến dưới 10 tỷ nhé!`);
      return;
    }
    audioRef.current = unlockAudio(audioRef.current);
    setInputError("");
    clearRound();
    setTarget(n);
    const t = Date.now();
    setStartedAt(t);
    setNow(t);
    setStatus("running");
  }, [status, input]);

  const pause = useCallback(() => {
    if (!startedAt) return;
    setElapsedBase((b) => b + (Date.now() - startedAt));
    setStartedAt(null);
    setStatus("paused");
  }, [startedAt]);

  const reset = () => {
    clearRound();
    setTarget(null);
    setStatus("idle");
  };

  // Phím tắt: Space để bắt đầu / tạm dừng
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || exitPrompt) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "BUTTON" || tag === "A") return;
      e.preventDefault();
      if (status === "running") pause();
      else if (status !== "done") start();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, start, pause, exitPrompt]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else stageRef.current?.requestFullscreen?.();
  };

  const running = status === "running";
  const won = status === "done";
  const nearMiss = !spinning && display != null && target != null && !won && Math.abs(display - target) <= NEAR_MISS;
  const typed = parseNumber(input);
  const typedValid = Number.isInteger(typed) && typed >= MIN && typed <= MAX;

  const message = celebrate
    ? `Quay ${rolls} lần mới trúng! ${timer.doneMessage}`
    : status === "idle"
      ? "Nhập con số may mắn rồi bấm Bắt đầu. Bao giờ trúng thì... hên xui!"
      : won
        ? "Ơ kìa... hình như sắp có biến!"
        : nearMiss
          ? `Suýt nữa! Chỉ lệch có ${fmt(Math.abs(display! - target!))} thôi 😭`
          : timer.milestones[Math.floor(rolls / 20) % timer.milestones.length];

  return (
    <div className="min-h-screen" style={{ background: timer.bg }}>
      {celebrate && <Confetti emoji={timer.emoji} />}
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
          className="text-sm font-semibold text-stone-600 hover:underline"
        >
          ← Tất cả bộ đếm
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-5xl">
          {timer.emoji} {celebrate ? timer.doneTitle : timer.title}
        </h1>

        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Sân khấu */}
          <div
            ref={stageRef}
            className="relative mx-auto flex w-full max-w-130 flex-col items-center justify-center overflow-hidden rounded-4xl border-4 border-stone-900 shadow-[8px_8px_0_0_#1c1917] [&:fullscreen]:max-w-none [&:fullscreen]:rounded-none [&:fullscreen]:border-0"
            style={{ background: timer.bg }}
          >
            <div className="aspect-square w-full in-[:fullscreen]:h-[80vh] in-[:fullscreen]:w-auto">
              <LuckyScene
                progress={0}
                running={running}
                value={spinning ? flicker : display}
                target={target ?? (typedValid ? typed : null)}
                digits={DIGITS}
                won={celebrate}
                spinning={spinning}
              />
            </div>
            <div className="hidden pb-6 text-6xl font-extrabold tabular-nums in-[:fullscreen]:block">{formatTime(elapsedMs)}</div>
          </div>

          {/* Bảng điều khiển */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-1 text-sm font-bold uppercase tracking-wide text-stone-600">Đã tập trung</p>
              <div className="text-7xl font-extrabold tabular-nums leading-none sm:text-8xl">{formatTime(elapsedMs)}</div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border-2 border-stone-900 bg-white px-4 py-2">
                  <p className="text-xs font-bold uppercase text-stone-500">Số lần quay</p>
                  <p className="text-2xl font-extrabold tabular-nums">{rolls}</p>
                </div>
                <div className="rounded-2xl border-2 border-stone-900 bg-white px-4 py-2">
                  <p className="text-xs font-bold uppercase text-stone-500">Gần trúng nhất</p>
                  <p className="text-2xl font-extrabold tabular-nums">
                    {closest ? (
                      <>
                        <span className="text-xl">{fmt(closest.value)}</span>{" "}
                        <span className="block text-sm font-semibold text-stone-500">lệch {fmt(closest.diff)}</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
              </div>

              {/* thanh chờ lượt quay tiếp theo */}
              {inProgress && (
                <div className="mt-3">
                  <p className="mb-1 text-xs font-bold uppercase text-stone-500">Lượt quay tiếp theo</p>
                  <div className="h-3 w-full overflow-hidden rounded-full border-2 border-stone-900 bg-white">
                    <div className="h-full" style={{ width: `${nextRollPct * 100}%`, background: timer.accent }} />
                  </div>
                </div>
              )}

              <p className="mt-3 min-h-12 text-lg font-semibold text-stone-800">💬 {message}</p>

              {history.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {history.map((n, i) => (
                    <span
                      key={`${rolls}-${i}`}
                      className={`rounded-lg border-2 border-stone-900 px-2 py-0.5 text-sm font-bold tabular-nums ${
                        n === target ? "bg-green-300" : i === 0 ? "bg-yellow-200" : "bg-white text-stone-500"
                      }`}
                    >
                      {fmt(n)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* nhập số */}
            <div>
              <label htmlFor="lucky-number" className="mb-2 block text-sm font-bold uppercase tracking-wide text-stone-600">
                Con số may mắn của bạn ({fmt(MIN)} – dưới 10 tỷ)
              </label>
              <div className="flex gap-2">
                <input
                  id="lucky-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={status === "idle" ? input : target != null ? fmt(target) : ""}
                  disabled={status !== "idle"}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setInputError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") start();
                  }}
                  placeholder="Ví dụ: 1.234.567"
                  className={`w-64 rounded-xl border-2 border-stone-900 bg-white px-3 py-2 text-xl font-extrabold tabular-nums disabled:opacity-60 ${
                    inputError ? "anim-shake border-red-600" : ""
                  }`}
                />
                <button
                  type="button"
                  disabled={status !== "idle"}
                  onClick={() => {
                    setInput(fmt(randInt()));
                    setInputError("");
                  }}
                  className="rounded-xl border-2 border-stone-900 bg-white px-3 py-2 font-bold disabled:opacity-50"
                >
                  🎲 Chọn giùm
                </button>
              </div>
              {inputError && <p className="mt-1 text-sm font-bold text-red-600">{inputError}</p>}
            </div>

            <div className="flex flex-wrap gap-3">
              {running ? (
                <button onClick={pause} className="btn" style={{ background: "#fde047", color: "#1c1917" }}>
                  ⏸ Tạm dừng
                </button>
              ) : won ? (
                <button onClick={reset} className="btn" style={{ background: timer.accent, color: "#fff" }}>
                  🔁 Chơi lại
                </button>
              ) : (
                <button onClick={start} className="btn" style={{ background: timer.accent, color: "#fff" }}>
                  {status === "paused" ? "▶ Tiếp tục" : "▶ Bắt đầu"}
                </button>
              )}
              {inProgress && (
                <button onClick={reset} className="btn bg-white text-stone-900">
                  ↺ Đặt lại
                </button>
              )}
              <button onClick={toggleFullscreen} className="btn bg-white text-stone-900">
                ⛶ Toàn màn hình
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border-2 border-stone-900 bg-red-600 px-4 py-3 text-white">
              <span className="text-3xl">{level.emoji}</span>
              <div>
                <p className="font-extrabold">Chế độ {level.label}</p>
                <p className="text-sm text-white/80">Gần 10 tỷ con số, trúng được là chuyện thần kỳ!</p>
              </div>
            </div>

            <p className="text-sm text-stone-600">
              Cứ mỗi 5 giây máy quay một lần, ra đúng số của bạn thì xong. Bấm{" "}
              <kbd className="rounded border border-current px-1">Space</kbd> để bắt đầu / tạm dừng. Thoát giữa chừng là mất hết lượt quay.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
