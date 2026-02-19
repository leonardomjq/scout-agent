import { describe, it, expect } from "vitest";
import { LayerResultSchema, PipelineRunSchema } from "./pipeline";

describe("LayerResultSchema", () => {
  it("validates a correct layer result", () => {
    const result = {
      success: [{ id: "1" }, { id: "2" }],
      failed: [{ item_id: "3", error: "parsing failed" }],
      errors: [{ message: "timeout", layer: "scrubber" }],
    };
    expect(() => LayerResultSchema.parse(result)).not.toThrow();
  });

  it("validates empty arrays", () => {
    const result = { success: [], failed: [], errors: [] };
    expect(() => LayerResultSchema.parse(result)).not.toThrow();
  });

  it("accepts delta_engine layer name", () => {
    const result = {
      success: [],
      failed: [],
      errors: [{ message: "error", layer: "delta_engine" }],
    };
    expect(() => LayerResultSchema.parse(result)).not.toThrow();
  });

  it("rejects invalid layer name", () => {
    const result = {
      success: [],
      failed: [],
      errors: [{ message: "error", layer: "invalid_layer" }],
    };
    expect(() => LayerResultSchema.parse(result)).toThrow();
  });
});

describe("PipelineRunSchema", () => {
  it("validates a completed pipeline run", () => {
    const run = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      started_at: "2025-01-15T12:00:00Z",
      completed_at: "2025-01-15T12:05:00Z",
      status: "completed",
      captures_processed: 5,
      l1_stats: { input: 100, passed: 80, failed: 2 },
      l2_stats: { signals_found: 10, signals_qualifying: 3, baselines_updated: 8 },
      l3_stats: { cards_generated: 3, cards_updated: 1, failed: 0 },
      total_tokens_used: 15000,
      errors: [],
    };
    expect(() => PipelineRunSchema.parse(run)).not.toThrow();
  });

  it("validates a running pipeline (null completed_at)", () => {
    const run = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      started_at: "2025-01-15T12:00:00Z",
      completed_at: null,
      status: "running",
      captures_processed: 0,
      l1_stats: { input: 0, passed: 0, failed: 0 },
      l2_stats: { signals_found: 0, signals_qualifying: 0, baselines_updated: 0 },
      l3_stats: { cards_generated: 0, cards_updated: 0, failed: 0 },
      total_tokens_used: 0,
      errors: [],
    };
    expect(() => PipelineRunSchema.parse(run)).not.toThrow();
  });

  it("rejects invalid status", () => {
    const run = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      started_at: "2025-01-15T12:00:00Z",
      completed_at: null,
      status: "paused",
      captures_processed: 0,
      l1_stats: { input: 0, passed: 0, failed: 0 },
      l2_stats: { signals_found: 0, signals_qualifying: 0, baselines_updated: 0 },
      l3_stats: { cards_generated: 0, cards_updated: 0, failed: 0 },
      total_tokens_used: 0,
      errors: [],
    };
    expect(() => PipelineRunSchema.parse(run)).toThrow();
  });
});
