import { z } from "zod";

export const EvidenceSchema = z.object({
  tweet_id: z.string(),
  author: z.string(),
  snippet: z.string(),
  relevance: z.number().min(0).max(1),
});

export const AlphaCardSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  status: z.enum(["fresh", "warm", "cold", "archived"]),
  freshness_score: z.number().min(0).max(1),

  // === FREE TIER (visible to all) ===
  title: z.string(),
  category: z.enum([
    "velocity_spike",
    "sentiment_flip",
    "friction_cluster",
    "new_emergence",
  ]),
  entities: z.array(z.string()),
  signal_strength: z.number().min(0).max(1),
  direction: z.enum(["accelerating", "decelerating", "new"]),
  signal_count: z.number().int(),
  thesis: z.string(),

  // === PRO TIER (gated — nullable for free users) ===
  friction_detail: z.string().nullable(),
  gap_analysis: z.string().nullable(),
  timing_signal: z.string().nullable(),
  risk_factors: z.array(z.string()).nullable(),
  evidence: z.array(EvidenceSchema).nullable(),
  competitive_landscape: z.string().nullable(),
  opportunity_type: z
    .enum(["tooling_gap", "migration_aid", "dx_improvement", "integration"])
    .nullable(),

  // === BLUEPRINT (Pro — strategic direction) ===
  mvp_scope: z.string().nullable(),
  monetization_angle: z.string().nullable(),
  target_buyer: z.string().nullable(),
  distribution_channels: z.string().nullable(),

  // === METADATA ===
  cluster_id: z.string().uuid(),
});
