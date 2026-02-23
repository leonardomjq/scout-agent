import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CardGrid } from "@/components/card-grid";
import { Sidebar } from "@/components/sidebar";
import { DateNav } from "@/components/date-nav";
import { getAllDates, getDailyData } from "@/lib/data";

interface Props {
  params: Promise<{ date: string }>;
}

export function generateStaticParams() {
  return getAllDates().map((date) => ({ date }));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  return {
    title: `Edition — ${formatDate(date)}`,
    description: `Opportunity briefs from ${formatDate(date)}.`,
  };
}

export default async function EditionPage({ params }: Props) {
  const { date } = await params;
  const data = getDailyData(date);
  if (!data) notFound();

  const latestDate = getAllDates()[0];
  const isLatest = date === latestDate;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader date={date} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold mb-4">
            {formatDate(date)}
          </h1>
          <div className="h-px bg-border" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <CardGrid cards={data.cards} />
            <DateNav date={date} />
          </div>
          <div className="lg:sticky lg:top-14 lg:self-start">
            <Sidebar date={date} cards={data.cards} isLatest={isLatest} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
