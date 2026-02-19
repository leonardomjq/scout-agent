"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { X, Check } from "lucide-react";
import { landingStagger, landingStaggerItem } from "@/lib/landing-motion";
import { SectionCta } from "@/components/landing/section-cta";

const rows = [
  {
    without: "Scrolling dev Twitter hoping to spot what matters",
    withSA: "Automated 24/7 monitoring across Twitter, GitHub, HN, Reddit",
  },
  {
    without: "Hearing about trends after competitors shipped",
    withSA: "Pattern detection within 72 hours of emergence",
  },
  {
    without: "Making bets on gut feeling",
    withSA: "Evidence-backed briefs, not speculation",
  },
  {
    without: "Missing traction signals buried in noise",
    withSA: "Clear signals while competitors drown in noise",
  },
];

export function ProblemAgitation() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="px-6 py-20 max-w-5xl mx-auto" ref={ref}>
      <div className="font-mono text-[10px] text-landing-muted uppercase tracking-widest mb-2">
        The Problem
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-landing-text mb-12">
        You&apos;re flying blind
      </h2>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10"
        variants={landingStagger}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Without column */}
        <motion.div className="space-y-4" variants={landingStaggerItem}>
          <div className="font-mono text-xs uppercase tracking-widest text-landing-muted mb-4">
            Without ScoutAgent
          </div>
          {rows.map((row) => (
            <div
              key={row.without}
              className="flex items-start gap-3 text-sm"
            >
              <X className="size-4 text-landing-muted/50 shrink-0 mt-0.5" />
              <span className="font-[family-name:var(--font-serif)] text-landing-muted">
                {row.without}
              </span>
            </div>
          ))}
        </motion.div>

        {/* With column */}
        <motion.div className="space-y-4" variants={landingStaggerItem}>
          <div className="font-mono text-xs uppercase tracking-widest text-landing-signal mb-4">
            With ScoutAgent
          </div>
          {rows.map((row) => (
            <div
              key={row.withSA}
              className="flex items-start gap-3 text-sm"
            >
              <Check className="size-4 text-landing-signal shrink-0 mt-0.5" />
              <span className="font-[family-name:var(--font-serif)] text-landing-text">
                {row.withSA}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <div className="mt-12">
        <SectionCta text="See what you're missing" variant="secondary" />
      </div>
    </section>
  );
}
