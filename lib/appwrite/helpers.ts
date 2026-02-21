import type { Models, Databases } from "node-appwrite";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import type { AlphaCard, AlphaTier } from "@/types";

export function createDefaultProfile(): { tier: string; stripe_customer_id: null } {
  return { tier: "free", stripe_customer_id: null };
}

export async function ensureUserProfile(databases: Databases, userId: string): Promise<void> {
  try {
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USER_PROFILES,
      userId,
      createDefaultProfile()
    );
  } catch (err: unknown) {
    const e = err as { code?: number };
    if (e.code === 409) return; // Already exists (race condition) — safe to ignore
    throw err;
  }
}

export function toJsonString(obj: unknown): string {
  return JSON.stringify(obj);
}

export function fromJsonString<T>(str: string): T {
  return JSON.parse(str) as T;
}

export async function getUserTier(userId: string, databases: Databases): Promise<AlphaTier> {
  const profile = await databases.getDocument(
    DATABASE_ID,
    COLLECTIONS.USER_PROFILES,
    userId
  );
  return (profile.tier as AlphaTier) ?? "free";
}

export function documentToAlphaCard(doc: Models.Document): AlphaCard {
  return {
    id: doc.$id,
    created_at: doc.$createdAt,
    status: doc.status,
    freshness_score: doc.freshness_score,
    title: doc.title,
    category: doc.category,
    entities: doc.entities,
    signal_strength: doc.signal_strength,
    direction: doc.direction,
    signal_count: doc.signal_count,
    thesis: doc.thesis,
    friction_detail: doc.friction_detail ?? null,
    gap_analysis: doc.gap_analysis ?? null,
    timing_signal: doc.timing_signal ?? null,
    risk_factors: doc.risk_factors ?? null,
    evidence: doc.evidence ? fromJsonString(doc.evidence) : null,
    competitive_landscape: doc.competitive_landscape ?? null,
    opportunity_type: doc.opportunity_type ?? null,
    mvp_scope: doc.mvp_scope ?? null,
    monetization_angle: doc.monetization_angle ?? null,
    target_buyer: doc.target_buyer ?? null,
    distribution_channels: doc.distribution_channels ?? null,
    cluster_id: doc.cluster_id,
  };
}
