export type SceneProps = {
  /** Tiến độ từ 0 (vừa bắt đầu) đến 1 (xong) */
  progress: number;
  /** Đang chạy hay không, để bật các hiệu ứng chuyển động */
  running: boolean;
};

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Nội suy màu giữa nhiều mốc màu theo t (0..1) */
export function mixColors(stops: string[], t: number) {
  const x = clamp(t) * (stops.length - 1);
  const i = Math.min(Math.floor(x), stops.length - 2);
  const f = x - i;
  const a = hexToRgb(stops[i]);
  const b = hexToRgb(stops[i + 1]);
  const c = a.map((v, k) => Math.round(lerp(v, b[k], f)));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}
