import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AlphaCard } from "@/types";

const sourceLabels: Record<string, string> = {
  hackernews: "Hacker News",
  reddit: "Reddit",
  github: "GitHub",
  producthunt: "Product Hunt",
};

const sourceColors: Record<string, string> = {
  hackernews: "text-source-hn",
  reddit: "text-source-reddit",
  github: "text-source-github",
  producthunt: "text-source-ph",
};

const sourceBorderColors: Record<string, string> = {
  hackernews: "border-l-source-hn",
  reddit: "border-l-source-reddit",
  github: "border-l-source-github",
  producthunt: "border-l-source-ph",
};

interface CardDetailProps {
  card: AlphaCard;
}

export function CardDetail({ card }: CardDetailProps) {
  const uniqueSources = new Set(card.sources);

  return (
    <article className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <span className="text-[10px] font-mono uppercase tracking-widest text-text-dim mb-2 block">
          {card.category.replace("-", " ")}
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {card.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-text-muted font-mono">
          <span>{card.date}</span>
          <span>{card.evidence.length} evidence</span>
          <span>{uniqueSources.size} sources</span>
        </div>
      </div>

      {/* Thesis — primary text, no box wrapper */}
      <p className="font-[family-name:var(--font-serif)] text-lg leading-relaxed mb-8">
        {card.thesis}
      </p>

      {/* Evidence */}
      <section className="mb-8">
        <h2 className="font-mono text-xs uppercase tracking-widest text-text-dim mb-4">
          Evidence
        </h2>
        <div className="space-y-4">
          {card.evidence.map((ev, i) => (
            <blockquote
              key={i}
              className={cn(
                "border-l-3 pl-5 py-1",
                sourceBorderColors[ev.source] ?? "border-l-text-dim"
              )}
            >
              <p className="font-[family-name:var(--font-serif)] text-sm leading-relaxed mb-3">
                &ldquo;{ev.text}&rdquo;
              </p>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span
                  className={cn("font-mono", sourceColors[ev.source] ?? "text-text-muted")}
                >
                  {sourceLabels[ev.source] ?? ev.source}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold">
                    {ev.engagement.toLocaleString()} engagement
                  </span>
                  {ev.url && (
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-text transition-colors"
                    >
                      <ExternalLink className="size-3" />
                      Source
                    </a>
                  )}
                </div>
              </div>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Opportunity — inset panel */}
      <div className="bg-surface-inset rounded-lg p-6 mb-4">
        <h2 className="font-mono text-xs uppercase tracking-widest text-text-dim mb-3">
          Opportunity
        </h2>
        <p className="font-[family-name:var(--font-serif)] text-base leading-relaxed">
          {card.opportunity}
        </p>
      </div>

      {/* AI attribution */}
      <p className="text-[10px] text-text-dim font-mono">
        AI-generated brief. Not financial advice. Always verify sources.
      </p>
    </article>
  );
}
