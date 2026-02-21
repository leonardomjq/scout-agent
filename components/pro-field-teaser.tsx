import Link from "next/link";
import { Lock } from "lucide-react";

export type ProField =
  | "friction_detail"
  | "gap_analysis"
  | "timing_signal"
  | "competitive_landscape"
  | "risk_factors"
  | "opportunity_type"
  | "mvp_scope"
  | "monetization_angle"
  | "target_buyer"
  | "distribution_channels";

const teasers: Record<ProField, string> = {
  friction_detail:
    "Specific pain points and frustrations users are expressing about current solutions",
  gap_analysis:
    "Underserved needs and market gaps where demand outpaces supply",
  timing_signal:
    "Optimal entry window and urgency indicators \u2014 how long this opportunity stays open",
  competitive_landscape:
    "Who else is building in this space and where the whitespace is",
  risk_factors:
    "Key risks, market challenges, and potential blockers to evaluate before building",
  opportunity_type:
    "Opportunity classification and recommended strategic angle for this market signal",
  mvp_scope:
    "The smallest product that captures this opportunity \u2014 one workflow, not a platform",
  monetization_angle:
    "How to charge, what pricing model fits, and evidence of willingness to pay",
  target_buyer:
    "The specific person who buys this \u2014 their context, their trigger, their urgency",
  distribution_channels:
    "Where these buyers gather and how to reach the first 10 customers",
};

const valueHooks: Record<ProField, string> = {
  friction_detail: "Know the exact words your future users are saying.",
  gap_analysis: "See where demand outpaces supply \u2014 right now.",
  timing_signal: "See the optimal entry timing.",
  competitive_landscape: "Know who\u2019s already building before you start.",
  risk_factors: "Every opportunity has a kill switch. See this one\u2019s.",
  opportunity_type: "Your strategic playbook for this market gap.",
  mvp_scope: "Know exactly what to build first.",
  monetization_angle: "See how the money flows before you write a line.",
  target_buyer: "Stop guessing who your customer is.",
  distribution_channels: "Find your first 10 customers before you ship.",
};

interface ProFieldTeaserProps {
  field: ProField;
  onUnlock?: () => void;
}

export function ProFieldTeaser({ field, onUnlock }: ProFieldTeaserProps) {
  return (
    <div className="rounded-lg bg-surface border border-border p-5">
      <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm mb-2">{teasers[field]}</p>
      <p className="font-mono text-accent-green text-xs mb-4">{valueHooks[field]}</p>
      <div className="blur-sm select-none pointer-events-none mb-3" aria-hidden>
        <div className="space-y-2">
          <div className="h-3 bg-surface-elevated rounded w-full" />
          <div className="h-3 bg-surface-elevated rounded w-5/6" />
          <div className="h-3 bg-surface-elevated rounded w-3/4" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Lock className="size-3.5 shrink-0" />
        {onUnlock ? (
          <button
            onClick={onUnlock}
            className="text-accent-green hover:underline underline-offset-2"
          >
            Unlock with Pro
          </button>
        ) : (
          <Link
            href="/settings"
            className="text-accent-green hover:underline underline-offset-2"
          >
            Unlock with Pro
          </Link>
        )}
      </div>
    </div>
  );
}
