# Tập trung cho đến khi... ⏳

Bộ sưu tập đồng hồ tập trung vui nhộn: tập trung cho đến khi đá tan, Ngu Công dời xong núi, nến cháy hết, trà sữa cạn ly...

## Chạy dự án

```bash
npm install
npm run dev
```

Mở http://localhost:3000

## Thêm bộ đếm mới

1. Thêm thông tin (tên, màu, câu động viên) vào `src/lib/timers.ts`.
2. Tạo một cảnh SVG trong `src/components/scenes/`, nhận `progress` (0 → 1) và `running`.
3. Đăng ký cảnh trong `src/components/scenes/index.ts` với cùng `slug`.
