"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Radio, Layers, Zap } from "lucide-react";
import { clipRevealStagger, clipRevealItem } from "@/lib/motion";
import { SectionCta } from "@/components/landing/section-cta";

const steps = [
  {
    icon: Radio,
    title: "We Listen Everywhere",
    description:
      "Scans conversations across Twitter, GitHub, HN, and Reddit around the clock \u2014 wherever builders and users talk about what\u2019s broken",
  },
  {
    icon: Layers,
    title: "AI Spots the Patterns",
    description:
      "Filters noise, detects demand spikes, and clusters frustration signals that point to real business opportunities",
  },
  {
    icon: Zap,
    title: "You Get Opportunity Briefs",
    description:
      "Actionable Alpha Cards with evidence, timing, and strategy \u2014 delivered before markets get crowded",
  },
];

export function PipelineScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="px-6 py-20 max-w-5xl mx-auto" ref={ref}>
      <div className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-2">
        How It Works
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-text mb-14">
        From noise to opportunity in three steps
      </h2>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6"
        variants={clipRevealStagger}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            className="flex flex-col items-start"
            variants={clipRevealItem}
          >
            {/* Step number + icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border border-accent-green/30 flex items-center justify-center bg-accent-green/5">
                <step.icon className="size-4 text-accent-green" />
              </div>
              <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest">
                Step {String(i + 1).padStart(2, "0")}
              </span>
            </div>

            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-text mb-2">
              {step.title}
            </h3>

            <p className="font-[family-name:var(--font-serif)] text-sm text-text-muted leading-relaxed">
              {step.description}
            </p>

            {/* Connector arrow on desktop (except last) */}
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
            )}
          </motion.div>
        ))}
      </motion.div>

      <p className="font-mono text-xs text-text-dim mt-10 text-center">
        Analyzing thousands of signals from across the internet, daily.
      </p>

      <div className="text-center mt-8">
        <SectionCta text="Start receiving opportunities" variant="secondary" />
      </div>
    </section>
  );
}
