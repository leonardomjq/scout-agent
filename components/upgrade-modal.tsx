"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStripeRedirect } from "@/hooks/use-stripe-redirect";
import type { ProField } from "@/components/pro-field-teaser";

type Interval = "monthly" | "annual";

const fieldHeadlines: Record<ProField, string> = {
  friction_detail: "See exactly what users are complaining about",
  gap_analysis: "See where the market whitespace is",
  timing_signal: "See how long this window stays open",
  competitive_landscape: "See who else is building here",
  risk_factors: "See what could kill this opportunity",
  opportunity_type: "See the recommended strategic angle",
};

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardTitle?: string;
  cardId?: string;
  triggerField?: ProField;
  urgencyText?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  cardTitle,
  cardId,
  triggerField,
  urgencyText,
}: UpgradeModalProps) {
  const [interval, setInterval] = useState<Interval>("annual");

  const returnTo = cardId ? `/alpha/${cardId}` : "/settings";
  const { redirect: handleUpgrade, loading } = useStripeRedirect(
    `/api/stripe/checkout?interval=${interval}&returnTo=${encodeURIComponent(returnTo)}`,
    "Could not start checkout. Please try again."
  );

  const headline = triggerField
    ? fieldHeadlines[triggerField]
    : "Unlock the full opportunity brief";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-modal flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card padding="spacious" className="relative max-w-sm w-full mx-4 text-center">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-text-muted hover:text-text transition-colors"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>

              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-2">{headline}</h3>

              {cardTitle && (
                <p className="text-accent-green font-mono text-sm mb-4 line-clamp-2">
                  {cardTitle}
                </p>
              )}

              {urgencyText && (
                <p className="text-accent-orange text-xs font-mono mb-3">
                  {urgencyText}
                </p>
              )}

              {/* Billing toggle */}
              <div className="flex items-center justify-center gap-1 mb-3">
                <button
                  type="button"
                  onClick={() => setInterval("monthly")}
                  className={`text-xs font-mono px-3 py-1 rounded transition-colors ${
                    interval === "monthly"
                      ? "bg-accent-green/20 text-accent-green"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setInterval("annual")}
                  className={`text-xs font-mono px-3 py-1 rounded transition-colors ${
                    interval === "annual"
                      ? "bg-accent-green/20 text-accent-green"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  Annual
                </button>
              </div>

              <div className="mb-4">
                <span className="text-2xl font-bold font-mono">
                  {interval === "annual" ? "$24" : "$29"}
                </span>
                <span className="text-text-muted text-sm">/mo</span>
                {interval === "annual" && (
                  <p className="text-xs text-accent-green font-mono mt-1">
                    $288/yr &mdash; save $60
                  </p>
                )}
              </div>

              <Button onClick={handleUpgrade} disabled={loading} className="w-full mb-3">
                {loading
                  ? "Loading..."
                  : `Unlock This Brief \u2014 $${interval === "annual" ? "24" : "29"}/mo`}
              </Button>

              <p className="text-text-muted text-xs mb-2">
                Cancel anytime. 7-day money-back guarantee.
              </p>

              <button
                onClick={onClose}
                className="text-text-muted text-xs hover:text-text transition-colors"
              >
                Maybe later
              </button>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
