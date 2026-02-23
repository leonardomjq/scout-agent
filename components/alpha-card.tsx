import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AlphaCard as AlphaCardType } from "@/types";

interface AlphaCardProps {
  card: AlphaCardType;
}

const sourceColors: Record<string, string> = {
  hackernews: "border-l-source-hn",
  reddit: "border-l-source-reddit",
  github: "border-l-source-github",
  producthunt: "border-l-source-ph",
};

export function AlphaCard({ card }: AlphaCardProps) {
  const bestEvidence = card.evidence[0];
  const uniqueSources = new Set(card.sources);

  return (
    <Link href={`/card/${card.id}`} className="block cursor-pointer">
      <article className="bg-surface border border-border p-5 rounded-lg transition-colors hover:border-border-strong">
        {/* Category */}
        <span className="text-[10px] font-mono uppercase tracking-widest text-text-dim mb-3 block">
          {card.category.replace("-", " ")}
        </span>

        {/* Title — scan layer */}
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-snug mb-2">
          {card.title}
        </h3>

        {/* Thesis — read layer, primary content */}
        <p className="font-[family-name:var(--font-serif)] text-base text-text leading-relaxed">
          {card.thesis}
        </p>

        {/* Best evidence quote — proof layer */}
        {bestEvidence && (
          <blockquote
            className={cn(
              "mt-4 pl-3 border-l-2",
              sourceColors[bestEvidence.source] ?? "border-l-text-dim"
            )}
          >
            <p className="font-[family-name:var(--font-serif)] text-sm text-text-muted leading-relaxed line-clamp-2">
              &ldquo;{bestEvidence.text}&rdquo;
            </p>
          </blockquote>
        )}

        {/* Footer */}
        <div className="text-[10px] font-mono text-text-dim pt-3 mt-4 border-t border-border">
          {card.evidence.length} evidence &middot; {uniqueSources.size} sources
        </div>
      </article>
    </Link>
  );
}
