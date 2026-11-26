export function formatTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function isDarkColor(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45;
}

/** Tạo AudioContext trong lúc người dùng bấm nút để trình duyệt cho phép phát âm thanh về sau. */
export function unlockAudio(current: AudioContext | null) {
  let ctx = current;
  if (!ctx && typeof window !== "undefined" && "AudioContext" in window) ctx = new AudioContext();
  ctx?.resume();
  return ctx;
}

function tone(ctx: AudioContext, freq: number, at: number, dur: number, type: OscillatorType, peak: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

/**
 * Kèn chiến thắng "ta-da" khi hoàn thành: chạy nốt nhanh lên rồi ngân một hợp âm Đô trưởng.
 * Tạo bằng Web Audio nên không cần file âm thanh.
 */
export function playFanfare(ctx: AudioContext | null) {
  if (!ctx) return;
  ctx.resume();
  const t = ctx.currentTime + 0.05;
  // G4 C5 E5 G5 chạy nhanh
  [392, 523.25, 659.25, 783.99].forEach((f, i) => {
    tone(ctx, f, t + i * 0.11, 0.18, "square", 0.07);
    tone(ctx, f, t + i * 0.11, 0.2, "triangle", 0.18);
  });
  // "ta" ngắn rồi "da" ngân dài
  const hit = t + 0.5;
  [523.25, 659.25, 783.99].forEach((f) => tone(ctx, f, hit, 0.15, "triangle", 0.12));
  const chord = hit + 0.2;
  [523.25, 659.25, 783.99, 1046.5].forEach((f) => {
    tone(ctx, f, chord, 1.4, "triangle", 0.12);
    tone(ctx, f * 1.003, chord, 1.2, "square", 0.025);
  });
  // tiếng chuông lấp lánh phía trên
  [2093, 2637, 3136, 2637, 3136].forEach((f, i) => tone(ctx, f, chord + 0.15 + i * 0.09, 0.3, "sine", 0.05));
}

let noiseBuffer: AudioBuffer | null = null;

/** Tiếng một quả pháo hoa nổ: "bùm" trầm + tiếng lách tách */
export function playFirework(ctx: AudioContext | null) {
  if (!ctx || ctx.state !== "running") return;
  const t = ctx.currentTime;

  // bùm: sóng sin trầm tụt nhanh
  const boom = ctx.createOscillator();
  const boomGain = ctx.createGain();
  boom.frequency.setValueAtTime(140, t);
  boom.frequency.exponentialRampToValueAtTime(40, t + 0.35);
  boomGain.gain.setValueAtTime(0.25, t);
  boomGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  boom.connect(boomGain).connect(ctx.destination);
  boom.start(t);
  boom.stop(t + 0.45);

  // lách tách: tiếng ồn trắng lọc dải cao, tắt dần
  if (!noiseBuffer || noiseBuffer.sampleRate !== ctx.sampleRate) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (Math.random() < 0.08 ? 1 : 0.25);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2500 + Math.random() * 2000;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.18, t + 0.02);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
  noise.connect(filter).connect(noiseGain).connect(ctx.destination);
  noise.start(t + 0.02);
  noise.stop(t + 0.8);
}
