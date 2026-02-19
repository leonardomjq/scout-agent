import { v4 as uuidv4 } from "uuid";
import { ID } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { SignalSchema } from "@/schemas/signal";
import { baselinesAreMature, aggregateOutputs } from "./baselines";
import type { ScrubberOutput, Signal, EntityBaseline } from "@/types";

/** Escape special regex characters in a string for safe use in RegExp. */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── Thresholds ──

/** Deviation thresholds (used when baselines have ≥3 days of data) */
const VELOCITY_THRESHOLD = 2.0;
const SENTIMENT_DELTA_THRESHOLD = -0.3;
const FRICTION_SPIKE_THRESHOLD = 0.2;

/** Absolute thresholds (cold-start, used when baselines are thin) */
const COLD_START_MENTION_THRESHOLD = 10;
const COLD_START_FRICTION_THRESHOLD = true; // must have friction

/** Signal strength threshold for passing to L3 */
const SIGNAL_STRENGTH_THRESHOLD = 0.4;

const WINDOW_HOURS = 48;

// ── Signal Scoring ──

const WEIGHTS = {
  mention_deviation: 0.4,
  friction_severity: 0.3,
  sentiment_shift: 0.2,
  cluster_breadth: 0.1,
};

/** Compute recency decay factor based on signal age. */
export function recencyDecay(hoursOld: number): number {
  if (hoursOld < 6) return 1.0;
  if (hoursOld < 24) return 0.8;
  if (hoursOld < 48) return 0.5;
  return 0.2;
}

/** Compute signal strength for an entity based on its deviation from baseline. */
export function computeSignalStrength(
  mentionDeviation: number,
  frictionSeverity: number,
  sentimentShiftMagnitude: number,
  clusterBreadth: number,
  hoursOld: number
): number {
  const raw =
    Math.min(mentionDeviation, 1) * WEIGHTS.mention_deviation +
    Math.min(frictionSeverity, 1) * WEIGHTS.friction_severity +
    Math.min(sentimentShiftMagnitude, 1) * WEIGHTS.sentiment_shift +
    Math.min(clusterBreadth, 1) * WEIGHTS.cluster_breadth;

  return Math.round(Math.min(1, Math.max(0, raw * recencyDecay(hoursOld))) * 100) / 100;
}

// ── Entity Velocity & Anomaly Detection ──

interface EntityAnomaly {
  entityName: string;
  category: string;
  mentionVelocity: number;
  sentimentDelta: number;
  frictionSpike: number;
  isSignaling: boolean;
  currentMentions: number;
  currentSentiment: number;
  currentFrictionRate: number;
  evidenceTweetIds: string[];
}

function detectAnomalies(
  outputs: ScrubberOutput[],
  baselines: Map<string, EntityBaseline>
): EntityAnomaly[] {
  const currentStats = aggregateOutputs(outputs);
  const anomalies: EntityAnomaly[] = [];

  for (const [key, stats] of currentStats) {
    const baseline = baselines.get(key);
    const currentSentiment = stats.sentimentCount > 0
      ? stats.sentimentSum / stats.sentimentCount
      : 0.5;
    const currentFrictionRate = stats.totalCount > 0
      ? stats.frictionCount / stats.totalCount
      : 0;

    // Collect evidence tweet IDs from friction points
    const evidenceTweetIds: string[] = [];
    for (const output of outputs) {
      for (const fp of output.friction_points) {
        if (fp.entity.toLowerCase() === key) {
          evidenceTweetIds.push(...fp.source_tweet_ids);
        }
      }
      const keyPattern = new RegExp("\\b" + escapeRegex(key) + "\\b", "i");
      for (const notable of output.notable_tweets) {
        if (keyPattern.test(notable.extracted_insight)) {
          evidenceTweetIds.push(notable.tweet_id);
        }
      }
    }

    if (baseline && baselinesAreMature(baseline)) {
      // Deviation-based detection
      const mentionVelocity = baseline.baseline_mentions_per_day > 0
        ? stats.mentions / baseline.baseline_mentions_per_day
        : stats.mentions;
      const sentimentDelta = currentSentiment - baseline.baseline_sentiment;
      const frictionSpike = currentFrictionRate - baseline.baseline_friction_rate;

      const isSignaling =
        mentionVelocity > VELOCITY_THRESHOLD ||
        sentimentDelta < SENTIMENT_DELTA_THRESHOLD ||
        frictionSpike > FRICTION_SPIKE_THRESHOLD;

      anomalies.push({
        entityName: key,
        category: stats.category,
        mentionVelocity: Math.round(mentionVelocity * 100) / 100,
        sentimentDelta: Math.round(sentimentDelta * 100) / 100,
        frictionSpike: Math.round(frictionSpike * 100) / 100,
        isSignaling,
        currentMentions: stats.mentions,
        currentSentiment: Math.round(currentSentiment * 100) / 100,
        currentFrictionRate: Math.round(currentFrictionRate * 100) / 100,
        evidenceTweetIds: [...new Set(evidenceTweetIds)],
      });
    } else {
      // Cold-start: absolute thresholds
      const isSignaling =
        stats.mentions >= COLD_START_MENTION_THRESHOLD ||
        (stats.frictionCount > 0 && COLD_START_FRICTION_THRESHOLD);

      anomalies.push({
        entityName: key,
        category: stats.category,
        mentionVelocity: stats.mentions, // no baseline to compare
        sentimentDelta: 0,
        frictionSpike: currentFrictionRate,
        isSignaling,
        currentMentions: stats.mentions,
        currentSentiment: Math.round(currentSentiment * 100) / 100,
        currentFrictionRate: Math.round(currentFrictionRate * 100) / 100,
        evidenceTweetIds: [...new Set(evidenceTweetIds)],
      });
    }
  }

  return anomalies;
}

// ── Friction Clustering ──

interface FrictionCluster {
  entities: string[];
  frictionTheme: string;
  evidenceTweetIds: string[];
}

function clusterByFriction(outputs: ScrubberOutput[], signalingEntities: Set<string>): FrictionCluster[] {
  // Primary: group by mention_context from L1 entities
  const contextEntities = new Map<string, { entities: Set<string>; tweetIds: Set<string> }>();

  for (const output of outputs) {
    for (const entity of output.entities) {
      const entityKey = entity.name.toLowerCase();
      if (!signalingEntities.has(entityKey)) continue;
      if (!entity.friction_signal) continue;

      const ctxKey = entity.mention_context;
      const existing = contextEntities.get(ctxKey);
      if (existing) {
        existing.entities.add(entityKey);
      } else {
        contextEntities.set(ctxKey, {
          entities: new Set([entityKey]),
          tweetIds: new Set<string>(),
        });
      }
    }

    // Attach friction point evidence to context-based clusters
    for (const fp of output.friction_points) {
      const entityKey = fp.entity.toLowerCase();
      if (!signalingEntities.has(entityKey)) continue;

      // Find which context cluster this entity belongs to
      for (const [, cluster] of contextEntities) {
        if (cluster.entities.has(entityKey)) {
          for (const id of fp.source_tweet_ids) cluster.tweetIds.add(id);
        }
      }
    }
  }

  // Build clusters from context groups (2+ entities = interesting)
  const clusters: FrictionCluster[] = [];
  for (const [ctxKey, group] of contextEntities) {
    if (group.entities.size >= 2) {
      clusters.push({
        entities: Array.from(group.entities),
        frictionTheme: ctxKey,
        evidenceTweetIds: Array.from(group.tweetIds),
      });
    }
  }

  // Secondary: for entities not in any context cluster, fall back to keyword extraction
  const clusteredEntities = new Set(clusters.flatMap((c) => c.entities));
  const unclustered = new Map<string, { entities: Set<string>; tweetIds: Set<string> }>();

  for (const output of outputs) {
    for (const fp of output.friction_points) {
      const entityKey = fp.entity.toLowerCase();
      if (!signalingEntities.has(entityKey)) continue;
      if (clusteredEntities.has(entityKey)) continue;

      const theme = extractFrictionTheme(fp.signal);
      const existing = unclustered.get(theme);
      if (existing) {
        existing.entities.add(entityKey);
        for (const id of fp.source_tweet_ids) existing.tweetIds.add(id);
      } else {
        unclustered.set(theme, {
          entities: new Set([entityKey]),
          tweetIds: new Set(fp.source_tweet_ids),
        });
      }
    }
  }

  for (const [theme, group] of unclustered) {
    if (group.entities.size >= 2) {
      clusters.push({
        entities: Array.from(group.entities),
        frictionTheme: theme,
        evidenceTweetIds: Array.from(group.tweetIds),
      });
    }
  }

  return clusters;
}

/** Extract a friction theme keyword from a signal description. */
function extractFrictionTheme(signal: string): string {
  const lower = signal.toLowerCase();
  const themes = [
    "migration", "performance", "complexity", "compatibility",
    "breaking change", "type safety", "bundle size", "build time",
    "developer experience", "documentation", "security", "cost",
    "scalability", "deployment", "configuration", "testing",
  ];
  for (const theme of themes) {
    if (lower.includes(theme)) return theme;
  }
  // Fallback: first few significant words
  return lower.split(/\s+/).slice(0, 3).join(" ");
}

// ── Signal Classification ──

function classifySignal(
  anomaly: EntityAnomaly,
  previousSignals: Signal[]
): Signal["type"] {
  const prevEntitySignals = previousSignals.filter(
    (s) => s.entities.includes(anomaly.entityName)
  );

  if (prevEntitySignals.length === 0) return "new_emergence";
  if (anomaly.sentimentDelta < SENTIMENT_DELTA_THRESHOLD) return "sentiment_flip";
  if (anomaly.mentionVelocity > VELOCITY_THRESHOLD) return "velocity_spike";
  return "friction_cluster";
}

function classifyDirection(
  anomaly: EntityAnomaly,
  previousSignals: Signal[]
): Signal["direction"] {
  const prevEntitySignals = previousSignals.filter(
    (s) => s.entities.includes(anomaly.entityName)
  );

  if (prevEntitySignals.length === 0) return "new";
  // Compare current velocity to previous signal's velocity
  const lastSignal = prevEntitySignals[prevEntitySignals.length - 1];
  if (anomaly.mentionVelocity > lastSignal.mention_velocity) return "accelerating";
  return "decelerating";
}

// ── Main Function ──

export interface DeltaEngineResult {
  signals: Signal[];
  qualifyingSignals: Signal[];
  totalFound: number;
}

export async function runDeltaEngine(
  recentOutputs: ScrubberOutput[],
  baselines: Map<string, EntityBaseline>,
  previousSignals?: Signal[]
): Promise<DeltaEngineResult> {
  const now = new Date();
  const prevSignals = previousSignals ?? [];

  // Step 1: Detect anomalies
  const anomalies = detectAnomalies(recentOutputs, baselines);
  const signalingAnomalies = anomalies.filter((a) => a.isSignaling);
  const signalingEntities = new Set(signalingAnomalies.map((a) => a.entityName));

  // Step 2: Friction clustering
  const frictionClusters = clusterByFriction(recentOutputs, signalingEntities);

  // Step 3: Generate signals from individual anomalies
  const signals: Signal[] = [];

  for (const anomaly of signalingAnomalies) {
    // Compute friction severity from outputs
    let frictionSeverityTotal = 0;
    let frictionCount = 0;
    for (const output of recentOutputs) {
      for (const fp of output.friction_points) {
        if (fp.entity.toLowerCase() === anomaly.entityName) {
          frictionSeverityTotal += fp.severity === "high" ? 1 : fp.severity === "medium" ? 0.6 : 0.3;
          frictionCount++;
        }
      }
    }
    const avgFrictionSeverity = frictionCount > 0 ? frictionSeverityTotal / frictionCount : 0;

    // Normalize mention deviation: velocity of 2x baseline → 0.5, 4x → 1.0
    const mentionDeviation = Math.min(1, (anomaly.mentionVelocity - 1) / 3);

    const signalStrength = computeSignalStrength(
      mentionDeviation,
      avgFrictionSeverity,
      Math.abs(anomaly.sentimentDelta),
      0, // single entity, no cluster breadth
      0  // current run, 0 hours old
    );

    const signal: Signal = {
      signal_id: uuidv4(),
      type: classifySignal(anomaly, prevSignals),
      entities: [anomaly.entityName],
      signal_strength: signalStrength,
      friction_theme: null,
      mention_velocity: anomaly.mentionVelocity,
      sentiment_delta: anomaly.sentimentDelta,
      friction_spike: anomaly.frictionSpike,
      direction: classifyDirection(anomaly, prevSignals),
      evidence_tweet_ids: anomaly.evidenceTweetIds,
      first_detected: now.toISOString(),
      window_hours: WINDOW_HOURS,
    };

    SignalSchema.parse(signal);
    signals.push(signal);
  }

  // Step 4: Generate signals from friction clusters
  for (const cluster of frictionClusters) {
    // Find the strongest anomaly in the cluster for scoring
    const clusterAnomalies = signalingAnomalies.filter(
      (a) => cluster.entities.includes(a.entityName)
    );
    if (clusterAnomalies.length === 0) continue;

    const maxVelocity = Math.max(...clusterAnomalies.map((a) => a.mentionVelocity));
    const maxSentimentShift = Math.max(...clusterAnomalies.map((a) => Math.abs(a.sentimentDelta)));

    // Cluster breadth: normalized by how many entities share the theme (2 → 0.5, 4+ → 1.0)
    const clusterBreadth = Math.min(1, cluster.entities.length / 4);

    const mentionDeviation = Math.min(1, (maxVelocity - 1) / 3);
    const signalStrength = computeSignalStrength(
      mentionDeviation,
      0.7, // friction clusters inherently have friction
      maxSentimentShift,
      clusterBreadth,
      0
    );

    const signal: Signal = {
      signal_id: uuidv4(),
      type: "friction_cluster",
      entities: cluster.entities,
      signal_strength: signalStrength,
      friction_theme: cluster.frictionTheme,
      mention_velocity: maxVelocity,
      sentiment_delta: Math.min(...clusterAnomalies.map((a) => a.sentimentDelta)),
      friction_spike: Math.max(...clusterAnomalies.map((a) => a.frictionSpike)),
      direction: clusterAnomalies.some((a) =>
        classifyDirection(a, prevSignals) === "accelerating"
      ) ? "accelerating" : "new",
      evidence_tweet_ids: cluster.evidenceTweetIds,
      first_detected: now.toISOString(),
      window_hours: WINDOW_HOURS,
    };

    SignalSchema.parse(signal);
    signals.push(signal);
  }

  const qualifyingSignals = signals.filter(
    (s) => s.signal_strength >= SIGNAL_STRENGTH_THRESHOLD
  );

  return {
    signals,
    qualifyingSignals,
    totalFound: signals.length,
  };
}

export async function persistSignals(signals: Signal[]): Promise<void> {
  if (signals.length === 0) return;

  const { databases } = createAdminClient();

  const results = await Promise.allSettled(
    signals.map((s) =>
      databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.SIGNALS,
        ID.unique(),
        {
          signal_id: s.signal_id,
          type: s.type,
          entities: s.entities,
          signal_strength: s.signal_strength,
          friction_theme: s.friction_theme,
          mention_velocity: s.mention_velocity,
          sentiment_delta: s.sentiment_delta,
          friction_spike: s.friction_spike,
          direction: s.direction,
          evidence_tweet_ids: s.evidence_tweet_ids,
          first_detected: s.first_detected,
          window_hours: s.window_hours,
        }
      )
    )
  );

  const failures = results.filter((r) => r.status === "rejected");
  for (const f of failures) {
    console.error("persistSignals write failed:", (f as PromiseRejectedResult).reason);
  }
  if (failures.length > signals.length / 2) {
    throw new Error(`persistSignals: ${failures.length}/${signals.length} writes failed (>50%)`);
  }
}
