import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import Script from "next/script";
import { GA_ENABLED, GA_ID } from "@/lib/analytics";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Tập Trung Cho Đến Khi... | Bộ đếm giờ vui nhộn",
  description:
    "Bộ sưu tập đồng hồ tập trung vui nhộn: tập trung cho đến khi đá tan, Ngu Công dời núi, nến cháy hết, trà sữa cạn ly...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${baloo.variable} antialiased`}>
        {children}
        {GA_ENABLED && (
          <>
            {/* Google Analytics 4: tự ghi nhận lượt xem trang, kể cả khi chuyển trang trong app */}
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
