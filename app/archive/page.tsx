import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getAllDates, getDailyData } from "@/lib/data";

export const metadata: Metadata = {
  title: "Archive",
  description:
    "Browse all past editions of Overheard opportunity briefs.",
  alternates: { canonical: "/archive" },
};

function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function ArchivePage() {
  const dates = getAllDates();

  // Group dates by month
  const grouped: Record<string, { date: string; cardCount: number }[]> = {};
  for (const date of dates) {
    const monthKey = formatMonthYear(date);
    const data = getDailyData(date);
    const cardCount = data?.cards.length ?? 0;
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push({ date, cardCount });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-4">
          Archive
        </h1>
        <p className="font-[family-name:var(--font-serif)] text-base leading-relaxed text-text-muted mb-10">
          Every edition of Overheard, from the first day forward. Each edition contains
          AI-generated opportunity briefs synthesized from signals across Hacker News, Reddit,
          GitHub, and Product Hunt.
        </p>

        {dates.length === 0 ? (
          <p className="text-text-muted font-mono text-sm">
            No editions yet. Check back tomorrow.
          </p>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([month, entries]) => (
              <section key={month}>
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-dim mb-3">
                  {month}
                </h2>
                <div className="space-y-1">
                  {entries.map(({ date, cardCount }) => (
                    <Link
                      key={date}
                      href={`/edition/${date}`}
                      className="flex items-center justify-between py-2 px-3 -mx-3 rounded-lg hover:bg-surface transition-colors"
                    >
                      <span className="text-sm text-text-muted">
                        {formatDay(date)}
                      </span>
                      <span className="font-mono text-xs text-text-dim">
                        {cardCount} {cardCount === 1 ? "card" : "cards"}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
