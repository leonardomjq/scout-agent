import { z } from "zod";

export const MentionContextSchema = z.enum([
  "announcement",
  "complaint",
  "migration",
  "comparison",
  "praise",
  "question",
]);

export const TechEntitySchema = z.object({
  name: z.string(),
  category: z.enum([
    "framework",
    "language",
    "tool",
    "platform",
    "protocol",
    "concept",
  ]),
  sentiment: z.enum(["positive", "negative", "neutral"]),
  mention_context: MentionContextSchema,
  friction_signal: z.boolean(),
  mentions: z.number().int().nonnegative(),
});

export const FrictionPointSchema = z.object({
  entity: z.string(),
  signal: z.string(),
  source_tweet_ids: z.array(z.string()),
  severity: z.enum(["low", "medium", "high"]),
});

export const ScrubberOutputSchema = z.object({
  capture_id: z.string().uuid(),
  processed_at: z.string().datetime(),
  total_input: z.number().int(),
  total_passed: z.number().int(),
  entities: z.array(TechEntitySchema),
  friction_points: z.array(FrictionPointSchema),
  notable_tweets: z.array(
    z.object({
      tweet_id: z.string(),
      relevance_score: z.number().min(0).max(1),
      extracted_insight: z.string(),
    })
  ),
});
