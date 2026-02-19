import { z } from "zod";

export const SignalTypeSchema = z.enum([
  "velocity_spike",
  "sentiment_flip",
  "friction_cluster",
  "new_emergence",
]);

export const SignalDirectionSchema = z.enum([
  "accelerating",
  "decelerating",
  "new",
]);

export const SignalSchema = z.object({
  signal_id: z.string().uuid(),
  type: SignalTypeSchema,
  entities: z.array(z.string()),
  signal_strength: z.number().min(0).max(1),
  friction_theme: z.string().nullable(),
  mention_velocity: z.number(),
  sentiment_delta: z.number(),
  friction_spike: z.number(),
  direction: SignalDirectionSchema,
  evidence_tweet_ids: z.array(z.string()),
  first_detected: z.string().datetime(),
  window_hours: z.number(),
});
