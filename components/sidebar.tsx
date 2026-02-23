import { Github, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AlphaCard } from "@/types";
import { NextEditionCountdown } from "@/components/next-edition-countdown";
import { EmailSignup } from "@/components/email-signup";

interface SidebarProps {
  date: string;
  cards: AlphaCard[];
  isLatest?: boolean;
}

const sourceConfig: Record<string, { label: string; icon: string; color: string }> = {
  hackernews: { label: "Hacker News", icon: "HN", color: "text-source-hn" },
  reddit: { label: "Reddit", icon: "R", color: "text-source-reddit" },
  github: { label: "GitHub", icon: "GH", color: "text-source-github" },
  producthunt: { label: "Product Hunt", icon: "PH", color: "text-source-ph" },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function Sidebar({ date, cards, isLatest = true }: SidebarProps) {
  // Compute source evidence counts
  const sourceCounts: Record<string, number> = {};
  for (const card of cards) {
    for (const ev of card.evidence) {
      sourceCounts[ev.source] = (sourceCounts[ev.source] ?? 0) + 1;
    }
  }

  return (
    <aside className="space-y-5">
      {/* Date */}
      <div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-dim block mb-1">
          Edition
        </span>
        <span className="font-mono text-sm text-text-muted">
          {formatDate(date)}
        </span>
      </div>

      {isLatest && (
        <>
          <div className="h-px bg-border" />
          <NextEditionCountdown />
        </>
      )}

      <div className="h-px bg-border" />

      {/* Sources */}
      <div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-dim block mb-2.5">
          Sources
        </span>
        <div className="space-y-1.5">
          {Object.entries(sourceConfig).map(([key, { label, icon, color }]) => {
            const count = sourceCounts[key] ?? 0;
            return (
              <div key={key} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={cn("font-mono text-xs font-bold w-5", color)}>
                    {icon}
                  </span>
                  <span className="text-text-muted">{label}</span>
                </div>
                <span className="font-mono text-xs text-text-dim">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Email signup */}
      <div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-dim block mb-2.5">
          Get briefs by email
        </span>
        <EmailSignup />
      </div>

      <div className="h-px bg-border" />

      {/* Links */}
      <div className="flex items-center gap-4">
        <a
          href="/about"
          className="font-mono text-xs text-text-muted hover:text-text transition-colors"
        >
          About
        </a>
        <a
          href="https://github.com/leonardomjq/scout-agent"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors"
        >
          <Github className="size-3.5" />
          <span className="font-mono">GitHub</span>
        </a>
        <a
          href="https://ko-fi.com/leonardomjq"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors"
        >
          <Heart className="size-3.5" />
          <span className="font-mono">Support</span>
        </a>
      </div>
    </aside>
  );
}
