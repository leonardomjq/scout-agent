import Link from "next/link";
import { Logo } from "@/components/logo";

interface SiteHeaderProps {
  date?: string;
}

export function SiteHeader({ date }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 bg-bg z-sticky border-b border-border px-6 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo size="sm" href="/" />
          {date && (
            <span className="hidden sm:block font-mono text-[10px] text-accent-muted">
              {date}
            </span>
          )}
        </div>
        <nav className="flex items-center gap-6">
          <Link
            href="/about"
            className="font-mono text-xs text-text-muted hover:text-text transition-colors"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
