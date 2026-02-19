import { describe, it, expect } from "vitest";
import {
  TechEntitySchema,
  FrictionPointSchema,
  ScrubberOutputSchema,
} from "./refinery";
import { SignalSchema } from "./signal";

describe("TechEntitySchema", () => {
  it("validates a correct entity with mention_context", () => {
    const entity = {
      name: "React",
      category: "framework",
      sentiment: "positive",
      mention_context: "praise",
      friction_signal: false,
      mentions: 5,
    };
    expect(() => TechEntitySchema.parse(entity)).not.toThrow();
  });

  it("validates all mention_context values", () => {
    const contexts = ["announcement", "complaint", "migration", "comparison", "praise", "question"];
    for (const mention_context of contexts) {
      expect(() =>
        TechEntitySchema.parse({
          name: "React",
          category: "framework",
          sentiment: "positive",
          mention_context,
          friction_signal: false,
          mentions: 5,
        })
      ).not.toThrow();
    }
  });

  it("rejects invalid category", () => {
    const bad = {
      name: "React",
      category: "invalid_category",
      sentiment: "positive",
      mention_context: "praise",
      friction_signal: false,
      mentions: 5,
    };
    expect(() => TechEntitySchema.parse(bad)).toThrow();
  });

  it("rejects negative mentions", () => {
    const bad = {
      name: "React",
      category: "framework",
      sentiment: "positive",
      mention_context: "praise",
      friction_signal: false,
      mentions: -1,
    };
    expect(() => TechEntitySchema.parse(bad)).toThrow();
  });

  it("rejects missing mention_context", () => {
    const bad = {
      name: "React",
      category: "framework",
      sentiment: "positive",
      friction_signal: false,
      mentions: 5,
    };
    expect(() => TechEntitySchema.parse(bad)).toThrow();
  });
});

describe("FrictionPointSchema", () => {
  it("validates a correct friction point", () => {
    const fp = {
      entity: "Webpack",
      signal: "Custom loader migration issues",
      source_tweet_ids: ["t1", "t2"],
      severity: "high",
    };
    expect(() => FrictionPointSchema.parse(fp)).not.toThrow();
  });

  it("rejects invalid severity", () => {
    const bad = {
      entity: "Webpack",
      signal: "Issues",
      source_tweet_ids: ["t1"],
      severity: "critical",
    };
    expect(() => FrictionPointSchema.parse(bad)).toThrow();
  });
});

describe("ScrubberOutputSchema", () => {
  it("validates a correct scrubber output", () => {
    const output = {
      capture_id: "550e8400-e29b-41d4-a716-446655440000",
      processed_at: "2025-01-15T12:30:00Z",
      total_input: 6,
      total_passed: 5,
      entities: [
        { name: "React", category: "framework", sentiment: "positive", mention_context: "praise", friction_signal: false, mentions: 3 },
      ],
      friction_points: [],
      notable_tweets: [
        { tweet_id: "t1", relevance_score: 0.8, extracted_insight: "Good insight" },
      ],
    };
    expect(() => ScrubberOutputSchema.parse(output)).not.toThrow();
  });

  it("rejects relevance_score out of range", () => {
    const output = {
      capture_id: "550e8400-e29b-41d4-a716-446655440000",
      processed_at: "2025-01-15T12:30:00Z",
      total_input: 1,
      total_passed: 1,
      entities: [],
      friction_points: [],
      notable_tweets: [
        { tweet_id: "t1", relevance_score: 1.5, extracted_insight: "Bad score" },
      ],
    };
    expect(() => ScrubberOutputSchema.parse(output)).toThrow();
  });
});

describe("SignalSchema", () => {
  it("validates a correct signal", () => {
    const signal = {
      signal_id: "550e8400-e29b-41d4-a716-446655440000",
      type: "velocity_spike",
      entities: ["react", "svelte"],
      signal_strength: 0.65,
      friction_theme: "migration complexity",
      mention_velocity: 3.2,
      sentiment_delta: -0.25,
      friction_spike: 0.15,
      direction: "accelerating",
      evidence_tweet_ids: ["t1", "t2", "t3"],
      first_detected: "2025-01-15T12:00:00Z",
      window_hours: 48,
    };
    expect(() => SignalSchema.parse(signal)).not.toThrow();
  });

  it("rejects signal_strength above 1", () => {
    const bad = {
      signal_id: "550e8400-e29b-41d4-a716-446655440000",
      type: "velocity_spike",
      entities: ["react"],
      signal_strength: 1.1,
      friction_theme: null,
      mention_velocity: 2.0,
      sentiment_delta: 0,
      friction_spike: 0,
      direction: "new",
      evidence_tweet_ids: [],
      first_detected: "2025-01-15T12:00:00Z",
      window_hours: 48,
    };
    expect(() => SignalSchema.parse(bad)).toThrow();
  });

  it("rejects invalid signal type", () => {
    const bad = {
      signal_id: "550e8400-e29b-41d4-a716-446655440000",
      type: "momentum_shift",
      entities: ["react"],
      signal_strength: 0.5,
      friction_theme: null,
      mention_velocity: 2.0,
      sentiment_delta: 0,
      friction_spike: 0,
      direction: "new",
      evidence_tweet_ids: [],
      first_detected: "2025-01-15T12:00:00Z",
      window_hours: 48,
    };
    expect(() => SignalSchema.parse(bad)).toThrow();
  });

  it("rejects invalid direction", () => {
    const bad = {
      signal_id: "550e8400-e29b-41d4-a716-446655440000",
      type: "velocity_spike",
      entities: ["react"],
      signal_strength: 0.5,
      friction_theme: null,
      mention_velocity: 2.0,
      sentiment_delta: 0,
      friction_spike: 0,
      direction: "rising",
      evidence_tweet_ids: [],
      first_detected: "2025-01-15T12:00:00Z",
      window_hours: 48,
    };
    expect(() => SignalSchema.parse(bad)).toThrow();
  });
});
