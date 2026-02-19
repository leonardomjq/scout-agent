import { describe, it, expect } from "vitest";
import { AlphaCardSchema } from "./alpha";
import strategistResponse from "@/__fixtures__/strategist-response.json";

const validCard = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  created_at: "2025-01-15T12:00:00Z",
  status: "fresh" as const,
  freshness_score: 1.0,
  ...strategistResponse,
};

describe("AlphaCardSchema", () => {
  it("validates a full alpha card", () => {
    expect(() => AlphaCardSchema.parse(validCard)).not.toThrow();
  });

  it("validates a card with null pro fields (free tier)", () => {
    const freeCard = {
      ...validCard,
      friction_detail: null,
      gap_analysis: null,
      timing_signal: null,
      risk_factors: null,
      evidence: null,
      competitive_landscape: null,
      opportunity_type: null,
    };
    expect(() => AlphaCardSchema.parse(freeCard)).not.toThrow();
  });

  it("rejects invalid category", () => {
    const bad = { ...validCard, category: "invalid" };
    expect(() => AlphaCardSchema.parse(bad)).toThrow();
  });

  it("rejects signal_strength below 0", () => {
    const bad = { ...validCard, signal_strength: -0.1 };
    expect(() => AlphaCardSchema.parse(bad)).toThrow();
  });

  it("rejects signal_strength above 1", () => {
    const bad = { ...validCard, signal_strength: 1.1 };
    expect(() => AlphaCardSchema.parse(bad)).toThrow();
  });

  it("rejects invalid status", () => {
    const bad = { ...validCard, status: "active" };
    expect(() => AlphaCardSchema.parse(bad)).toThrow();
  });

  it("rejects invalid direction", () => {
    const bad = { ...validCard, direction: "rising" };
    expect(() => AlphaCardSchema.parse(bad)).toThrow();
  });

  it("rejects missing required fields", () => {
    const { title, ...bad } = validCard;
    expect(() => AlphaCardSchema.parse(bad)).toThrow();
  });

  it("validates all valid categories", () => {
    const categories = [
      "velocity_spike",
      "sentiment_flip",
      "friction_cluster",
      "new_emergence",
    ];
    for (const category of categories) {
      expect(() =>
        AlphaCardSchema.parse({ ...validCard, category })
      ).not.toThrow();
    }
  });

  it("validates all valid statuses", () => {
    const statuses = ["fresh", "warm", "cold", "archived"];
    for (const status of statuses) {
      expect(() =>
        AlphaCardSchema.parse({ ...validCard, status })
      ).not.toThrow();
    }
  });

  it("validates all valid directions", () => {
    const directions = ["accelerating", "decelerating", "new"];
    for (const direction of directions) {
      expect(() =>
        AlphaCardSchema.parse({ ...validCard, direction })
      ).not.toThrow();
    }
  });

  it("validates all valid opportunity_types", () => {
    const types = ["tooling_gap", "migration_aid", "dx_improvement", "integration"];
    for (const opportunity_type of types) {
      expect(() =>
        AlphaCardSchema.parse({ ...validCard, opportunity_type })
      ).not.toThrow();
    }
  });
});
