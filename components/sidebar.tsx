import { Github, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { NextEditionCountdown } from "@/components/next-edition-countdown";
import { EmailSignup } from "@/components/email-signup";

interface SidebarProps {
  date: string;
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

export function Sidebar({ date, isLatest = true }: SidebarProps) {
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
          {Object.entries(sourceConfig).map(([key, { label, icon, color }]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                  <span className={cn("font-mono text-xs font-bold w-5", color)}>
                    {icon}
                  </span>
                  <span className="text-text-muted">{label}</span>
              </div>
            ))}
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
      <div className="flex items-center gap-4 flex-wrap">
        <a
          href="/archive"
          className="font-mono text-xs text-text-muted hover:text-text transition-colors"
        >
          Archive
        </a>
        <a
          href="/about"
          className="font-mono text-xs text-text-muted hover:text-text transition-colors"
        >
          About
        </a>
        <a
          href="https://github.com/leonardomjq/overheard"
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
