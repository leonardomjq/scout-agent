import Link from "next/link";
import { Lock } from "lucide-react";

type ProField =
  | "friction_detail"
  | "gap_analysis"
  | "timing_signal"
  | "competitive_landscape"
  | "risk_factors"
  | "opportunity_type";

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
};

interface ProFieldTeaserProps {
  field: ProField;
}

export function ProFieldTeaser({ field }: ProFieldTeaserProps) {
  return (
    <div className="rounded-lg bg-surface border border-border p-4">
      <p className="text-text-muted text-sm mb-3">{teasers[field]}</p>
      <div className="blur-sm select-none pointer-events-none mb-3" aria-hidden>
        <div className="space-y-2">
          <div className="h-3 bg-surface-elevated rounded w-full" />
          <div className="h-3 bg-surface-elevated rounded w-5/6" />
          <div className="h-3 bg-surface-elevated rounded w-3/4" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Lock className="size-3.5 shrink-0" />
        <Link
          href="/settings"
          className="text-accent-green hover:underline underline-offset-2"
        >
          Unlock with Pro
        </Link>
      </div>
    </div>
  );
}
