"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Radio, Layers, Zap } from "lucide-react";
import { landingStagger, landingStaggerItem } from "@/lib/landing-motion";
import { SectionCta } from "@/components/landing/section-cta";

const steps = [
  {
    icon: Radio,
    title: "We Monitor",
    description:
      "Watches dev conversations across Twitter, GitHub, HN, Reddit — 24/7",
  },
  {
    icon: Layers,
    title: "AI Filters the Noise",
    description:
      "Three-layer AI pipeline extracts entities, detects anomalies, clusters traction signals",
  },
  {
    icon: Zap,
    title: "You Get Alpha Cards",
    description:
      "Actionable intelligence briefs with evidence and timing. Before trends go mainstream",
  },
];

export function PipelineScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="px-6 py-20 max-w-5xl mx-auto" ref={ref}>
      <div className="font-mono text-[10px] text-landing-muted uppercase tracking-widest mb-2">
        How It Works
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-landing-text mb-14">
        From noise to alpha in three steps
      </h2>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6"
        variants={landingStagger}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            className="flex flex-col items-start"
            variants={landingStaggerItem}
          >
            {/* Step number + icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border border-landing-signal/30 flex items-center justify-center bg-landing-signal/5">
                <step.icon className="size-4 text-landing-signal" />
              </div>
              <span className="font-mono text-[10px] text-landing-muted uppercase tracking-widest">
                Step {String(i + 1).padStart(2, "0")}
              </span>
            </div>

            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-landing-text mb-2">
              {step.title}
            </h3>

            <p className="font-[family-name:var(--font-serif)] text-sm text-landing-archival leading-relaxed">
              {step.description}
            </p>

            {/* Connector arrow on desktop (except last) */}
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
            )}
          </motion.div>
        ))}
      </motion.div>

      <p className="font-mono text-xs text-landing-muted mt-10 text-center">
        Powered by Claude AI. Analyzing thousands of signals weekly.
      </p>

      <div className="text-center mt-8">
        <SectionCta text="Start receiving Alpha Cards" variant="secondary" />
      </div>
    </section>
  );
}
