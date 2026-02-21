import type { z } from "zod";
import type {
  SignalSourceSchema,
  TwitterSignalSchema,
  RawCaptureSchema,
} from "@/schemas/capture";
import type {
  TechEntitySchema,
  FrictionPointSchema,
  ScrubberOutputSchema,
  MentionContextSchema,
} from "@/schemas/refinery";
import type { SignalSchema } from "@/schemas/signal";
import type {
  EntityBaselineSchema,
  DailySnapshotSchema,
} from "@/schemas/baseline";
import type { AlphaCardSchema, EvidenceSchema } from "@/schemas/alpha";
import type { BookmarkSchema } from "@/schemas/bookmark";
import type {
  LayerResultSchema,
  PipelineRunSchema,
} from "@/schemas/pipeline";

// Capture types
export type SignalSource = z.infer<typeof SignalSourceSchema>;
export type TwitterSignal = z.infer<typeof TwitterSignalSchema>;
/** @deprecated Use TwitterSignal instead */
export type TweetData = TwitterSignal;
export type RawCapture = z.infer<typeof RawCaptureSchema>;

// Refinery types
export type TechEntity = z.infer<typeof TechEntitySchema>;
export type MentionContext = z.infer<typeof MentionContextSchema>;
export type FrictionPoint = z.infer<typeof FrictionPointSchema>;
export type ScrubberOutput = z.infer<typeof ScrubberOutputSchema>;

// Signal types (replaces PatternCluster)
export type Signal = z.infer<typeof SignalSchema>;

// Baseline types
export type EntityBaseline = z.infer<typeof EntityBaselineSchema>;
export type DailySnapshot = z.infer<typeof DailySnapshotSchema>;

// Alpha types
export type AlphaCard = z.infer<typeof AlphaCardSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type AlphaCategory = AlphaCard["category"];
export type AlphaDirection = AlphaCard["direction"];
export type AlphaStatus = AlphaCard["status"];

// Bookmark types
export type Bookmark = z.infer<typeof BookmarkSchema>;

// Pipeline types
export type LayerResult = z.infer<typeof LayerResultSchema>;
export type PipelineRun = z.infer<typeof PipelineRunSchema>;

// Tier types
export type AlphaTier = "free" | "pro";
