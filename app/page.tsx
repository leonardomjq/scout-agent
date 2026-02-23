import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CardGrid } from "@/components/card-grid";
import { Sidebar } from "@/components/sidebar";
import { DateNav } from "@/components/date-nav";
import { getLatestData } from "@/lib/data";

export default function HomePage() {
  const data = getLatestData();

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-6">
          <p className="text-text-muted font-mono text-sm">
            No cards yet. Check back tomorrow.
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader date={data.date} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold mb-4">
            Today&apos;s Opportunities
          </h1>
          <div className="h-px bg-border" />
        </div>

        {/* Grid: cards + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <CardGrid cards={data.cards} />
            <DateNav date={data.date} />
          </div>
          <div className="lg:sticky lg:top-14 lg:self-start">
            <Sidebar date={data.date} cards={data.cards} isLatest />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
