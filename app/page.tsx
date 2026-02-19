import Link from "next/link";
import { IntelligenceBriefing } from "@/components/landing/intelligence-briefing";
import { ProblemAgitation } from "@/components/landing/problem-agitation";
import { AlphaCardsShowcase } from "@/components/landing/alpha-cards-showcase";
import { PipelineScroll } from "@/components/landing/pipeline-scroll";
import { SocialProof } from "@/components/landing/social-proof";
import { Pricing } from "@/components/landing/pricing";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { StickyCta } from "@/components/landing/sticky-cta";

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen flex flex-col bg-landing-surface overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 bg-landing-surface/80 backdrop-blur-md z-sticky border-b border-landing-muted/20 px-6 py-4 flex items-center justify-between">
        <div className="font-mono text-xs uppercase tracking-widest text-landing-text">
          Scout<span className="text-landing-muted">Agent</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="#pricing"
            className="font-mono text-xs text-landing-archival hover:text-landing-text transition-colors hidden sm:block"
          >
            Pricing
          </a>
          <Link
            href="/login"
            className="font-mono text-xs text-landing-archival hover:text-landing-text transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="font-mono text-xs font-medium bg-landing-signal text-[#0A0A0A] px-4 py-1.5 rounded hover:opacity-90 transition-opacity"
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
