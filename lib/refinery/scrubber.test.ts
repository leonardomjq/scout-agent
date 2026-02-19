import { describe, it, expect, vi, beforeEach } from "vitest";
import { isNoise, filterSignals } from "./scrubber";
import type { SignalSource, TwitterSignal } from "@/types";
import rawCapture from "@/__fixtures__/raw-capture.json";

const signals = rawCapture.signals as unknown as SignalSource[];

// ── Existing tests (preserved) ──

describe("isNoise", () => {
  it("detects giveaway spam", () => {
    expect(isNoise("GIVEAWAY! Follow and retweet to win $500!")).toBe(true);
  });

  it("detects airdrop spam", () => {
    expect(isNoise("Free airdrop for all followers")).toBe(true);
  });

  it("detects follow+retweet spam", () => {
    expect(isNoise("Follow and retweet to win")).toBe(true);
  });

  it("detects check bio spam", () => {
    expect(isNoise("Check my bio for a surprise")).toBe(true);
  });

  it("passes legitimate developer content", () => {
    expect(isNoise("Just migrated our codebase from Webpack to Turbopack")).toBe(false);
  });

  it("passes technical discussion", () => {
    expect(isNoise("The Rust compiler improvements are impressive")).toBe(false);
  });
});

describe("filterSignals", () => {
  it("filters out noise signals", () => {
    const filtered = filterSignals(signals);
    const ids = filtered.map((s) => {
      if (s.source_type === "twitter") return s.tweet_id;
      return "";
    });
    expect(ids).not.toContain("tweet-noise-001");
  });

  it("keeps signal tweets (no keyword pre-filter)", () => {
    const filtered = filterSignals(signals);
    const ids = filtered.map((s) => {
      if (s.source_type === "twitter") return s.tweet_id;
      return "";
    });
    expect(ids).toContain("tweet-001");
    expect(ids).toContain("tweet-002");
    expect(ids).toContain("tweet-003");
    expect(ids).toContain("tweet-004");
    expect(ids).toContain("tweet-005");
  });

  it("returns fewer signals than input (noise removed)", () => {
    const filtered = filterSignals(signals);
    expect(filtered.length).toBeLessThan(signals.length);
  });

  it("passes all non-noise signals through (no keyword gate)", () => {
    const filtered = filterSignals(signals);
    // All 5 non-noise signals should pass (no keyword filter anymore)
    expect(filtered.length).toBe(5);
  });
});

// ── New tests: runScrubber with mocked LLM ──

function makeTwitterSignal(overrides: Partial<TwitterSignal> = {}): TwitterSignal {
  return {
    source_type: "twitter",
    tweet_id: `tweet-${Math.random().toString(36).slice(2, 8)}`,
    author_handle: "testdev",
    author_name: "Test Dev",
    author_followers: 1000,
    author_verified: false,
    content: "Some technical content about React and Svelte",
    timestamp: new Date().toISOString(),
    likes: 10,
    retweets: 5,
    replies: 3,
    quotes: 1,
    media_urls: [],
    is_thread: false,
    urls: [],
    hashtags: [],
    ...overrides,
  };
}

describe("runScrubber (mocked LLM)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("deduplicates entities by name (case-insensitive) with correct bestMentions", async () => {
    vi.doMock("@/lib/ai", () => ({
      extractStructured: vi.fn()
        .mockResolvedValueOnce({
          data: {
            entities: [
              { name: "React", category: "framework", sentiment: "negative", mention_context: "complaint", friction_signal: true, mentions: 3 },
              { name: "react", category: "framework", sentiment: "positive", mention_context: "praise", friction_signal: false, mentions: 7 },
              { name: "REACT", category: "framework", sentiment: "neutral", mention_context: "comparison", friction_signal: false, mentions: 2 },
            ],
            friction_points: [],
            notable_tweets: [],
          },
          tokensUsed: 100,
        }),
    }));
    vi.doMock("@/lib/appwrite/admin", () => ({
      createAdminClient: () => ({
        databases: {
          createDocument: vi.fn().mockResolvedValue({}),
        },
      }),
    }));

    const { runScrubber } = await import("./scrubber");
    const testSignals = Array.from({ length: 5 }, (_, i) =>
      makeTwitterSignal({ tweet_id: `t-${i}` })
    );

    const result = await runScrubber("550e8400-e29b-41d4-a716-446655440000", testSignals, new Set());

    const reactEntity = result.output.entities.find(
      (e) => e.name.toLowerCase() === "react"
    );
    expect(reactEntity).toBeDefined();
    // Total mentions: 3 + 7 + 2 = 12
    expect(reactEntity!.mentions).toBe(12);
    // Best individual was "react" with 7 mentions → mention_context should be "praise"
    expect(reactEntity!.mention_context).toBe("praise");
    // friction_signal should be true because at least one had it
    expect(reactEntity!.friction_signal).toBe(true);
    // Only one merged entity
    expect(result.output.entities.filter((e) => e.name.toLowerCase() === "react").length).toBe(1);
  });

  it("skips already-processed signal IDs", async () => {
    let batchCount = 0;
    vi.doMock("@/lib/ai", () => ({
      extractStructured: vi.fn().mockImplementation(() => {
        batchCount++;
        return Promise.resolve({
          data: { entities: [], friction_points: [], notable_tweets: [] },
          tokensUsed: 50,
        });
      }),
    }));
    vi.doMock("@/lib/appwrite/admin", () => ({
      createAdminClient: () => ({
        databases: {
          createDocument: vi.fn().mockResolvedValue({}),
        },
      }),
    }));

    const { runScrubber } = await import("./scrubber");

    const testSignals = [
      makeTwitterSignal({ tweet_id: "already-processed-1" }),
      makeTwitterSignal({ tweet_id: "already-processed-2" }),
      makeTwitterSignal({ tweet_id: "new-signal-1" }),
    ];
    const processedIds = new Set(["already-processed-1", "already-processed-2"]);

    const result = await runScrubber("550e8400-e29b-41d4-a716-446655440000", testSignals, processedIds);

    // Only 1 new signal should pass through, total_input is still all 3
    expect(result.output.total_input).toBe(3);
    expect(result.output.total_passed).toBe(1);
  });

  it("chunks signals into batches of 25", async () => {
    let batchCount = 0;
    vi.doMock("@/lib/ai", () => ({
      extractStructured: vi.fn().mockImplementation(() => {
        batchCount++;
        return Promise.resolve({
          data: { entities: [], friction_points: [], notable_tweets: [] },
          tokensUsed: 50,
        });
      }),
    }));
    vi.doMock("@/lib/appwrite/admin", () => ({
      createAdminClient: () => ({
        databases: {
          createDocument: vi.fn().mockResolvedValue({}),
        },
      }),
    }));

    const { runScrubber } = await import("./scrubber");

    // 60 signals → 3 batches (25 + 25 + 10)
    const testSignals = Array.from({ length: 60 }, (_, i) =>
      makeTwitterSignal({ tweet_id: `batch-signal-${i}` })
    );

    await runScrubber("550e8400-e29b-41d4-a716-446655440000", testSignals, new Set());
    expect(batchCount).toBe(3);
  });

  it("handles extractBatch errors gracefully", async () => {
    vi.doMock("@/lib/ai", () => ({
      extractStructured: vi.fn().mockResolvedValue({
        error: "LLM timeout",
        tokensUsed: 0,
      }),
    }));
    vi.doMock("@/lib/appwrite/admin", () => ({
      createAdminClient: () => ({
        databases: {
          createDocument: vi.fn().mockResolvedValue({}),
        },
      }),
    }));

    const { runScrubber } = await import("./scrubber");
    const testSignals = [makeTwitterSignal()];

    const result = await runScrubber("550e8400-e29b-41d4-a716-446655440000", testSignals, new Set());
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].error).toContain("LLM timeout");
  });

  it("formats different source types correctly for prompt", async () => {
    let capturedPrompt = "";
    vi.doMock("@/lib/ai", () => ({
      extractStructured: vi.fn().mockImplementation((opts: { prompt: string }) => {
        capturedPrompt = opts.prompt;
        return Promise.resolve({
          data: { entities: [], friction_points: [], notable_tweets: [] },
          tokensUsed: 50,
        });
      }),
    }));
    vi.doMock("@/lib/appwrite/admin", () => ({
      createAdminClient: () => ({
        databases: {
          createDocument: vi.fn().mockResolvedValue({}),
        },
      }),
    }));

    const { runScrubber } = await import("./scrubber");

    const testSignals: SignalSource[] = [
      makeTwitterSignal({ tweet_id: "tw-1", author_handle: "testuser", content: "React is great" }),
    ];

    await runScrubber("550e8400-e29b-41d4-a716-446655440000", testSignals, new Set());
    expect(capturedPrompt).toContain("@testuser");
    expect(capturedPrompt).toContain("[tw-1]");
  });

  it("returns empty entities when all signals are noise", async () => {
    vi.doMock("@/lib/ai", () => ({
      extractStructured: vi.fn(),
    }));
    vi.doMock("@/lib/appwrite/admin", () => ({
      createAdminClient: () => ({
        databases: {
          createDocument: vi.fn().mockResolvedValue({}),
        },
      }),
    }));

    const { runScrubber } = await import("./scrubber");

    const noiseSignals = [
      makeTwitterSignal({ content: "GIVEAWAY! Follow and retweet to win $500!" }),
      makeTwitterSignal({ content: "Free airdrop for all followers" }),
    ];

    const result = await runScrubber("550e8400-e29b-41d4-a716-446655440000", noiseSignals, new Set());
    expect(result.output.total_passed).toBe(0);
    expect(result.output.entities).toEqual([]);
  });
});
