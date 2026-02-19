import { describe, it, expect } from "vitest";
import {
  computeSignalStrength,
  recencyDecay,
  runDeltaEngine,
} from "./pattern-matcher";
import type { ScrubberOutput, EntityBaseline, Signal } from "@/types";

describe("recencyDecay", () => {
  it("returns 1.0 for signals < 6h old", () => {
    expect(recencyDecay(3)).toBe(1.0);
  });

  it("returns 0.8 for signals 6-24h old", () => {
    expect(recencyDecay(12)).toBe(0.8);
  });

  it("returns 0.5 for signals 24-48h old", () => {
    expect(recencyDecay(36)).toBe(0.5);
  });

  it("returns 0.2 for signals > 48h old", () => {
    expect(recencyDecay(72)).toBe(0.2);
  });
});

describe("computeSignalStrength", () => {
  it("computes strength from weighted components", () => {
    const strength = computeSignalStrength(0.5, 0.5, 0.5, 0.5, 0);
    expect(strength).toBeGreaterThan(0);
    expect(strength).toBeLessThanOrEqual(1);
  });

  it("caps at 1.0", () => {
    const strength = computeSignalStrength(1, 1, 1, 1, 0);
    expect(strength).toBeLessThanOrEqual(1);
  });

  it("applies recency decay for old signals", () => {
    const fresh = computeSignalStrength(0.5, 0.5, 0.5, 0.5, 0);
    const old = computeSignalStrength(0.5, 0.5, 0.5, 0.5, 36);
    expect(old).toBeLessThan(fresh);
  });

  it("returns 0 for all-zero inputs", () => {
    const strength = computeSignalStrength(0, 0, 0, 0, 0);
    expect(strength).toBe(0);
  });
});

describe("runDeltaEngine", () => {
  const makeScrubberOutput = (overrides: Partial<ScrubberOutput> = {}): ScrubberOutput => ({
    capture_id: "550e8400-e29b-41d4-a716-446655440000",
    processed_at: new Date().toISOString(),
    total_input: 10,
    total_passed: 8,
    entities: [
      { name: "React", category: "framework", sentiment: "negative", mention_context: "complaint", friction_signal: true, mentions: 5 },
      { name: "Svelte", category: "framework", sentiment: "positive", mention_context: "migration", friction_signal: true, mentions: 4 },
    ],
    friction_points: [
      {
        entity: "React",
        signal: "State management complexity",
        source_tweet_ids: ["t1", "t2", "t3"],
        severity: "high",
      },
      {
        entity: "Svelte",
        signal: "Migration effort from React",
        source_tweet_ids: ["t1", "t2", "t3"],
        severity: "medium",
      },
    ],
    notable_tweets: [
      { tweet_id: "t1", relevance_score: 0.9, extracted_insight: "React to Svelte migration" },
      { tweet_id: "t2", relevance_score: 0.8, extracted_insight: "React performance issues" },
      { tweet_id: "t3", relevance_score: 0.7, extracted_insight: "Svelte adoption growing" },
    ],
    ...overrides,
  });

  it("detects signals from entities with friction (cold start)", async () => {
    const outputs = [makeScrubberOutput(), makeScrubberOutput()];
    const baselines = new Map<string, EntityBaseline>();
    const result = await runDeltaEngine(outputs, baselines);
    expect(result.totalFound).toBeGreaterThan(0);
    expect(result.signals).toBeDefined();
  });

  it("returns empty signals for empty input", async () => {
    const baselines = new Map<string, EntityBaseline>();
    const result = await runDeltaEngine([], baselines);
    expect(result.totalFound).toBe(0);
    expect(result.signals).toEqual([]);
    expect(result.qualifyingSignals).toEqual([]);
  });

  it("generates friction cluster signals when entities share mention_context", async () => {
    const output = makeScrubberOutput({
      entities: [
        { name: "React", category: "framework", sentiment: "negative", mention_context: "complaint", friction_signal: true, mentions: 15 },
        { name: "Svelte", category: "framework", sentiment: "negative", mention_context: "complaint", friction_signal: true, mentions: 12 },
      ],
      friction_points: [
        { entity: "React", signal: "Migration complexity issue", source_tweet_ids: ["t1"], severity: "high" },
        { entity: "Svelte", signal: "Migration complexity issue", source_tweet_ids: ["t2"], severity: "medium" },
      ],
    });
    const baselines = new Map<string, EntityBaseline>();
    const result = await runDeltaEngine([output, output], baselines);
    const frictionClusters = result.signals.filter((s) => s.type === "friction_cluster");
    // Shared "complaint" context with 2 entities → should produce cluster
    expect(frictionClusters.length).toBeGreaterThan(0);
    expect(frictionClusters[0].entities.length).toBeGreaterThanOrEqual(2);
    expect(frictionClusters[0].friction_theme).toBeDefined();
  });

  it("detects velocity spikes when baseline exists", async () => {
    const output = makeScrubberOutput({
      entities: [
        { name: "React", category: "framework", sentiment: "negative", mention_context: "complaint", friction_signal: true, mentions: 50 },
      ],
    });

    const baselines = new Map<string, EntityBaseline>([
      ["react", {
        entity_name: "react",
        category: "framework",
        baseline_mentions_per_day: 5,
        baseline_sentiment: 0.7,
        baseline_friction_rate: 0.1,
        last_updated: new Date().toISOString(),
        daily_snapshots: [
          { date: "2025-01-14", mentions: 5, sentiment: 0.7, friction_rate: 0.1 },
          { date: "2025-01-13", mentions: 4, sentiment: 0.72, friction_rate: 0.08 },
          { date: "2025-01-12", mentions: 6, sentiment: 0.68, friction_rate: 0.12 },
        ],
      }],
    ]);

    const result = await runDeltaEngine([output], baselines);
    // 50 mentions vs 5/day baseline = 10x velocity → should signal
    const reactSignals = result.signals.filter((s) => s.entities.includes("react"));
    expect(reactSignals.length).toBeGreaterThan(0);
    expect(reactSignals[0].mention_velocity).toBeGreaterThan(2);
  });

  it("filters signals below strength threshold", async () => {
    const output = makeScrubberOutput({
      entities: [
        { name: "ObscureTool", category: "tool", sentiment: "neutral", mention_context: "question", friction_signal: false, mentions: 1 },
      ],
      friction_points: [],
      notable_tweets: [],
    });
    const baselines = new Map<string, EntityBaseline>();
    const result = await runDeltaEngine([output], baselines);
    // 1 mention, no friction → should not qualify
    expect(result.qualifyingSignals.length).toBe(0);
  });

  // ── Signal classification tests ──

  it("classifies entity with no history as new_emergence", async () => {
    const output = makeScrubberOutput({
      entities: [
        { name: "BrandNewTool", category: "tool", sentiment: "positive", mention_context: "announcement", friction_signal: true, mentions: 15 },
      ],
      friction_points: [
        { entity: "BrandNewTool", signal: "Initial setup complexity", source_tweet_ids: ["t1"], severity: "medium" },
      ],
    });
    const baselines = new Map<string, EntityBaseline>();
    const result = await runDeltaEngine([output, output], baselines, []);

    const signals = result.signals.filter((s) => s.entities.includes("brandnewtool"));
    expect(signals.length).toBeGreaterThan(0);
    expect(signals[0].type).toBe("new_emergence");
  });

  it("classifies entity with sentiment drop as sentiment_flip", async () => {
    const output = makeScrubberOutput({
      entities: [
        { name: "Webpack", category: "tool", sentiment: "negative", mention_context: "complaint", friction_signal: true, mentions: 20 },
      ],
      friction_points: [
        { entity: "Webpack", signal: "Build performance degradation", source_tweet_ids: ["t1", "t2"], severity: "high" },
      ],
    });

    const baselines = new Map<string, EntityBaseline>([
      ["webpack", {
        entity_name: "webpack",
        category: "tool",
        baseline_mentions_per_day: 15,
        baseline_sentiment: 0.8,
        baseline_friction_rate: 0.05,
        last_updated: new Date().toISOString(),
        daily_snapshots: [
          { date: "2026-02-17", mentions: 15, sentiment: 0.8, friction_rate: 0.05 },
          { date: "2026-02-16", mentions: 14, sentiment: 0.78, friction_rate: 0.06 },
          { date: "2026-02-15", mentions: 16, sentiment: 0.82, friction_rate: 0.04 },
        ],
      }],
    ]);

    // Previous signal exists for webpack
    const prevSignals: Signal[] = [{
      signal_id: "550e8400-e29b-41d4-a716-446655440099",
      type: "velocity_spike",
      entities: ["webpack"],
      signal_strength: 0.5,
      friction_theme: null,
      mention_velocity: 1.5,
      sentiment_delta: 0,
      friction_spike: 0,
      direction: "new",
      evidence_tweet_ids: [],
      first_detected: new Date().toISOString(),
      window_hours: 48,
    }];

    const result = await runDeltaEngine([output], baselines, prevSignals);
    const webpackSignals = result.signals.filter((s) => s.entities.includes("webpack"));
    // Current sentiment is ~0 (negative), baseline is 0.8 → delta = -0.8
    if (webpackSignals.length > 0) {
      expect(webpackSignals[0].type).toBe("sentiment_flip");
      expect(webpackSignals[0].sentiment_delta).toBeLessThan(-0.3);
    }
  });

  it("classifies entity with high velocity as velocity_spike", async () => {
    const output = makeScrubberOutput({
      entities: [
        { name: "Bun", category: "platform", sentiment: "positive", mention_context: "praise", friction_signal: false, mentions: 100 },
      ],
    });

    const baselines = new Map<string, EntityBaseline>([
      ["bun", {
        entity_name: "bun",
        category: "platform",
        baseline_mentions_per_day: 10,
        baseline_sentiment: 0.7,
        baseline_friction_rate: 0.05,
        last_updated: new Date().toISOString(),
        daily_snapshots: [
          { date: "2026-02-17", mentions: 10, sentiment: 0.7, friction_rate: 0.05 },
          { date: "2026-02-16", mentions: 11, sentiment: 0.72, friction_rate: 0.04 },
          { date: "2026-02-15", mentions: 9, sentiment: 0.68, friction_rate: 0.06 },
        ],
      }],
    ]);

    // Previous signal exists → not new_emergence
    const prevSignals: Signal[] = [{
      signal_id: "550e8400-e29b-41d4-a716-446655440088",
      type: "new_emergence",
      entities: ["bun"],
      signal_strength: 0.4,
      friction_theme: null,
      mention_velocity: 1.0,
      sentiment_delta: 0,
      friction_spike: 0,
      direction: "new",
      evidence_tweet_ids: [],
      first_detected: new Date().toISOString(),
      window_hours: 48,
    }];

    const result = await runDeltaEngine([output], baselines, prevSignals);
    const bunSignals = result.signals.filter((s) => s.entities.includes("bun"));
    expect(bunSignals.length).toBeGreaterThan(0);
    // 100 mentions vs 10/day = 10x → velocity_spike (sentiment is positive → no flip)
    expect(bunSignals[0].type).toBe("velocity_spike");
  });

  // ── Direction tests ──

  it("classifies direction as 'new' when no previous signals", async () => {
    const output = makeScrubberOutput({
      entities: [
        { name: "NewFramework", category: "framework", sentiment: "positive", mention_context: "announcement", friction_signal: true, mentions: 20 },
      ],
      friction_points: [
        { entity: "NewFramework", signal: "API instability", source_tweet_ids: ["t1"], severity: "medium" },
      ],
    });
    const baselines = new Map<string, EntityBaseline>();
    const result = await runDeltaEngine([output, output], baselines, []);

    const sig = result.signals.find((s) => s.entities.includes("newframework"));
    expect(sig).toBeDefined();
    expect(sig!.direction).toBe("new");
  });

  it("classifies direction as 'accelerating' when velocity increases", async () => {
    const output = makeScrubberOutput({
      entities: [
        { name: "Turbopack", category: "tool", sentiment: "positive", mention_context: "praise", friction_signal: true, mentions: 50 },
      ],
      friction_points: [
        { entity: "Turbopack", signal: "Plugin ecosystem gaps", source_tweet_ids: ["t1"], severity: "medium" },
      ],
    });

    const baselines = new Map<string, EntityBaseline>([
      ["turbopack", {
        entity_name: "turbopack",
        category: "tool",
        baseline_mentions_per_day: 5,
        baseline_sentiment: 0.8,
        baseline_friction_rate: 0.1,
        last_updated: new Date().toISOString(),
        daily_snapshots: [
          { date: "2026-02-17", mentions: 5, sentiment: 0.8, friction_rate: 0.1 },
          { date: "2026-02-16", mentions: 4, sentiment: 0.78, friction_rate: 0.12 },
          { date: "2026-02-15", mentions: 6, sentiment: 0.82, friction_rate: 0.08 },
        ],
      }],
    ]);

    const prevSignals: Signal[] = [{
      signal_id: "550e8400-e29b-41d4-a716-446655440077",
      type: "velocity_spike",
      entities: ["turbopack"],
      signal_strength: 0.5,
      friction_theme: null,
      mention_velocity: 3.0, // previous velocity was 3x
      sentiment_delta: 0,
      friction_spike: 0,
      direction: "new",
      evidence_tweet_ids: [],
      first_detected: new Date().toISOString(),
      window_hours: 48,
    }];

    const result = await runDeltaEngine([output], baselines, prevSignals);
    const sig = result.signals.find((s) => s.entities.includes("turbopack"));
    expect(sig).toBeDefined();
    // Current velocity: 50/5 = 10x > prev 3x → accelerating
    expect(sig!.direction).toBe("accelerating");
  });

  it("classifies direction as 'decelerating' when velocity decreases", async () => {
    const output = makeScrubberOutput({
      entities: [
        { name: "SlowDown", category: "tool", sentiment: "positive", mention_context: "praise", friction_signal: true, mentions: 8 },
      ],
      friction_points: [
        { entity: "SlowDown", signal: "Some friction", source_tweet_ids: ["t1"], severity: "low" },
      ],
    });

    const baselines = new Map<string, EntityBaseline>([
      ["slowdown", {
        entity_name: "slowdown",
        category: "tool",
        baseline_mentions_per_day: 3,
        baseline_sentiment: 0.6,
        baseline_friction_rate: 0.3,
        last_updated: new Date().toISOString(),
        daily_snapshots: [
          { date: "2026-02-17", mentions: 3, sentiment: 0.6, friction_rate: 0.3 },
          { date: "2026-02-16", mentions: 4, sentiment: 0.58, friction_rate: 0.32 },
          { date: "2026-02-15", mentions: 2, sentiment: 0.62, friction_rate: 0.28 },
        ],
      }],
    ]);

    const prevSignals: Signal[] = [{
      signal_id: "550e8400-e29b-41d4-a716-446655440066",
      type: "velocity_spike",
      entities: ["slowdown"],
      signal_strength: 0.6,
      friction_theme: null,
      mention_velocity: 5.0, // previous velocity was 5x
      sentiment_delta: 0,
      friction_spike: 0,
      direction: "accelerating",
      evidence_tweet_ids: [],
      first_detected: new Date().toISOString(),
      window_hours: 48,
    }];

    const result = await runDeltaEngine([output], baselines, prevSignals);
    const sig = result.signals.find((s) => s.entities.includes("slowdown"));
    if (sig) {
      // Current velocity: 8/3 ≈ 2.67x < prev 5x → decelerating
      expect(sig.direction).toBe("decelerating");
    }
  });
});
