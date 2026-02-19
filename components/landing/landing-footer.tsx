import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="px-6 py-10">
      {/* Perforation divider */}
      <div className="border-t border-dashed border-landing-muted/30 mb-8" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="text-landing-muted uppercase tracking-widest">
          End of Briefing
        </div>

        <nav className="flex items-center gap-6 text-landing-archival">
          <a href="#pricing" className="hover:text-landing-text transition-colors">
            Pricing
          </a>
          <Link href="/login" className="hover:text-landing-text transition-colors">
            Login
          </Link>
          <Link href="/signup" className="hover:text-landing-text transition-colors">
            Signup
          </Link>
        </nav>

        <div className="text-landing-muted/50 uppercase tracking-widest text-[10px]">
          Built by founders, for founders
        </div>
      </div>
    </footer>
  );
}
