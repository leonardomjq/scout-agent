import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CardGrid } from "@/components/card-grid";
import { JsonLd } from "@/components/json-ld";
import { buildCategoryCollectionSchema } from "@/lib/json-ld";
import { getAllCategories, getCardsByCategory } from "@/lib/data";
import { getCategoryLabel, getCategoryDescription } from "@/lib/categories";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllCategories().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const label = getCategoryLabel(slug);
  const cards = getCardsByCategory(slug);
  return {
    title: `${label} Opportunities`,
    description: getCategoryDescription(slug),
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: `${label} Opportunities | Overheard`,
      description: `${cards.length} opportunity briefs in ${label}, synthesized from Hacker News, Reddit, GitHub, and Product Hunt.`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cards = getCardsByCategory(slug);
  if (cards.length === 0) notFound();

  const label = getCategoryLabel(slug);
  const description = getCategoryDescription(slug);
  const allCategories = getAllCategories();
  const otherCategories = allCategories.filter((c) => c !== slug);

  // Unique dates across cards in this category
  const dates = [...new Set(cards.map((c) => c.date))];

  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={buildCategoryCollectionSchema(slug, label, cards)} />
      <SiteHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <div className="mb-8">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-dim block mb-2">
            Category
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold mb-3">
            {label}
          </h1>
          <p className="font-[family-name:var(--font-serif)] text-base leading-relaxed text-text-muted mb-3">
            {description}
          </p>
          <p className="text-xs text-text-dim font-mono">
            {cards.length} {cards.length === 1 ? "brief" : "briefs"} across{" "}
            {dates.length} {dates.length === 1 ? "edition" : "editions"}
          </p>
          <div className="h-px bg-border mt-4" />
        </div>

        <CardGrid cards={cards} />

        {/* Browse other categories */}
        {otherCategories.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="font-mono text-xs uppercase tracking-widest text-text-dim mb-4">
              Browse other categories
            </h2>
            <div className="flex flex-wrap gap-2">
              {otherCategories.map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${cat}`}
                  className="text-xs font-mono text-text-muted hover:text-accent px-3 py-1.5 rounded-full border border-border hover:border-accent-subtle transition-colors"
                >
                  {getCategoryLabel(cat)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
