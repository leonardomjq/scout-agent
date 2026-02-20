import { redirect } from "next/navigation";
import Link from "next/link";
import { getLoggedInUser } from "@/lib/appwrite/server";
import { IntelligenceBriefing } from "@/components/landing/intelligence-briefing";
import { ProblemAgitation } from "@/components/landing/problem-agitation";
import { AlphaCardsShowcase } from "@/components/landing/alpha-cards-showcase";
import { PipelineScroll } from "@/components/landing/pipeline-scroll";
import { SocialProof } from "@/components/landing/social-proof";
import { Pricing } from "@/components/landing/pricing";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { StickyCta } from "@/components/landing/sticky-cta";

export default async function LandingPage() {
  const user = await getLoggedInUser();
  // getLoggedInUser() auto-cleans stale cookies when session is expired
  if (user) redirect("/feed");

  return (
    <div className="landing-page min-h-screen flex flex-col bg-surface overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 bg-surface/80 backdrop-blur-md z-sticky border-b border-text-dim/20 px-6 py-4 flex items-center justify-between">
        <div className="font-mono text-xs uppercase tracking-widest text-text">
          Scout<span className="text-text-dim">Agent</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="#pricing"
            className="font-mono text-xs text-text-muted hover:text-text transition-colors hidden sm:block"
          >
            Pricing
          </a>
          <Link
            href="/login"
            className="font-mono text-xs text-text-muted hover:text-text transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="font-mono text-xs font-medium bg-accent-green text-[#0A0A0A] px-4 py-1.5 rounded hover:opacity-90 transition-opacity"
          >
            Start Free
          </Link>
        </div>
      </header>

      {/* AIDA Funnel Sections */}
      <IntelligenceBriefing />
      <ProblemAgitation />
      <AlphaCardsShowcase />
      <PipelineScroll />
      <SocialProof />
      <Pricing />
      <FinalCta />
      <LandingFooter />

      {/* Floating CTA */}
      <StickyCta />
    </div>
  );
}
