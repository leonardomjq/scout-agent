"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { clipRevealStagger, clipRevealItem } from "@/lib/motion";

type Interval = "monthly" | "annual";

const faq = [
  {
    question: "What sources do you scan?",
    answer:
      "We scan conversations and activity across Twitter/X, GitHub, Hacker News, and Reddit. Our AI processes thousands of signals daily to detect demand spikes, frustration clusters, and market gaps before they become obvious.",
  },
  {
    question: "Can\u2019t I just use ChatGPT or Perplexity for this?",
    answer:
      "ChatGPT answers questions you already have. ScoutAgent finds opportunities you didn\u2019t know existed. It\u2019s proactive intelligence vs reactive research \u2014 you don\u2019t need to know what to ask, because the right questions are the ones you\u2019d never think to search for.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, cancel in one click from your dashboard. No contracts, no cancellation fees. Your Pro features stay active through the end of your billing period.",
  },
  {
    question: "What happens if I downgrade?",
    answer:
      "You keep access to all your existing Alpha Cards, but pro-only fields (strategy, blueprints, risk factors, competitive landscape) become blurred and your bookmarks are capped at 3. You can upgrade again anytime to restore full access.",
  },
];

function getPlans(interval: Interval) {
  return [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        { label: "Opportunity titles & categories", included: true },
        { label: "Momentum scores & direction", included: true },
        { label: "Entity tags", included: true },
        { label: "2 evidence items per card", included: true },
        { label: "3 saved bookmarks", included: true },
        { label: "Full strategy & blueprints", included: false },
        { label: "Pulse trend overview", included: false },
      ],
      cta: "Start Free — No Credit Card",
      subCta: "Upgrade anytime",
      href: "/signup",
      highlight: false,
    },
    {
      name: "Pro",
      price: interval === "annual" ? "$24" : "$29",
      period: interval === "annual" ? "/mo billed annually" : "/mo",
      features: [
        { label: "Everything in Free", included: true },
        { label: "Full evidence trail", included: true },
        { label: "Competitive landscape & risk factors", included: true },
        { label: "The Blueprint — MVP, buyer, monetization, distribution", included: true },
        { label: "Unlimited bookmarks", included: true },
        { label: "Pulse — trends & week-over-week momentum", included: true },
      ],
      cta: "Start Pro — 7 Day Guarantee",
      subCta: "Full refund, no questions asked",
      href: "/signup",
      highlight: true,
    },
  ];
}

export function Pricing() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [interval, setInterval] = useState<Interval>("annual");
  const plans = getPlans(interval);

  return (
    <section id="pricing" className="px-6 py-20 max-w-4xl mx-auto" ref={ref}>
      <div className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-2">
        Access Levels
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-text mb-2">
        Early Adopter Pricing
      </h2>
      <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm mb-2">
        One competitive intelligence report costs $500+. ScoutAgent delivers
        fresh opportunity briefs every 72 hours.
      </p>
      <p className="font-mono text-xs text-accent-orange mb-6">
        Lock in early adopter pricing before we raise rates.
      </p>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-1 mb-12">
        <button
          type="button"
          onClick={() => setInterval("monthly")}
          className={`font-mono text-xs px-4 py-1.5 rounded transition-colors ${
            interval === "monthly"
              ? "bg-accent-green/10 text-accent-green"
              : "text-text-dim hover:text-text"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setInterval("annual")}
          className={`font-mono text-xs px-4 py-1.5 rounded transition-colors ${
            interval === "annual"
              ? "bg-accent-green/10 text-accent-green"
              : "text-text-dim hover:text-text"
          }`}
        >
          Annual
        </button>
        {interval === "annual" && (
          <span className="font-mono text-[10px] text-accent-orange ml-2">
            save 17%
          </span>
        )}
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={clipRevealStagger}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            className={`texture-paper bg-surface rounded-lg p-6 flex flex-col ${
              plan.highlight
                ? "border border-accent-green/40 shadow-[0_0_30px_-10px_rgba(0,229,179,0.15)]"
                : "border border-dashed border-text-dim/30"
            }`}
            variants={clipRevealItem}
          >
            {plan.highlight && (
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent-green mb-4">
                Recommended
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-text mb-1">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-3xl font-bold text-text">
                  {plan.price}
                </span>
                <span className="font-mono text-sm text-text-dim">
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
                    <Check className="size-4 text-accent-green shrink-0 mt-0.5" />
                  ) : (
                    <X className="size-4 text-text-dim/40 shrink-0 mt-0.5" />
                  )}
                  <span
                    className={`font-[family-name:var(--font-serif)] ${
                      f.included
                        ? "text-text"
                        : "text-text-dim/60"
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
                  ? "bg-accent-green text-[#0A0A0A] font-medium hover:opacity-90"
                  : "border border-text-dim/30 text-text-muted hover:text-text hover:border-text-muted/50"
              }`}
            >
              {plan.cta}
            </Link>
            <p className="font-mono text-[10px] text-text-dim text-center mt-2">
              {plan.subCta}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* FAQ */}
      <div className="mt-16">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-text mb-6">
          Frequently Asked Questions
        </h3>
        <div className="space-y-0 border-t border-text-dim/20">
          {faq.map((item) => (
            <FaqItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-text-dim/20">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-between w-full py-4 font-mono text-sm text-text hover:text-accent-green transition-colors text-left"
      >
        {question}
        <span
          className={`text-text-dim text-lg leading-none transition-transform duration-200 shrink-0 ml-4 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="font-[family-name:var(--font-serif)] text-sm text-text-muted leading-relaxed pb-4">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
