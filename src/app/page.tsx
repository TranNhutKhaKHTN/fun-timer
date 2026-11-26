import TimerGallery from "@/components/TimerGallery";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
      <header className="mb-10 text-center sm:mb-14">
        <p className="mb-2 inline-block -rotate-2 rounded-full border-2 border-stone-900 bg-yellow-300 px-4 py-1 text-sm font-bold">
          ⏳ Bộ đếm giờ vui nhộn
        </p>
        <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl">
          Tập trung cho đến khi<span className="text-orange-500">...</span>
        </h1>
      </header>

      <TimerGallery />

      <footer className="mt-14 text-center text-sm text-stone-500">
        Mẹo: di chuột vào từng thẻ để xem trước hiệu ứng ✨
      </footer>
    </main>
  );
}
