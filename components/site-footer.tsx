import { Github, Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-8 mt-auto">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-4">
            <span className="font-mono">
              scout<span className="text-accent">_</span>
              <span className="text-text-dim">daily</span>
            </span>
            <span className="text-text-dim">
              AI-generated briefs &middot; Not financial advice
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/about"
              className="hover:text-text transition-colors"
            >
              Methodology
            </a>
            <a
              href="https://github.com/leonardomjq/scout-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text transition-colors inline-flex items-center gap-1.5"
            >
              <Github className="size-3.5" />
              Source
            </a>
            <a
              href="https://ko-fi.com/leonardomjq"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text transition-colors inline-flex items-center gap-1.5"
            >
              <Heart className="size-3.5" />
              Support
            </a>
          </div>
        </div>
        <p className="text-center font-mono text-[10px] text-text-dim">
          Built by Leonardo Jaques
        </p>
      </div>
    </footer>
  );
}
