import { z } from "zod";
import { ID } from "node-appwrite";
import pLimit from "p-limit";
import { createAdminClient } from "@/lib/appwrite/admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { toJsonString } from "@/lib/appwrite/helpers";
import { extractStructured } from "@/lib/ai";
import {
  TechEntitySchema,
  FrictionPointSchema,
  ScrubberOutputSchema,
} from "@/schemas/refinery";
import type { SignalSource, TwitterSignal, ScrubberOutput, TechEntity, FrictionPoint } from "@/types";

const BATCH_SIZE = 25;
const CONCURRENCY = 5;

// Heuristic spam filter — catches engagement bait, giveaways, etc.
const NOISE_PATTERNS = [
  /\bgiveaway\b/i,
  /\bairdrop\b/i,
  /\bfollow.*retweet\b/i,
  /\bwin\s+\$?\d/i,
  /\b(dm|DM)\s+me\b/i,
  /\bcheck\s+my\s+bio\b/i,
  /\bfree\s+nft\b/i,
  /\b🚀{3,}/,
];

export function isNoise(content: string): boolean {
  return NOISE_PATTERNS.some((p) => p.test(content));
}

export function filterSignals(signals: SignalSource[]): SignalSource[] {
  return signals.filter((s) => !isNoise(s.content));
}

// Schema for LLM batch extraction — now includes mention_context
const BatchExtractionSchema = z.object({
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

type BatchExtraction = z.infer<typeof BatchExtractionSchema>;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function formatSignalForPrompt(signal: SignalSource): string {
  switch (signal.source_type) {
    case "twitter": {
      const t = signal as TwitterSignal;
      return `[${t.tweet_id}] @${t.author_handle} (${t.author_followers} followers): ${t.content.slice(0, 500)}`;
    }
    case "github":
      return `[github:${signal.repo}] ${signal.event_type}: ${signal.content.slice(0, 500)} (stars Δ${signal.stars_delta}, issues Δ${signal.issues_delta})`;
    case "hackernews":
      return `[hn:${signal.post_id}] ${signal.content.slice(0, 500)} (${signal.points} points, ${signal.comment_count} comments)`;
    case "reddit":
      return `[reddit:r/${signal.subreddit}:${signal.post_id}] ${signal.content.slice(0, 500)} (${signal.upvotes} upvotes)`;
  }
}

function getSignalId(signal: SignalSource): string {
  switch (signal.source_type) {
    case "twitter":
      return signal.tweet_id;
    case "github":
      return `gh:${signal.repo}:${signal.event_type}`;
    case "hackernews":
      return `hn:${signal.post_id}`;
    case "reddit":
      return `rd:${signal.post_id}`;
  }
}

function getSourceTypeLabel(sourceType: SignalSource["source_type"]): string {
  switch (sourceType) {
    case "twitter":
      return "developer tweets";
    case "github":
      return "GitHub events";
    case "hackernews":
      return "Hacker News posts";
    case "reddit":
      return "Reddit posts";
  }
}

async function extractBatch(
  signals: SignalSource[]
): Promise<{ data: BatchExtraction | null; tokensUsed: number; error?: string }> {
  const sourceType = signals[0]?.source_type ?? "twitter";
  const summaries = signals
    .map((s) => formatSignalForPrompt(s))
    .join("\n\n");

  const result = await extractStructured<BatchExtraction>({
    model: "claude-haiku",
    system: `You are a tech-market intelligence analyst. Extract structured signals from ${getSourceTypeLabel(sourceType)}.
Focus on: technology shifts, developer friction points, emerging tools, sentiment changes.
Be precise with entity categorization and friction severity assessment.

For each entity, include a mention_context classifying WHY it was mentioned:
- announcement: new release, launch, or official update
- complaint: expressing frustration, reporting bugs, or criticism
- migration: switching from/to this technology
- comparison: comparing with alternatives
- praise: positive experience or endorsement
- question: asking about or seeking help with`,
    prompt: `Analyze these developer signals and extract:
1. Tech entities mentioned (frameworks, languages, tools, platforms, protocols, concepts) with sentiment, mention_context, and friction signals
2. Friction points (pain points, bugs, migration issues) with severity
3. Notable items with relevance scores (0-1) and extracted insights

Signals:
${summaries}`,
    schema: BatchExtractionSchema,
  });

  if ("error" in result) {
    return { data: null, tokensUsed: result.tokensUsed, error: result.error };
  }
  return { data: result.data, tokensUsed: result.tokensUsed };
}

export interface ScrubberResult {
  output: ScrubberOutput;
  tokensUsed: number;
  errors: Array<{ batchIndex: number; error: string }>;
}

export async function runScrubber(
  captureId: string,
  signals: SignalSource[],
  processedIds: Set<string>
): Promise<ScrubberResult> {
  // Dedup at signal level
  const newSignals = signals.filter((s) => !processedIds.has(getSignalId(s)));

  // Spam filter only — no keyword pre-filter
  const cleanSignals = filterSignals(newSignals);

  // Batch and extract
  const batches = chunkArray(cleanSignals, BATCH_SIZE);
  const limit = pLimit(CONCURRENCY);
  let totalTokens = 0;
  const errors: Array<{ batchIndex: number; error: string }> = [];

  const allEntities: TechEntity[] = [];
  const allFriction: FrictionPoint[] = [];
  const allNotable: BatchExtraction["notable_tweets"] = [];

  const results = await Promise.allSettled(
    batches.map((batch, idx) =>
      limit(async () => {
        const result = await extractBatch(batch);
        totalTokens += result.tokensUsed;
        if (result.error || !result.data) {
          errors.push({ batchIndex: idx, error: result.error ?? "No data returned" });
          return;
        }
        allEntities.push(...result.data.entities);
        allFriction.push(...result.data.friction_points);
        allNotable.push(...result.data.notable_tweets);
      })
    )
  );

  // Check for unexpected rejections
  results.forEach((r, idx) => {
    if (r.status === "rejected") {
      errors.push({ batchIndex: idx, error: String(r.reason) });
    }
  });

  // Merge duplicate entities by name (keep mention_context from highest individual count)
  const entityMap = new Map<string, TechEntity>();
  const bestMentions = new Map<string, number>();
  for (const entity of allEntities) {
    const key = entity.name.toLowerCase();
    const existing = entityMap.get(key);
    if (existing) {
      existing.mentions += entity.mentions;
      if (entity.friction_signal) existing.friction_signal = true;
      // Keep mention_context from the entry with the highest individual count
      if (entity.mentions > (bestMentions.get(key) ?? 0)) {
        bestMentions.set(key, entity.mentions);
        existing.mention_context = entity.mention_context;
      }
    } else {
      entityMap.set(key, { ...entity });
      bestMentions.set(key, entity.mentions);
    }
  }

  const output: ScrubberOutput = {
    capture_id: captureId,
    processed_at: new Date().toISOString(),
    total_input: signals.length,
    total_passed: cleanSignals.length,
    entities: Array.from(entityMap.values()),
    friction_points: allFriction,
    notable_tweets: allNotable,
  };

  // Validate output
  ScrubberOutputSchema.parse(output);

  return { output, tokensUsed: totalTokens, errors };
}

export async function persistScrubberOutput(
  output: ScrubberOutput,
  signalIds: string[]
): Promise<void> {
  const { databases } = createAdminClient();

  // Insert scrubber output
  await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.SCRUBBER_OUTPUTS,
    ID.unique(),
    {
      capture_id: output.capture_id,
      processed_at: output.processed_at,
      total_input: output.total_input,
      total_passed: output.total_passed,
      entities: toJsonString(output.entities),
      friction_points: toJsonString(output.friction_points),
      notable_tweets: toJsonString(output.notable_tweets),
    }
  );

  // Mark signals as processed (catch 409 for duplicate unique index)
  if (signalIds.length > 0) {
    const results = await Promise.allSettled(
      signalIds.map((id) =>
        databases
          .createDocument(
            DATABASE_ID,
            COLLECTIONS.PROCESSED_TWEET_IDS,
            ID.unique(),
            {
              tweet_id: id,
              capture_id: output.capture_id,
            }
          )
          .catch((err: unknown) => {
            const e = err as { code?: number };
            // 409 = duplicate unique index — already processed, safe to ignore
            if (e.code !== 409) throw err;
          })
      )
    );

    const failures = results.filter((r) => r.status === "rejected");
    for (const f of failures) {
      console.error("persistScrubberOutput write failed:", (f as PromiseRejectedResult).reason);
    }
    if (failures.length > signalIds.length / 2) {
      throw new Error(`persistScrubberOutput: ${failures.length}/${signalIds.length} writes failed (>50%)`);
    }
  }
}
