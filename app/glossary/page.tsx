import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getAllGlossaryTerms } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "Definitions of key terms used in Overheard — Alpha Cards, signal strength, evidence, market signals, and more.",
  alternates: { canonical: "/glossary" },
};

export default function GlossaryPage() {
  const terms = getAllGlossaryTerms();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-4">
          Glossary
        </h1>
        <p className="font-[family-name:var(--font-serif)] text-base leading-relaxed text-text-muted mb-10">
          Key terms and concepts used in Overheard opportunity briefs.
          Each term is defined in the context of how Overheard uses it.
        </p>

        <div className="space-y-4">
          {terms.map((term) => (
            <Link
              key={term.slug}
              href={`/glossary/${term.slug}`}
              className="block p-4 rounded-lg border border-border hover:border-border-strong transition-colors"
            >
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-1">
                {term.name}
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                {term.definition}
              </p>
            </Link>
          ))}
        </div>

        {/* Cross-links */}
        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="font-mono text-xs uppercase tracking-widest text-text-dim mb-4">
            Related
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/faq"
              className="text-sm text-text-muted hover:text-accent transition-colors underline underline-offset-2"
            >
              Frequently asked questions
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
