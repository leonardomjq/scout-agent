import { describe, it, expect } from "vitest";
import { gateAlphaCard } from "./gate";
import type { AlphaCard } from "@/types";

const fullCard: AlphaCard = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  created_at: "2025-01-15T12:00:00Z",
  status: "fresh",
  freshness_score: 1.0,
  title: "K8s Exodus: Simplification Wave",
  category: "friction_cluster",
  entities: ["kubernetes", "docker", "kamal"],
  signal_strength: 0.72,
  direction: "accelerating",
  signal_count: 5,
  thesis: "Teams migrating away from K8s",
  friction_detail: "Operational complexity and cost overhead",
  gap_analysis: "No tool addresses K8s migration path specifically",
  timing_signal: "Mention velocity at 3.2x baseline",
  risk_factors: ["Enterprise resistance", "K8s DX improvements"],
  evidence: [
    { tweet_id: "t1", author: "cloudarch", snippet: "Replaced K8s", relevance: 0.95 },
    { tweet_id: "t2", author: "devops", snippet: "70% cost reduction", relevance: 0.88 },
    { tweet_id: "t3", author: "indie", snippet: "Kamal is amazing", relevance: 0.75 },
  ],
  competitive_landscape: "Kamal (Rails-centric), Docker Compose, Coolify",
  opportunity_type: "migration_aid",
  cluster_id: "660e8400-e29b-41d4-a716-446655440000",
};

describe("gateAlphaCard", () => {
  it("returns full card for pro tier", () => {
    const result = gateAlphaCard(fullCard, "pro");
    expect(result.thesis).toBe(fullCard.thesis);
    expect(result.friction_detail).toBe(fullCard.friction_detail);
    expect(result.gap_analysis).toBe(fullCard.gap_analysis);
    expect(result.timing_signal).toBe(fullCard.timing_signal);
    expect(result.risk_factors).toEqual(fullCard.risk_factors);
    expect(result.evidence).toEqual(fullCard.evidence);
    expect(result.competitive_landscape).toBe(fullCard.competitive_landscape);
    expect(result.opportunity_type).toBe(fullCard.opportunity_type);
  });

  it("nullifies pro fields for free tier", () => {
    const result = gateAlphaCard(fullCard, "free");
    expect(result.friction_detail).toBeNull();
    expect(result.gap_analysis).toBeNull();
    expect(result.timing_signal).toBeNull();
    expect(result.risk_factors).toBeNull();
    expect(result.competitive_landscape).toBeNull();
    expect(result.opportunity_type).toBeNull();
  });

  it("keeps thesis visible for free tier", () => {
    const result = gateAlphaCard(fullCard, "free");
    expect(result.thesis).toBe(fullCard.thesis);
  });

  it("truncates evidence to 2 items for free tier", () => {
    const result = gateAlphaCard(fullCard, "free");
    expect(result.evidence).not.toBeNull();
    expect(result.evidence!.length).toBe(2);
    expect(result.evidence![0].tweet_id).toBe("t1");
    expect(result.evidence![1].tweet_id).toBe("t2");
  });

  it("preserves free tier fields for free tier", () => {
    const result = gateAlphaCard(fullCard, "free");
    expect(result.id).toBe(fullCard.id);
    expect(result.title).toBe(fullCard.title);
    expect(result.category).toBe(fullCard.category);
    expect(result.entities).toEqual(fullCard.entities);
    expect(result.signal_strength).toBe(fullCard.signal_strength);
    expect(result.direction).toBe(fullCard.direction);
    expect(result.signal_count).toBe(fullCard.signal_count);
    expect(result.cluster_id).toBe(fullCard.cluster_id);
  });

  it("does not mutate the original card", () => {
    const original = { ...fullCard };
    gateAlphaCard(fullCard, "free");
    expect(fullCard.friction_detail).toBe(original.friction_detail);
    expect(fullCard.gap_analysis).toBe(original.gap_analysis);
  });

  it("handles card already having null pro fields", () => {
    const nulledCard: AlphaCard = {
      ...fullCard,
      friction_detail: null,
      gap_analysis: null,
      timing_signal: null,
      risk_factors: null,
      evidence: null,
      competitive_landscape: null,
      opportunity_type: null,
    };
    const result = gateAlphaCard(nulledCard, "free");
    expect(result.thesis).toBe(fullCard.thesis);
    expect(result.evidence).toBeNull();
  });
});
