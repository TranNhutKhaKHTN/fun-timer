import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
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
      <body className={`${baloo.variable} antialiased`}>{children}</body>
    </html>
  );
}
