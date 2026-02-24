import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd } from "@/components/json-ld";
import { buildAboutPageSchema } from "@/lib/json-ld";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description: "How Overheard works — data sources, methodology, and who built it.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={buildAboutPageSchema()} />
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-10">
          About Overheard
        </h1>

        <div className="space-y-8">
          {/* Key Facts — entity-dense, extractable */}
          <section className="bg-surface-inset rounded-lg p-5">
            <h2 className="font-mono text-xs uppercase tracking-widest text-text-dim mb-3">
              Key Facts
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <dt className="text-text-muted">Data sources</dt>
              <dd className="text-text">Hacker News, Reddit, GitHub, Product Hunt</dd>
              <dt className="text-text-muted">Updated</dt>
              <dd className="text-text">Daily at 8 AM UTC</dd>
              <dt className="text-text-muted">AI model</dt>
              <dd className="text-text">Google Gemini Flash</dd>
              <dt className="text-text-muted">Cost</dt>
              <dd className="text-text">Free, open source (MIT)</dd>
              <dt className="text-text-muted">Created by</dt>
              <dd className="text-text">Leonardo Jaques</dd>
            </dl>
          </section>

          <section>
            <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-3">
              What this is
            </h2>
            <p className="font-[family-name:var(--font-serif)] text-base leading-relaxed text-text-muted">
              Overheard publishes opportunity briefs every morning, synthesized from
              thousands of conversations across Hacker News, Reddit, GitHub, and Product Hunt.
              Each brief identifies a demand spike, frustration cluster, or emerging gap
              where builders could ship something useful.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-3">
              Data sources
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Hacker News", desc: "Front page, Ask HN, Show HN" },
                { name: "Reddit", desc: "r/SaaS, r/startups, r/Entrepreneur" },
                { name: "GitHub", desc: "Trending repos, new projects" },
                { name: "Product Hunt", desc: "Daily launches" },
              ].map((source) => (
                <Card key={source.name} padding="compact">
                  <span className="font-mono text-xs text-text block">
                    {source.name}
                  </span>
                  <span className="text-xs text-text-muted">{source.desc}</span>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-3">
              How it works
            </h2>
            <ol className="space-y-3 text-text-muted text-sm">
              <li className="flex gap-3">
                <span className="font-mono text-accent shrink-0">01</span>
                <span>
                  Every morning, a script fetches signals from all four sources via their
                  public APIs and feeds.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent shrink-0">02</span>
                <span>
                  Signals are clustered by keyword overlap to identify themes with
                  significant engagement.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent shrink-0">03</span>
                <span>
                  Each cluster is synthesized into an opportunity brief using Gemini Flash,
                  grounded in the actual evidence.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent shrink-0">04</span>
                <span>
                  Cards are validated, committed to the repo, and auto-deployed to this site.
                </span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-3">
              Transparency
            </h2>
            <p className="font-[family-name:var(--font-serif)] text-base leading-relaxed text-text-muted">
              Every brief is AI-generated and links back to the original sources. The
              signal strength score reflects engagement volume, not editorial judgment.
              This is a tool for discovery, not financial advice. Always do your own
              research before building.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-3">
              Who built this
            </h2>
            <p className="font-[family-name:var(--font-serif)] text-base leading-relaxed text-text-muted">
              Built by{" "}
              <a
                href="https://github.com/leonardomjq"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text hover:text-accent transition-colors underline underline-offset-2"
              >
                Leonardo Jaques
              </a>
              . The entire project is open source — check the{" "}
              <a
                href="https://github.com/leonardomjq/overheard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text hover:text-accent transition-colors underline underline-offset-2"
              >
                GitHub repo
              </a>
              .
            </p>
          </section>
          {/* Cross-links */}
          <div className="pt-4 border-t border-border">
            <h2 className="font-mono text-xs uppercase tracking-widest text-text-dim mb-4">
              More
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/faq"
                className="text-sm text-text-muted hover:text-accent transition-colors underline underline-offset-2"
              >
                Frequently asked questions
              </Link>
              <Link
                href="/glossary"
                className="text-sm text-text-muted hover:text-accent transition-colors underline underline-offset-2"
              >
                Glossary of terms
              </Link>
              <Link
                href="/archive"
                className="text-sm text-text-muted hover:text-accent transition-colors underline underline-offset-2"
              >
                Browse all editions
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
