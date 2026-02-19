"use client";

import { motion } from "framer-motion";
import { landingStagger, landingStaggerItem, scanLine } from "@/lib/landing-motion";
import { SectionCta } from "@/components/landing/section-cta";

export function IntelligenceBriefing() {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center px-6 py-20 overflow-hidden">
      <motion.div
        className="max-w-4xl"
        variants={landingStagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={landingStaggerItem}>
          <motion.div
            className="h-px bg-landing-signal mb-8 w-24"
            variants={scanLine}
          />
        </motion.div>

        <motion.h1
          className="font-[family-name:var(--font-display)] text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[6rem] font-bold leading-[1] tracking-tight text-landing-text"
          variants={landingStaggerItem}
        >
          Developer traction.
          <br />
          <span className="text-landing-signal">72 hours</span> before
          <br />
          everyone else.
        </motion.h1>

        <motion.p
          className="font-[family-name:var(--font-serif)] text-landing-archival text-base sm:text-lg mt-8 max-w-2xl leading-relaxed"
          variants={landingStaggerItem}
        >
          ScoutAgent monitors what developers build, ship, and complain
          about&mdash;then delivers intelligence briefs before trends go
          mainstream.
        </motion.p>

        <motion.div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6" variants={landingStaggerItem}>
          <SectionCta text="Start Free — No Credit Card" />
        </motion.div>

        <motion.p
          className="mt-6 font-mono text-xs text-landing-muted"
          variants={landingStaggerItem}
        >
          Analyzing 12,000+ developer signals weekly
        </motion.p>
      </motion.div>
    </section>
  );
}
