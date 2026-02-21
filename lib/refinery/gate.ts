import type { AlphaCard, AlphaTier } from "@/types";

const PRO_FIELDS = [
  "friction_detail",
  "gap_analysis",
  "timing_signal",
  "risk_factors",
  "competitive_landscape",
  "opportunity_type",
  "mvp_scope",
  "monetization_angle",
  "target_buyer",
  "distribution_channels",
] as const;

/**
 * Gate an Alpha Card based on user tier.
 *
 * Free tier sees: title, category, entities, signal_strength, direction,
 * signal_count, thesis, and truncated evidence (first 2 items).
 *
 * Pro tier sees everything.
 */
export function gateAlphaCard(card: AlphaCard, tier: AlphaTier): AlphaCard {
  if (tier === "pro") return card;

  const gated = { ...card };

  // Nullify pro-only text fields
  for (const field of PRO_FIELDS) {
    (gated as Record<string, unknown>)[field] = null;
  }

  // Truncate evidence to 2 items for free tier (enough to validate the signal)
  if (gated.evidence) {
    gated.evidence = gated.evidence.slice(0, 2);
  }

  return gated;
}
