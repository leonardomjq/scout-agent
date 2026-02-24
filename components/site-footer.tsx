import { Github, Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-8 mt-auto">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-4">
            <span className="font-mono">
              over<span className="text-text-dim">heard</span>
            </span>
            <span className="text-text-dim">
              AI-generated briefs &middot; Not financial advice
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="/about"
              className="hover:text-text transition-colors"
            >
              About
            </a>
            <a
              href="/faq"
              className="hover:text-text transition-colors"
            >
              FAQ
            </a>
            <a
              href="/glossary"
              className="hover:text-text transition-colors"
            >
              Glossary
            </a>
            <a
              href="/archive"
              className="hover:text-text transition-colors"
            >
              Archive
            </a>
            <a
              href="/privacy"
              className="hover:text-text transition-colors"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="hover:text-text transition-colors"
            >
              Terms
            </a>
            <a
              href="https://github.com/leonardomjq/overheard"
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
