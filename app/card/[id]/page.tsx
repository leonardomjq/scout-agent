import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CardDetail } from "@/components/card-detail";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CopyLinkButton } from "@/components/copy-link-button";
import { JsonLd } from "@/components/json-ld";
import { buildArticleSchema, buildBreadcrumbSchema } from "@/lib/json-ld";
import Link from "next/link";
import { getCardById, getAllCards, getRelatedCards } from "@/lib/data";
import { getCategoryLabel } from "@/lib/categories";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return getAllCards().map((card) => ({ id: card.id }));
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://overheard.vercel.app";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const card = getCardById(id);
  if (!card) return {};

  return {
    title: card.title,
    description: card.thesis,
    alternates: { canonical: `/card/${card.id}` },
  };
}

export default async function CardPage({ params }: Props) {
  const { id } = await params;
  const card = getCardById(id);
  if (!card) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={buildArticleSchema(card)} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", url: BASE_URL },
          { name: card.date, url: `${BASE_URL}/edition/${card.date}` },
          { name: card.title },
        ])}
      />
      <SiteHeader date={card.date} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Breadcrumbs
            crumbs={[
              { label: "Home", href: "/" },
              { label: card.date, href: `/edition/${card.date}` },
              { label: card.title },
            ]}
          />
          <CopyLinkButton />
        </div>

        <CardDetail card={card} />

        {/* Related cards — cross-linking for SEO */}
        {(() => {
          const related = getRelatedCards(card.id);
          if (related.length === 0) return null;
          const label = getCategoryLabel(card.category);
          return (
            <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-border">
              <h2 className="font-mono text-xs uppercase tracking-widest text-text-dim mb-4">
                More in {label}
              </h2>
              <div className="space-y-3">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/card/${r.id}`}
                    className="block p-4 rounded-lg border border-border hover:border-border-strong transition-colors"
                  >
                    <span className="font-[family-name:var(--font-display)] text-sm font-semibold block mb-1">
                      {r.title}
                    </span>
                    <span className="text-xs text-text-muted font-mono">
                      {r.date} &middot; {r.evidence.length} evidence
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                href={`/category/${card.category}`}
                className="inline-block mt-4 text-xs font-mono text-accent-muted hover:text-accent transition-colors"
              >
                View all {label} briefs &rarr;
              </Link>
            </div>
          );
        })()}
      </main>
      <SiteFooter />
    </div>
  );
}
