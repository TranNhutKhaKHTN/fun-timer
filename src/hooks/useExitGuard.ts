"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type ExitPrompt = { stay: () => void; leave: () => void };

/**
 * Chặn việc thoát trang khi đang có lượt dở dang (đang chạy hoặc tạm dừng):
 * - Đóng tab / tải lại: hộp xác nhận mặc định của trình duyệt.
 * - Nút Back của trình duyệt và link trong trang (`exitTo`): mở popup riêng qua `exitPrompt`.
 * Thoát là mất tiến độ, không lưu lại.
 */
export function useExitGuard(inProgress: boolean) {
  const router = useRouter();
  const exitingRef = useRef(false);
  const [exitPrompt, setExitPrompt] = useState<ExitPrompt | null>(null);

  // Đóng tab / tải lại trang
  useEffect(() => {
    if (!inProgress) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [inProgress]);

  // Nút Back: chèn một mốc lịch sử để chặn lại và hỏi xác nhận
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

  return { exitPrompt, exitTo };
}
