"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  emoji: string;
  title: string;
  /** Gọi mỗi khi một quả pháo hoa nổ (để phát tiếng nổ) */
  onBurst?: () => void;
};

/** Thời gian bắn pháo hoa (tính theo khung hình, nên tab bị ẩn thì quay lại vẫn xem đủ) */
const SHOW_MS = 6500;
const BANNER_MS = 4500;

type Rocket = { x: number; y: number; vy: number; targetY: number; hue: number };
type Particle = { x: number; y: number; px: number; py: number; vx: number; vy: number; life: number; hue: number; size: number };

/** Pháo hoa vẽ trên canvas phủ toàn màn hình */
function Fireworks({ onBurst }: { onBurst?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const burstRef = useRef(onBurst);
  burstRef.current = onBurst;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];
    let elapsed = 0;
    let nextLaunch = 0;
    let last = performance.now();
    let frame = 0;

    const launch = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      rockets.push({
        x: w * (0.15 + Math.random() * 0.7),
        y: h,
        vy: -(h / 55 + Math.random() * 3),
        targetY: h * (0.15 + Math.random() * 0.3),
        hue: Math.floor(Math.random() * 360),
      });
    };

    const explode = (r: Rocket) => {
      const count = 70 + Math.floor(Math.random() * 40);
      const speed = 3 + Math.random() * 3;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.2;
        const v = speed * (0.5 + Math.random() * 0.6);
        particles.push({
          x: r.x,
          y: r.y,
          px: r.x,
          py: r.y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          life: 1,
          hue: (r.hue + Math.random() * 40 - 20 + 360) % 360,
          size: 2.2 + Math.random() * 2,
        });
      }
      burstRef.current?.();
    };

    const tick = (now: number) => {
      // giới hạn bước thời gian để tab bị ẩn quay lại không nhảy cóc
      const dt = Math.min(50, now - last);
      last = now;
      elapsed += dt;
      const k = dt / 16.7;

      if (elapsed < SHOW_MS && elapsed >= nextLaunch) {
        launch();
        if (Math.random() < 0.35) launch();
        nextLaunch = elapsed + 350 + Math.random() * 350;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy * k;
        ctx.fillStyle = `hsl(${r.hue} 100% 75%)`;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // vệt đuôi tên lửa
        ctx.strokeStyle = `hsl(${r.hue} 100% 70% / 0.5)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x, r.y + 18);
        ctx.stroke();
        if (r.y <= r.targetY) {
          explode(r);
          rockets.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.px = p.x;
        p.py = p.y;
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 0.06 * k;
        p.x += p.vx * k;
        p.y += p.vy * k;
        p.life -= 0.011 * k;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        // màu đậm để nhìn rõ trên cả nền sáng lẫn nền tối
        ctx.strokeStyle = `hsl(${p.hue} 95% ${45 + p.life * 15}% / ${Math.min(1, p.life * 1.3)})`;
        ctx.lineWidth = p.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      if (elapsed < SHOW_MS || rockets.length || particles.length) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-50 h-full w-full" aria-hidden />;
}

const FLOWERS = ["🌸", "🌺", "🌼", "🌷", "💐", "🌹"];
const CONFETTI = ["🎉", "🎊", "✨", "⭐"];

/**
 * Màn ăn mừng khi hoàn thành: pháo hoa, hoa rơi, pháo giấy bắn từ hai góc và băng rôn chúc mừng.
 * Âm thanh do nơi gọi phát (kèn khi hoàn thành, tiếng nổ qua `onBurst`).
 */
export default function Celebration({ emoji, title, onBurst }: Props) {
  const [showBanner, setShowBanner] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    navigator.vibrate?.([180, 80, 180, 80, 320]);
    const id = setTimeout(() => setShowBanner(false), BANNER_MS);
    return () => clearTimeout(id);
  }, []);

  // hoa rơi từ trên xuống, lượn qua lại
  const petals = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 4.5 + Math.random() * 3,
        size: 18 + Math.random() * 20,
        char: i % 6 === 5 ? emoji : FLOWERS[i % FLOWERS.length],
      })),
    [emoji],
  );

  // pháo giấy bắn chéo lên từ hai góc dưới
  const cannons = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => {
        const fromLeft = i % 2 === 0;
        const tx = (fromLeft ? 1 : -1) * (15 + Math.random() * 35);
        return {
          fromLeft,
          tx: `${tx}vw`,
          ty: `${-(45 + Math.random() * 40)}vh`,
          delay: Math.floor(i / 20) * 1.2 + Math.random() * 0.25,
          duration: 2.6 + Math.random() * 1.2,
          size: 16 + Math.random() * 16,
          char: i % 3 === 0 ? FLOWERS[i % FLOWERS.length] : CONFETTI[i % CONFETTI.length],
        };
      }),
    [],
  );

  return (
    <>
      {!reducedMotion && <Fireworks onBurst={onBurst} />}

      {petals.map((p, i) => (
        <span
          key={`p${i}`}
          className="celebrate-petal"
          style={{ left: `${p.left}vw`, fontSize: p.size, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }}
        >
          {p.char}
        </span>
      ))}

      {cannons.map((c, i) => (
        <span
          key={`c${i}`}
          className="celebrate-cannon"
          style={{
            [c.fromLeft ? "left" : "right"]: "2vw",
            fontSize: c.size,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
            ["--tx" as string]: c.tx,
            ["--ty" as string]: c.ty,
          }}
        >
          {c.char}
        </span>
      ))}

      {showBanner && (
        <div className="pointer-events-none fixed inset-0 z-[55] flex items-center justify-center p-4">
          <div
            className="celebrate-banner pointer-events-auto cursor-pointer rounded-4xl border-4 border-stone-900 bg-yellow-300 px-8 py-5 text-center text-stone-900 shadow-[10px_10px_0_0_#1c1917]"
            onClick={() => setShowBanner(false)}
            role="status"
          >
            <div className="text-5xl">🏆</div>
            <p className="mt-1 text-sm font-bold uppercase tracking-widest">Hoàn thành!</p>
            <p className="text-2xl font-extrabold sm:text-3xl">{title}</p>
          </div>
        </div>
      )}
    </>
  );
}
