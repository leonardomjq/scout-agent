"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { landingStagger, landingStaggerItem } from "@/lib/landing-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      { label: "Alpha Card titles & categories", included: true },
      { label: "Momentum scores & direction", included: true },
      { label: "Entity tags", included: true },
      { label: "Full thesis & strategy", included: false },
      { label: "Risk factors & evidence", included: false },
      { label: "Build This blueprints", included: false },
    ],
    cta: "Start Free — No Credit Card",
    subCta: "Upgrade anytime",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    features: [
      { label: "Everything in Free", included: true },
      { label: "Full thesis & strategy", included: true },
      { label: "Risk factors & evidence", included: true },
      { label: "Build This blueprints", included: true },
      { label: "Friction details & opportunity windows", included: true },
      { label: "Priority signal processing", included: true },
    ],
    cta: "Start Pro — 7 Day Guarantee",
    subCta: "Full refund, no questions asked",
    href: "/signup",
    highlight: true,
  },
];

const faq = [
  {
    question: "What signals do you monitor?",
    answer:
      "We track developer conversations and activity across Twitter/X, GitHub (stars, forks, issues), Hacker News, and Reddit. Our AI pipeline processes thousands of signals daily to detect emerging traction patterns.",
  },
  {
    question: "How is this different from Twitter search?",
    answer:
      "Twitter search shows you individual posts. ScoutAgent correlates signals across multiple platforms, detects statistical anomalies against 7-day baselines, and synthesizes them into actionable briefs with evidence and timing. It's the difference between raw data and intelligence.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, cancel in one click from your dashboard. No contracts, no cancellation fees. Your Pro features stay active through the end of your billing period.",
  },
  {
    question: "What happens if I downgrade?",
    answer:
      "You keep access to all your existing Alpha Cards, but pro-only fields (strategy, risk factors, build blueprints) become blurred. You can upgrade again anytime to restore full access.",
  },
];

export function Pricing() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="pricing" className="px-6 py-20 max-w-4xl mx-auto" ref={ref}>
      <div className="font-mono text-[10px] text-landing-muted uppercase tracking-widest mb-2">
        Access Levels
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-landing-text mb-2">
        Early Adopter Pricing
      </h2>
      <p className="font-[family-name:var(--font-serif)] text-landing-archival text-sm mb-2">
        A junior research analyst costs $5,000/mo. ScoutAgent runs 24/7 for
        less than a coffee a day.
      </p>
      <p className="font-mono text-xs text-landing-urgency mb-12">
        Lock in $19/mo before we raise prices.
      </p>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={landingStagger}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            className={`texture-paper bg-landing-surface rounded-lg p-6 flex flex-col ${
              plan.highlight
                ? "border border-landing-signal/40 shadow-[0_0_30px_-10px_rgba(0,229,179,0.15)]"
                : "border border-dashed border-landing-muted/30"
            }`}
            variants={landingStaggerItem}
          >
            {plan.highlight && (
              <div className="font-mono text-[10px] uppercase tracking-widest text-landing-signal mb-4">
                Recommended
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-landing-text mb-1">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-3xl font-bold text-landing-text">
                  {plan.price}
                </span>
                <span className="font-mono text-sm text-landing-muted">
                  {plan.period}
                </span>
              </div>
            </div>

            <ul className="space-y-3 flex-1 mb-6">
              {plan.features.map((f) => (
                <li
                  key={f.label}
                  className="flex items-start gap-2 text-sm"
                >
                  {f.included ? (
                    <Check className="size-4 text-landing-signal shrink-0 mt-0.5" />
                  ) : (
                    <X className="size-4 text-landing-muted/40 shrink-0 mt-0.5" />
                  )}
                  <span
                    className={`font-[family-name:var(--font-serif)] ${
                      f.included
                        ? "text-landing-text"
                        : "text-landing-muted/60"
                    }`}
                  >
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={`font-mono text-sm text-center py-2.5 rounded transition-all ${
                plan.highlight
                  ? "bg-landing-signal text-[#0A0A0A] font-medium hover:opacity-90"
                  : "border border-landing-muted/30 text-landing-archival hover:text-landing-text hover:border-landing-archival/50"
              }`}
            >
              {plan.cta}
            </Link>
            <p className="font-mono text-[10px] text-landing-muted text-center mt-2">
              {plan.subCta}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* FAQ */}
      <div className="mt-16">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-landing-text mb-6">
          Frequently Asked Questions
        </h3>
        <div className="space-y-0 border-t border-landing-muted/20">
          {faq.map((item) => (
            <details
              key={item.question}
              className="group border-b border-landing-muted/20"
            >
              <summary className="flex items-center justify-between py-4 cursor-pointer font-mono text-sm text-landing-text hover:text-landing-signal transition-colors list-none [&::-webkit-details-marker]:hidden">
                {item.question}
                <span className="text-landing-muted group-open:rotate-45 transition-transform text-lg leading-none">
                  +
                </span>
              </summary>
              <p className="font-[family-name:var(--font-serif)] text-sm text-landing-archival leading-relaxed pb-4">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
