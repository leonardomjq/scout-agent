import { Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { toJsonString, fromJsonString } from "@/lib/appwrite/helpers";
import { EntityBaselineSchema } from "@/schemas/baseline";
import type { EntityBaseline, DailySnapshot, ScrubberOutput } from "@/types";

/** Convert an entity key to a deterministic document ID. */
function baselineDocId(key: string): string {
  return `baseline_${key.replace(/[^a-z0-9]/g, "_")}`;
}

function parseBaselineDoc(doc: Record<string, unknown>): EntityBaseline {
  return {
    entity_name: doc.entity_name as string,
    category: doc.category as string,
    baseline_mentions_per_day: Number(doc.baseline_mentions_per_day),
    baseline_sentiment: Number(doc.baseline_sentiment),
    baseline_friction_rate: Number(doc.baseline_friction_rate),
    last_updated: doc.last_updated as string,
    daily_snapshots: fromJsonString(doc.daily_snapshots as string),
  };
}

/**
 * Load all entity baselines from the database.
 */
export async function loadBaselines(): Promise<Map<string, EntityBaseline>> {
  const { databases } = createAdminClient();
  const map = new Map<string, EntityBaseline>();
  let cursor: string | undefined;

  while (true) {
    const queries = [Query.limit(5000)];
    if (cursor) queries.push(Query.cursorAfter(cursor));

    const page = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ENTITY_BASELINES,
      queries
    );

    for (const doc of page.documents) {
      const baseline = parseBaselineDoc(doc);
      map.set(baseline.entity_name.toLowerCase(), baseline);
    }

    if (page.documents.length < 5000) break;
    cursor = page.documents[page.documents.length - 1].$id;
  }

  return map;
}

/**
 * Load baselines only for the specified entity names.
 * Batches queries if entity count exceeds Appwrite's per-query limit.
 */
export async function loadBaselinesForEntities(
  entityNames: string[]
): Promise<Map<string, EntityBaseline>> {
  if (entityNames.length === 0) return new Map();

  const { databases } = createAdminClient();
  const map = new Map<string, EntityBaseline>();
  const BATCH_SIZE = 100; // Appwrite Query.equal array limit

  for (let i = 0; i < entityNames.length; i += BATCH_SIZE) {
    const batch = entityNames.slice(i, i + BATCH_SIZE);
    const page = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ENTITY_BASELINES,
      [Query.equal("entity_name", batch), Query.limit(BATCH_SIZE)]
    );

    for (const doc of page.documents) {
      const baseline = parseBaselineDoc(doc);
      map.set(baseline.entity_name.toLowerCase(), baseline);
    }
  }

  return map;
}

/** Sentiment enum to numeric value. */
function sentimentToNumeric(sentiment: string): number {
  switch (sentiment) {
    case "positive": return 1;
    case "neutral": return 0.5;
    case "negative": return 0;
    default: return 0.5;
  }
}

/**
 * Aggregate scrubber outputs into per-entity daily stats for today.
 */
export function aggregateOutputs(
  outputs: ScrubberOutput[]
): Map<string, { mentions: number; sentimentSum: number; sentimentCount: number; frictionCount: number; totalCount: number; category: string }> {
  const stats = new Map<string, {
    mentions: number;
    sentimentSum: number;
    sentimentCount: number;
    frictionCount: number;
    totalCount: number;
    category: string;
  }>();

  for (const output of outputs) {
    for (const entity of output.entities) {
      const key = entity.name.toLowerCase();
      const existing = stats.get(key);
      if (existing) {
        existing.mentions += entity.mentions;
        existing.sentimentSum += sentimentToNumeric(entity.sentiment) * entity.mentions;
        existing.sentimentCount += entity.mentions;
        if (entity.friction_signal) existing.frictionCount++;
        existing.totalCount++;
      } else {
        stats.set(key, {
          mentions: entity.mentions,
          sentimentSum: sentimentToNumeric(entity.sentiment) * entity.mentions,
          sentimentCount: entity.mentions,
          frictionCount: entity.friction_signal ? 1 : 0,
          totalCount: 1,
          category: entity.category,
        });
      }
    }
  }

  return stats;
}

/**
 * Update baselines from today's scrubber outputs.
 * Returns the number of baselines updated/created.
 *
 * Optimized: loads only baselines for entities in the current batch,
 * and uses deterministic document IDs to avoid extra listDocuments queries.
 */
export async function updateBaselines(
  outputs: ScrubberOutput[]
): Promise<{ updated: number; baselines: Map<string, EntityBaseline> }> {
  const { databases } = createAdminClient();

  // Aggregate first to know which entities we need
  const todayStats = aggregateOutputs(outputs);
  const entityNames = Array.from(todayStats.keys());

  // Load only the baselines we need
  const existing = await loadBaselinesForEntities(entityNames);

  const today = new Date().toISOString().split("T")[0];
  let updated = 0;

  for (const [key, stats] of todayStats) {
    const avgSentiment = stats.sentimentCount > 0
      ? stats.sentimentSum / stats.sentimentCount
      : 0.5;
    const frictionRate = stats.totalCount > 0
      ? stats.frictionCount / stats.totalCount
      : 0;

    const todaySnapshot: DailySnapshot = {
      date: today,
      mentions: stats.mentions,
      sentiment: Math.round(avgSentiment * 100) / 100,
      friction_rate: Math.round(frictionRate * 100) / 100,
    };

    const baseline = existing.get(key);
    const docId = baselineDocId(key);

    if (baseline) {
      // Update existing baseline
      let snapshots = baseline.daily_snapshots.filter((s) => s.date !== today);
      snapshots.push(todaySnapshot);
      // Keep only last 7 days
      snapshots.sort((a, b) => b.date.localeCompare(a.date));
      snapshots = snapshots.slice(0, 7);

      // Recompute rolling averages from snapshots
      const avgMentions = snapshots.reduce((s, d) => s + d.mentions, 0) / snapshots.length;
      const avgSent = snapshots.reduce((s, d) => s + d.sentiment, 0) / snapshots.length;
      const avgFriction = snapshots.reduce((s, d) => s + d.friction_rate, 0) / snapshots.length;

      const updatedBaseline: EntityBaseline = {
        entity_name: baseline.entity_name,
        category: stats.category || baseline.category,
        baseline_mentions_per_day: Math.round(avgMentions * 100) / 100,
        baseline_sentiment: Math.round(avgSent * 100) / 100,
        baseline_friction_rate: Math.round(avgFriction * 100) / 100,
        last_updated: new Date().toISOString(),
        daily_snapshots: snapshots,
      };

      EntityBaselineSchema.parse(updatedBaseline);

      // Use deterministic ID — no extra listDocuments query needed
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ENTITY_BASELINES,
        docId,
        {
          category: updatedBaseline.category,
          baseline_mentions_per_day: updatedBaseline.baseline_mentions_per_day,
          baseline_sentiment: updatedBaseline.baseline_sentiment,
          baseline_friction_rate: updatedBaseline.baseline_friction_rate,
          last_updated: updatedBaseline.last_updated,
          daily_snapshots: toJsonString(updatedBaseline.daily_snapshots),
        }
      );

      existing.set(key, updatedBaseline);
      updated++;
    } else {
      // Create new baseline with deterministic ID
      const newBaseline: EntityBaseline = {
        entity_name: key,
        category: stats.category,
        baseline_mentions_per_day: stats.mentions,
        baseline_sentiment: Math.round(avgSentiment * 100) / 100,
        baseline_friction_rate: Math.round(frictionRate * 100) / 100,
        last_updated: new Date().toISOString(),
        daily_snapshots: [todaySnapshot],
      };

      EntityBaselineSchema.parse(newBaseline);

      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ENTITY_BASELINES,
        docId,
        {
          entity_name: newBaseline.entity_name,
          category: newBaseline.category,
          baseline_mentions_per_day: newBaseline.baseline_mentions_per_day,
          baseline_sentiment: newBaseline.baseline_sentiment,
          baseline_friction_rate: newBaseline.baseline_friction_rate,
          last_updated: newBaseline.last_updated,
          daily_snapshots: toJsonString(newBaseline.daily_snapshots),
        }
      );

      existing.set(key, newBaseline);
      updated++;
    }
  }

  return { updated, baselines: existing };
}

/**
 * Check if baselines have enough history for deviation-based scoring.
 */
export function baselinesAreMature(baseline: EntityBaseline): boolean {
  return baseline.daily_snapshots.length >= 3;
}
