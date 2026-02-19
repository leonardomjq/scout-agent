"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Lock } from "lucide-react";
import { landingStagger, landingStaggerItem } from "@/lib/landing-motion";
import { SectionCta } from "@/components/landing/section-cta";

const entities = ["drizzle-orm", "electric-sql", "cr-sqlite"];

const evidence = [
  "drizzle-orm hit 1,200 new GitHub stars in 14 days with 3 independent forks adding SQLite-specific features.",
  "electric-sql Discord grew 40% week-over-week; recurring questions about offline-first patterns in production.",
];

const proFields = [
  "Friction Detail",
  "Gap Analysis",
  "Risk Factors",
  "Competitive Landscape",
  "Build This Blueprint",
];

export function AlphaCardsShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="px-6 py-20 max-w-5xl mx-auto" ref={ref}>
      <div className="font-mono text-[10px] text-landing-muted uppercase tracking-widest mb-2">
        What You Get
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-landing-text mb-4">
        Alpha Cards
      </h2>
      <p className="font-[family-name:var(--font-serif)] text-landing-archival text-sm mb-12 max-w-2xl">
        Actionable intelligence briefs — not dashboards, not alerts. Each card
        is a researched opportunity with evidence, timing, and strategy.
      </p>

      <motion.div
        className="max-w-3xl mx-auto"
        variants={landingStagger}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div
          className="texture-paper bg-landing-surface border border-landing-signal/30 rounded-lg overflow-hidden shadow-[0_0_40px_-10px_rgba(0,229,179,0.15)]"
          variants={landingStaggerItem}
        >
          {/* Card header */}
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-landing-signal border border-landing-signal/30 rounded px-2 py-0.5">
                Emerging Tool
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-landing-archival">
                  Momentum
                </span>
                <span className="font-mono text-lg font-bold text-landing-signal">
                  87
                </span>
              </div>
            </div>

            <h3 className="font-[family-name:var(--font-serif)] text-xl text-landing-text font-medium mb-3">
              Local-First SQLite ORMs Gaining Dev Traction
            </h3>

            {/* Entity tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {entities.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] text-landing-signal/70 border border-landing-signal/20 rounded px-1.5 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Free-tier content: thesis + evidence */}
          <div className="px-6 pb-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-landing-muted mb-2">
              Thesis
            </div>
            <p className="font-[family-name:var(--font-serif)] text-sm text-landing-text leading-relaxed mb-5">
              Multiple independent developers are converging on local-first
              SQLite solutions. Conflict-free replicated data types and
              edge-native sync engines are seeing rapid adoption, with 3
              projects hitting 1K+ stars in 14 days. This signals a structural
              shift toward offline-first architectures.
            </p>

            <div className="font-mono text-[10px] uppercase tracking-widest text-landing-muted mb-2">
              Evidence
            </div>
            <ul className="space-y-2 mb-6">
              {evidence.map((item) => (
                <li
                  key={item}
                  className="font-[family-name:var(--font-serif)] text-sm text-landing-archival leading-relaxed pl-3 border-l border-landing-signal/30"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Blur gate — pro content */}
          <div className="relative border-t border-landing-muted/20">
            <div className="blur-sm select-none pointer-events-none p-6" aria-hidden>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {proFields.map((field) => (
                  <div key={field}>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-landing-muted mb-2">
                      {field}
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-3 bg-landing-muted/20 rounded w-full" />
                      <div className="h-3 bg-landing-muted/20 rounded w-4/5" />
                      <div className="h-3 bg-landing-muted/20 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 font-mono text-sm text-landing-signal bg-landing-surface/90 border border-landing-signal/30 rounded px-4 py-2">
                <Lock className="size-3.5" />
                Unlock with Pro
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <p className="text-center font-[family-name:var(--font-serif)] text-xs text-landing-muted mt-6 max-w-lg mx-auto">
        Free users see titles, thesis, and key signals. Pro unlocks the full
        strategic brief.
      </p>

      <div className="text-center mt-8">
        <SectionCta text="Get Cards Like This — Free" />
      </div>
    </section>
  );
}
