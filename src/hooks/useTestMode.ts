"use client";

import { useEffect, useState } from "react";

/**
 * Chế độ test nhanh: thêm `?test=10` vào URL để bộ đếm xong sau 10 giây
 * (bộ quay số thì trúng sau khoảng chừng đó giây). `?test` không kèm số = 10 giây.
 * Trả về số giây, hoặc null nếu không bật.
 */
export function useTestSeconds() {
  const [seconds, setSeconds] = useState<number | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("test")) return;
    const n = Number(params.get("test"));
    setSeconds(Number.isFinite(n) && n >= 1 && n <= 3600 ? Math.round(n) : 10);
  }, []);
  return seconds;
}

/** Nhãn nhỏ nhắc rằng đang ở chế độ test */
export function testBadgeText(seconds: number) {
  return `🧪 Chế độ test: xong sau ~${seconds} giây`;
}
