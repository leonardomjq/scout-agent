import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description: "How Scout Daily works — data sources, methodology, and who built it.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-10">
          About Scout Daily
        </h1>

        <div className="space-y-8">
          <section>
            <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-3">
              What this is
            </h2>
            <p className="font-[family-name:var(--font-serif)] text-base leading-relaxed text-text-muted">
              Scout Daily publishes opportunity briefs every morning, synthesized from
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
                href="https://github.com/leonardomjq/scout-agent"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text hover:text-accent transition-colors underline underline-offset-2"
              >
                GitHub repo
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
