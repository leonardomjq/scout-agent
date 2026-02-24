import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd } from "@/components/json-ld";
import { buildDefinedTermSchema } from "@/lib/json-ld";
import { getAllGlossaryTerms, getGlossaryTerm } from "@/lib/glossary";

interface Props {
  params: Promise<{ term: string }>;
}

export function generateStaticParams() {
  return getAllGlossaryTerms().map((t) => ({ term: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { term: slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) return {};

  return {
    title: `What is ${term.name}?`,
    description: term.definition,
    alternates: { canonical: `/glossary/${term.slug}` },
  };
}

export default async function GlossaryTermPage({ params }: Props) {
  const { term: slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) notFound();

  const allTerms = getAllGlossaryTerms();
  const relatedTerms = term.related
    .map((s) => allTerms.find((t) => t.slug === s))
    .filter(Boolean);

  // Split body into paragraphs
  const paragraphs = term.body.split("\n\n").filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={buildDefinedTermSchema(term)} />
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-8">
          <Link href="/glossary" className="hover:text-text transition-colors">
            Glossary
          </Link>
          <span className="text-text-dim">/</span>
          <span className="text-text font-medium">{term.name}</span>
        </nav>

        <article>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-4">
            What is {term.name}?
          </h1>

          {/* Definition — highlighted for AI extraction */}
          <div className="bg-surface-inset rounded-lg p-5 mb-8">
            <p className="font-[family-name:var(--font-serif)] text-base leading-relaxed text-text">
              <strong>{term.name}</strong> — {term.definition}
            </p>
          </div>

          {/* Body */}
          <div className="space-y-4">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="font-[family-name:var(--font-serif)] text-base leading-relaxed text-text-muted"
              >
                {p}
              </p>
            ))}
          </div>
        </article>

        {/* Related terms */}
        {relatedTerms.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="font-mono text-xs uppercase tracking-widest text-text-dim mb-4">
              Related terms
            </h2>
            <div className="space-y-3">
              {relatedTerms.map((t) => t && (
                <Link
                  key={t.slug}
                  href={`/glossary/${t.slug}`}
                  className="block p-3 rounded-lg border border-border hover:border-border-strong transition-colors"
                >
                  <span className="font-[family-name:var(--font-display)] text-sm font-semibold block mb-0.5">
                    {t.name}
                  </span>
                  <span className="text-xs text-text-muted line-clamp-1">
                    {t.definition}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to glossary + cross-links */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-wrap gap-4">
            <Link
              href="/glossary"
              className="text-sm text-text-muted hover:text-accent transition-colors underline underline-offset-2"
            >
              All glossary terms
            </Link>
            <Link
              href="/faq"
              className="text-sm text-text-muted hover:text-accent transition-colors underline underline-offset-2"
            >
              FAQ
            </Link>
            <Link
              href="/about"
              className="text-sm text-text-muted hover:text-accent transition-colors underline underline-offset-2"
            >
              How Overheard works
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
