import { v4 as uuidv4 } from "uuid";
import { Query } from "node-appwrite";
import pLimit from "p-limit";
import { createAdminClient } from "@/lib/appwrite/admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { toJsonString, fromJsonString } from "@/lib/appwrite/helpers";
import { runScrubber, persistScrubberOutput } from "./scrubber";
import { updateBaselines } from "./baselines";
import {
  runDeltaEngine,
  persistSignals,
} from "./pattern-matcher";
import {
  synthesizeAlphaCard,
  persistAlphaCard,
} from "./strategist";
import type { PipelineRun, SignalSource, ScrubberOutput, Signal } from "@/types";
import { PipelineRunSchema } from "@/schemas/pipeline";

interface PipelineResult {
  run: PipelineRun;
}

const LOCK_DOC_ID = "pipeline_lock";

export async function runPipeline(): Promise<PipelineResult> {
  const { databases } = createAdminClient();

  // Atomic lock: createDocument with fixed ID → 409 if already locked
  try {
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PIPELINE_LOCKS,
      LOCK_DOC_ID,
      {}
    );
  } catch (err: unknown) {
    const e = err as { code?: number };
    if (e.code === 409) {
      throw new Error("Pipeline already running — concurrent execution prevented");
    }
    throw err;
  }

  // Create pipeline run record
  const runId = uuidv4();
  const startedAt = new Date().toISOString();

  await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.PIPELINE_RUNS,
    runId,
    {
      started_at: startedAt,
      status: "running",
      captures_processed: 0,
      l1_stats: toJsonString({ input: 0, passed: 0, failed: 0 }),
      l2_stats: toJsonString({ signals_found: 0, signals_qualifying: 0, baselines_updated: 0 }),
      l3_stats: toJsonString({ cards_generated: 0, cards_updated: 0, failed: 0 }),
      total_tokens_used: 0,
      errors: [],
    }
  );

  const errors: string[] = [];
  let totalTokens = 0;
  let l1Stats = { input: 0, passed: 0, failed: 0 };
  let l2Stats = { signals_found: 0, signals_qualifying: 0, baselines_updated: 0 };
  let l3Stats = { cards_generated: 0, cards_updated: 0, failed: 0 };
  let capturesProcessed = 0;
  let finalStatus: "completed" | "failed" = "failed";

  try {
    // ========== LAYER 1: Scrubber ==========
    // Fetch pending captures
    const pendingCaptures = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.RAW_CAPTURES,
      [
        Query.equal("status", ["pending"]),
        Query.orderAsc("$createdAt"),
        Query.limit(10),
      ]
    );

    if (pendingCaptures.total === 0) {
      const run = await finalizePipeline(databases, runId, startedAt, "completed", {
        capturesProcessed: 0,
        l1Stats,
        l2Stats,
        l3Stats,
        totalTokens,
        errors: ["No pending captures to process"],
      });
      return { run };
    }

    // Get already-processed signal IDs (paginate through all)
    const processedIds = new Set<string>();
    let cursor: string | undefined;
    while (true) {
      const queries = [Query.limit(5000)];
      if (cursor) queries.push(Query.cursorAfter(cursor));
      const page = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PROCESSED_TWEET_IDS,
        queries
      );
      for (const doc of page.documents) {
        processedIds.add(doc.tweet_id as string);
      }
      if (page.documents.length < 5000) break;
      cursor = page.documents[page.documents.length - 1].$id;
    }

    const scrubberOutputs: ScrubberOutput[] = [];
    // Collect original signals for L3 context (keyed by signal ID)
    const originalSignalMap = new Map<string, SignalSource>();

    for (const capture of pendingCaptures.documents) {
      // Mark as processing
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.RAW_CAPTURES,
        capture.$id,
        { status: "processing" }
      );

      try {
        const payload = fromJsonString<{ signals?: SignalSource[]; tweets?: SignalSource[] }>(
          capture.payload as string
        );
        // Support both old "tweets" and new "signals" field names
        const signals = payload.signals ?? payload.tweets ?? [];
        l1Stats.input += signals.length;

        // Index original signals by their ID for L3 context
        for (const s of signals) {
          const sid = "tweet_id" in s ? s.tweet_id
            : "post_id" in s ? `${s.source_type}:${s.post_id}`
            : "repo" in s ? `gh:${s.repo}` : "";
          if (sid) originalSignalMap.set(sid, s);
        }

        const scrubberResult = await runScrubber(
          capture.capture_id as string,
          signals,
          processedIds
        );

        totalTokens += scrubberResult.tokensUsed;
        l1Stats.passed += scrubberResult.output.total_passed;
        l1Stats.failed += scrubberResult.errors.length;

        // Persist L1 output
        const signalIds = signals.map((s) => {
          if ("tweet_id" in s) return s.tweet_id;
          if ("post_id" in s) return `${s.source_type}:${s.post_id}`;
          if ("repo" in s) return `gh:${s.repo}`;
          return "";
        });

        await persistScrubberOutput(scrubberResult.output, signalIds);

        scrubberOutputs.push(scrubberResult.output);

        // Mark processed IDs in our local set
        for (const id of signalIds) processedIds.add(id);

        // Mark capture as processed
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.RAW_CAPTURES,
          capture.$id,
          { status: "processed" }
        );

        capturesProcessed++;
        for (const err of scrubberResult.errors) {
          errors.push(`L1 batch ${err.batchIndex}: ${err.error}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`L1 capture ${capture.capture_id}: ${msg}`);
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.RAW_CAPTURES,
          capture.$id,
          { status: "failed", error_message: msg }
        );
      }
    }

    // ========== LAYER 2: Delta Engine ==========
    // Get all recent scrubber outputs (last 48h)
    const windowStart = new Date(
      Date.now() - 48 * 60 * 60 * 1000
    ).toISOString();

    // TODO: paginate at scale — currently limited to 500 most recent outputs
    const recentOutputDocs = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SCRUBBER_OUTPUTS,
      [Query.greaterThanEqual("processed_at", windowStart), Query.limit(500)]
    );

    const recentOutputs: ScrubberOutput[] = recentOutputDocs.documents.map(
      (row) => ({
        capture_id: row.capture_id as string,
        processed_at: row.processed_at as string,
        total_input: row.total_input as number,
        total_passed: row.total_passed as number,
        entities: fromJsonString(row.entities as string),
        friction_points: fromJsonString(row.friction_points as string),
        notable_tweets: fromJsonString(row.notable_tweets as string),
      })
    );

    // Update baselines from latest data
    const { updated: baselinesUpdated, baselines } = await updateBaselines(recentOutputs);
    l2Stats.baselines_updated = baselinesUpdated;

    // Get previous signals for delta computation
    const prevSignalDocs = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SIGNALS,
      [Query.orderDesc("$createdAt"), Query.limit(100)]
    );

    const previousSignals: Signal[] = prevSignalDocs.documents.map((s) => ({
      signal_id: s.signal_id as string,
      type: s.type as Signal["type"],
      entities: s.entities as string[],
      signal_strength: Number(s.signal_strength),
      friction_theme: (s.friction_theme as string) ?? null,
      mention_velocity: Number(s.mention_velocity),
      sentiment_delta: Number(s.sentiment_delta),
      friction_spike: Number(s.friction_spike),
      direction: s.direction as Signal["direction"],
      evidence_tweet_ids: (s.evidence_tweet_ids as string[]) ?? [],
      first_detected: s.first_detected as string,
      window_hours: Number(s.window_hours),
    }));

    const deltaResult = await runDeltaEngine(
      recentOutputs,
      baselines,
      previousSignals
    );

    l2Stats.signals_found = deltaResult.totalFound;
    l2Stats.signals_qualifying = deltaResult.qualifyingSignals.length;

    // Persist L2 output
    await persistSignals(deltaResult.qualifyingSignals);

    // ========== LAYER 3: Strategist (parallel with concurrency limit) ==========
    const l3Limit = pLimit(3);
    const l3Results = await Promise.allSettled(
      deltaResult.qualifyingSignals.map((signal) =>
        l3Limit(async () => {
          const strategistResult = await synthesizeAlphaCard(
            signal,
            recentOutputs,
            baselines,
            originalSignalMap
          );
          totalTokens += strategistResult.tokensUsed;

          if (strategistResult.error || !strategistResult.card) {
            l3Stats.failed++;
            errors.push(
              `L3 signal ${signal.signal_id}: ${strategistResult.error ?? "No card generated"}`
            );
            return;
          }

          await persistAlphaCard(strategistResult.card);
          l3Stats.cards_generated++;
        })
      )
    );

    // Count unexpected rejections
    for (const r of l3Results) {
      if (r.status === "rejected") {
        l3Stats.failed++;
        const msg = r.reason instanceof Error ? r.reason.message : String(r.reason);
        errors.push(`L3 unexpected: ${msg}`);
      }
    }

    finalStatus = "completed";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(msg);
    finalStatus = "failed";
  } finally {
    // Always release the lock, even if finalize throws
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PIPELINE_LOCKS, LOCK_DOC_ID);
    } catch {
      // Lock may already be gone (e.g. manual cleanup) — safe to ignore
    }
  }

  const run = await finalizePipeline(databases, runId, startedAt, finalStatus, {
    capturesProcessed,
    l1Stats,
    l2Stats,
    l3Stats,
    totalTokens,
    errors,
  });

  return { run };
}

async function finalizePipeline(
  databases: ReturnType<typeof createAdminClient>["databases"],
  runId: string,
  startedAt: string,
  status: "completed" | "failed",
  stats: {
    capturesProcessed: number;
    l1Stats: { input: number; passed: number; failed: number };
    l2Stats: { signals_found: number; signals_qualifying: number; baselines_updated: number };
    l3Stats: { cards_generated: number; cards_updated: number; failed: number };
    totalTokens: number;
    errors: string[];
  }
): Promise<PipelineRun> {
  const completedAt = new Date().toISOString();

  await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.PIPELINE_RUNS,
    runId,
    {
      completed_at: completedAt,
      status,
      captures_processed: stats.capturesProcessed,
      l1_stats: toJsonString(stats.l1Stats),
      l2_stats: toJsonString(stats.l2Stats),
      l3_stats: toJsonString(stats.l3Stats),
      total_tokens_used: stats.totalTokens,
      errors: stats.errors,
    }
  );

  const run: PipelineRun = {
    id: runId,
    started_at: startedAt,
    completed_at: completedAt,
    status,
    captures_processed: stats.capturesProcessed,
    l1_stats: stats.l1Stats,
    l2_stats: stats.l2Stats,
    l3_stats: stats.l3Stats,
    total_tokens_used: stats.totalTokens,
    errors: stats.errors,
  };

  PipelineRunSchema.parse(run);
  return run;
}
