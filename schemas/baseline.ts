import { z } from "zod";

export const DailySnapshotSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  mentions: z.number().int().nonnegative(),
  sentiment: z.number().min(0).max(1),
  friction_rate: z.number().min(0).max(1),
});

export const EntityBaselineSchema = z.object({
  entity_name: z.string(),
  category: z.string(),
  baseline_mentions_per_day: z.number().nonnegative(),
  baseline_sentiment: z.number().min(0).max(1),
  baseline_friction_rate: z.number().min(0).max(1),
  last_updated: z.string().datetime(),
  daily_snapshots: z.array(DailySnapshotSchema).max(7),
});
