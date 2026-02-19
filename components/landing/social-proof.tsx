"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { landingStagger, landingStaggerItem } from "@/lib/landing-motion";

const audiences = [
  "Indie Hackers",
  "Technical Founders",
  "Early-Stage VCs",
  "Dev Tool Builders",
];

const sources = ["Twitter / X", "GitHub", "Hacker News", "Reddit"];

export function SocialProof() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="px-6 py-20 max-w-4xl mx-auto" ref={ref}>
      <motion.div
        className="text-center"
        variants={landingStagger}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Built For */}
        <motion.div variants={landingStaggerItem}>
          <div className="font-mono text-[10px] text-landing-muted uppercase tracking-widest mb-4">
            Built For
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {audiences.map((audience) => (
              <span
                key={audience}
                className="font-mono text-xs border border-landing-muted/30 text-landing-text rounded-full px-4 py-1.5"
              >
                {audience}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Source Platforms */}
        <motion.div variants={landingStaggerItem}>
          <div className="font-mono text-[10px] text-landing-muted uppercase tracking-widest mb-4">
            Monitoring signals from
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {sources.map((source) => (
              <span
                key={source}
                className="font-mono text-sm text-landing-archival"
              >
                {source}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
