/**
 * Google Analytics 4.
 * Mã đo lường có thể đổi qua biến môi trường NEXT_PUBLIC_GA_ID.
 * Chỉ bật khi build production để số liệu không bị lẫn lượt truy cập lúc dev.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-D783R652BG";
export const GA_ENABLED = process.env.NODE_ENV === "production" && GA_ID !== "";

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: GtagParams) => void;
  }
}

/** Gửi một sự kiện tuỳ chỉnh lên GA (không làm gì nếu GA chưa bật/chưa tải xong) */
export function trackEvent(name: string, params?: GtagParams) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}
