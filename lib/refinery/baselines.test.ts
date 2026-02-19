import { describe, it, expect, vi, beforeEach } from "vitest";
import { aggregateOutputs, baselinesAreMature } from "./baselines";
import type { ScrubberOutput, EntityBaseline } from "@/types";

// ── Test Helpers ──

function makeScrubberOutput(overrides: Partial<ScrubberOutput> = {}): ScrubberOutput {
  return {
    capture_id: "550e8400-e29b-41d4-a716-446655440000",
    processed_at: new Date().toISOString(),
    total_input: 10,
    total_passed: 8,
    entities: [
      { name: "React", category: "framework", sentiment: "negative", mention_context: "complaint", friction_signal: true, mentions: 5 },
    ],
    friction_points: [],
    notable_tweets: [],
    ...overrides,
  };
}

function makeBaseline(overrides: Partial<EntityBaseline> = {}): EntityBaseline {
  return {
    entity_name: "react",
    category: "framework",
    baseline_mentions_per_day: 10,
    baseline_sentiment: 0.6,
    baseline_friction_rate: 0.2,
    last_updated: new Date().toISOString(),
    daily_snapshots: [
      { date: "2026-02-17", mentions: 10, sentiment: 0.6, friction_rate: 0.2 },
      { date: "2026-02-16", mentions: 12, sentiment: 0.65, friction_rate: 0.15 },
      { date: "2026-02-15", mentions: 8, sentiment: 0.55, friction_rate: 0.25 },
    ],
    ...overrides,
  };
}

// ── aggregateOutputs ──

describe("aggregateOutputs", () => {
  it("aggregates a single output correctly", () => {
    const output = makeScrubberOutput();
    const stats = aggregateOutputs([output]);
    const react = stats.get("react");

    expect(react).toBeDefined();
    expect(react!.mentions).toBe(5);
    expect(react!.category).toBe("framework");
    expect(react!.frictionCount).toBe(1); // friction_signal=true
    expect(react!.totalCount).toBe(1);
  });

  it("merges multiple outputs for the same entity", () => {
    const o1 = makeScrubberOutput({
      entities: [
        { name: "React", category: "framework", sentiment: "negative", mention_context: "complaint", friction_signal: true, mentions: 5 },
      ],
    });
    const o2 = makeScrubberOutput({
      entities: [
        { name: "react", category: "framework", sentiment: "positive", mention_context: "praise", friction_signal: false, mentions: 3 },
      ],
    });
    const stats = aggregateOutputs([o1, o2]);
    const react = stats.get("react")!;

    expect(react.mentions).toBe(8); // 5 + 3
    expect(react.frictionCount).toBe(1); // only first has friction
    expect(react.totalCount).toBe(2); // two entity appearances
  });

  it("tracks multiple different entities independently", () => {
    const output = makeScrubberOutput({
      entities: [
        { name: "React", category: "framework", sentiment: "negative", mention_context: "complaint", friction_signal: true, mentions: 5 },
        { name: "Svelte", category: "framework", sentiment: "positive", mention_context: "migration", friction_signal: false, mentions: 3 },
      ],
    });
    const stats = aggregateOutputs([output]);

    expect(stats.size).toBe(2);
    expect(stats.get("react")!.mentions).toBe(5);
    expect(stats.get("svelte")!.mentions).toBe(3);
  });

  it("handles duplicate entities across outputs (case-insensitive key)", () => {
    const o1 = makeScrubberOutput({
      entities: [
        { name: "TypeScript", category: "language", sentiment: "positive", mention_context: "praise", friction_signal: false, mentions: 10 },
      ],
    });
    const o2 = makeScrubberOutput({
      entities: [
        { name: "typescript", category: "language", sentiment: "neutral", mention_context: "question", friction_signal: true, mentions: 7 },
      ],
    });
    const stats = aggregateOutputs([o1, o2]);
    const ts = stats.get("typescript")!;

    expect(ts.mentions).toBe(17);
    // sentimentSum: 1*10 + 0.5*7 = 13.5, sentimentCount: 10+7 = 17
    expect(ts.sentimentSum).toBeCloseTo(13.5);
    expect(ts.sentimentCount).toBe(17);
  });

  it("computes weighted sentiment correctly", () => {
    const output = makeScrubberOutput({
      entities: [
        { name: "Deno", category: "platform", sentiment: "positive", mention_context: "announcement", friction_signal: false, mentions: 4 },
      ],
    });
    const stats = aggregateOutputs([output]);
    const deno = stats.get("deno")!;

    // positive=1.0, mentions=4 → sentimentSum=4, sentimentCount=4
    expect(deno.sentimentSum).toBe(4);
    expect(deno.sentimentCount).toBe(4);
  });

  it("returns empty map for empty input", () => {
    const stats = aggregateOutputs([]);
    expect(stats.size).toBe(0);
  });
});

// ── baselinesAreMature ──

describe("baselinesAreMature", () => {
  it("returns false for 0 snapshots", () => {
    const baseline = makeBaseline({ daily_snapshots: [] });
    expect(baselinesAreMature(baseline)).toBe(false);
  });

  it("returns false for 1 snapshot", () => {
    const baseline = makeBaseline({
      daily_snapshots: [{ date: "2026-02-19", mentions: 5, sentiment: 0.5, friction_rate: 0.1 }],
    });
    expect(baselinesAreMature(baseline)).toBe(false);
  });

  it("returns false for 2 snapshots", () => {
    const baseline = makeBaseline({
      daily_snapshots: [
        { date: "2026-02-19", mentions: 5, sentiment: 0.5, friction_rate: 0.1 },
        { date: "2026-02-18", mentions: 6, sentiment: 0.55, friction_rate: 0.12 },
      ],
    });
    expect(baselinesAreMature(baseline)).toBe(false);
  });

  it("returns true for exactly 3 snapshots", () => {
    const baseline = makeBaseline(); // default has 3 snapshots
    expect(baselinesAreMature(baseline)).toBe(true);
  });

  it("returns true for 7 snapshots (full window)", () => {
    const baseline = makeBaseline({
      daily_snapshots: Array.from({ length: 7 }, (_, i) => ({
        date: `2026-02-${19 - i}`,
        mentions: 5 + i,
        sentiment: 0.5,
        friction_rate: 0.1,
      })),
    });
    expect(baselinesAreMature(baseline)).toBe(true);
  });
});

// ── updateBaselines (integration test with mocked Appwrite) ──

describe("updateBaselines", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates new baselines for unknown entities", async () => {
    const createCalls: Array<{ id: string; data: Record<string, unknown> }> = [];

    vi.doMock("@/lib/appwrite/admin", () => ({
      createAdminClient: () => ({
        databases: {
          listDocuments: vi.fn().mockResolvedValue({ documents: [], total: 0 }),
          createDocument: vi.fn((_db: string, _col: string, id: string, data: Record<string, unknown>) => {
            createCalls.push({ id, data });
            return Promise.resolve({ $id: id, ...data });
          }),
          updateDocument: vi.fn(),
        },
      }),
    }));

    const { updateBaselines } = await import("./baselines");
    const output = makeScrubberOutput({
      entities: [
        { name: "Bun", category: "platform", sentiment: "positive", mention_context: "announcement", friction_signal: false, mentions: 15 },
      ],
    });

    const { updated, baselines } = await updateBaselines([output]);

    expect(updated).toBe(1);
    expect(baselines.has("bun")).toBe(true);
    expect(createCalls.length).toBe(1);
    expect(createCalls[0].id).toBe("baseline_bun");
    expect(createCalls[0].data.entity_name).toBe("bun");
  });

  it("updates existing baselines with new snapshot", async () => {
    const existingDoc = {
      $id: "baseline_react",
      entity_name: "react",
      category: "framework",
      baseline_mentions_per_day: 10,
      baseline_sentiment: 0.6,
      baseline_friction_rate: 0.2,
      last_updated: new Date().toISOString(),
      daily_snapshots: JSON.stringify([
        { date: "2026-02-17", mentions: 10, sentiment: 0.6, friction_rate: 0.2 },
        { date: "2026-02-16", mentions: 12, sentiment: 0.65, friction_rate: 0.15 },
        { date: "2026-02-15", mentions: 8, sentiment: 0.55, friction_rate: 0.25 },
      ]),
    };

    const updateCalls: Array<{ id: string; data: Record<string, unknown> }> = [];

    vi.doMock("@/lib/appwrite/admin", () => ({
      createAdminClient: () => ({
        databases: {
          listDocuments: vi.fn().mockResolvedValue({
            documents: [existingDoc],
            total: 1,
          }),
          updateDocument: vi.fn((_db: string, _col: string, id: string, data: Record<string, unknown>) => {
            updateCalls.push({ id, data });
            return Promise.resolve({ $id: id, ...data });
          }),
          createDocument: vi.fn(),
        },
      }),
    }));

    const { updateBaselines } = await import("./baselines");
    const output = makeScrubberOutput({
      entities: [
        { name: "React", category: "framework", sentiment: "negative", mention_context: "complaint", friction_signal: true, mentions: 20 },
      ],
    });

    const { updated } = await updateBaselines([output]);
    expect(updated).toBe(1);
    expect(updateCalls.length).toBe(1);
  });
});
