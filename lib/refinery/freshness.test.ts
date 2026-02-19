import { describe, it, expect, vi, afterEach } from "vitest";
import { computeFreshness } from "./freshness";

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

describe("computeFreshness", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Fresh boundaries ──
  it("returns fresh/1.0 for brand new card (0h)", () => {
    const { status, score } = computeFreshness(hoursAgo(0));
    expect(status).toBe("fresh");
    expect(score).toBe(1.0);
  });

  it("returns fresh with linear decay at 6h", () => {
    const { status, score } = computeFreshness(hoursAgo(6));
    expect(status).toBe("fresh");
    // 1.0 - (6/12)*0.25 = 0.875
    expect(score).toBeCloseTo(0.88, 1);
  });

  it("returns fresh at 11.9h (just before warm)", () => {
    const { status } = computeFreshness(hoursAgo(11.9));
    expect(status).toBe("fresh");
  });

  // ── Warm boundaries ──
  it("returns warm at 12h", () => {
    const { status, score } = computeFreshness(hoursAgo(12));
    expect(status).toBe("warm");
    expect(score).toBe(0.75);
  });

  it("returns warm with decay at 30h", () => {
    const { status, score } = computeFreshness(hoursAgo(30));
    expect(status).toBe("warm");
    // 0.75 - ((30-12)/36)*0.35 = 0.75 - 0.175 = 0.575
    expect(score).toBeCloseTo(0.58, 1);
  });

  it("returns warm at 47.9h (just before cold)", () => {
    const { status } = computeFreshness(hoursAgo(47.9));
    expect(status).toBe("warm");
  });

  // ── Cold boundaries ──
  it("returns cold at 48h", () => {
    const { status, score } = computeFreshness(hoursAgo(48));
    expect(status).toBe("cold");
    expect(score).toBe(0.4);
  });

  it("returns cold with decay at 100h", () => {
    const { status, score } = computeFreshness(hoursAgo(100));
    expect(status).toBe("cold");
    // 0.4 - ((100-48)/120)*0.3 = 0.4 - 0.13 = 0.27
    expect(score).toBeCloseTo(0.27, 1);
  });

  it("clamps cold score to 0.1 at 167h", () => {
    const { status, score } = computeFreshness(hoursAgo(167));
    expect(status).toBe("cold");
    expect(score).toBe(0.1);
  });

  // ── Archived boundaries ──
  it("returns archived at exactly 168h (7d)", () => {
    const { status, score } = computeFreshness(hoursAgo(168));
    expect(status).toBe("archived");
    expect(score).toBe(0);
  });

  it("returns archived for very old cards", () => {
    const { status, score } = computeFreshness(hoursAgo(500));
    expect(status).toBe("archived");
    expect(score).toBe(0);
  });
});
