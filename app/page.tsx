import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-accent-green font-mono font-bold text-xl">
            Scout
          </span>
          <span className="text-text-muted font-mono text-xl">Agent</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-text-muted hover:text-text transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="bg-accent-green text-bg px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            Venture Intelligence
            <br />
            <span className="text-accent-green">Before the Mainstream</span>
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto">
            ScoutAgent tracks what developers are building and shipping, spots
            where traction is clustering, and tells you exactly what to build
            next.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="bg-accent-green text-bg px-6 py-3 rounded-lg font-medium text-lg hover:opacity-90 transition-opacity"
            >
              Start Free
            </Link>
            <Link
              href="/login"
              className="border border-border px-6 py-3 rounded-lg font-medium text-lg hover:bg-surface transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mt-20">
          <div className="bg-surface border border-border rounded-xl p-6 text-left">
            <div className="text-accent-green text-2xl mb-3">01</div>
            <h3 className="font-semibold text-lg mb-2">Signal Detection</h3>
            <p className="text-text-muted text-sm">
              Monitors what developers are building, launching, and growing
              — 24/7, across thousands of conversations.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6 text-left">
            <div className="text-accent-amber text-2xl mb-3">02</div>
            <h3 className="font-semibold text-lg mb-2">Pattern Matching</h3>
            <p className="text-text-muted text-sm">
              Spots when multiple builders are finding traction in the same
              space — validated demand, not guesswork.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6 text-left">
            <div className="text-accent-blue text-2xl mb-3">03</div>
            <h3 className="font-semibold text-lg mb-2">Alpha Cards</h3>
            <p className="text-text-muted text-sm">
              Actionable intelligence briefs with thesis, strategy, and evidence
              — delivered fresh every 72 hours.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4 text-center text-text-muted text-sm">
        ScoutAgent &mdash; Built for founders, VCs, and technical leaders.
      </footer>
    </div>
  );
}
