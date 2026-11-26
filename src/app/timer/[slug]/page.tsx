import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LuckyRunner from "@/components/LuckyRunner";
import TimerRunner from "@/components/TimerRunner";
import { TIMERS, getTimer } from "@/lib/timers";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return TIMERS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const timer = getTimer(slug);
  if (!timer) return {};
  return { title: `${timer.emoji} ${timer.title}`, description: timer.description };
}

export default async function TimerPage({ params }: Props) {
  const { slug } = await params;
  const timer = getTimer(slug);
  if (!timer) notFound();
  return timer.kind === "lucky" ? <LuckyRunner slug={slug} /> : <TimerRunner slug={slug} />;
}
