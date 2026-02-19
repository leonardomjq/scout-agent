import { createHmac, timingSafeEqual } from "crypto";
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";

const MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000; // 5 minutes
const MIN_INGEST_INTERVAL_MS = 60 * 1000; // 60 seconds

interface VerifyResult {
  valid: boolean;
  error?: string;
}

export function computeHmac(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = computeHmac(payload, secret);
  try {
    return timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

export function verifyTimestamp(timestampMs: number): boolean {
  const now = Date.now();
  const age = Math.abs(now - timestampMs);
  return age <= MAX_TIMESTAMP_AGE_MS;
}

export async function verifyNonce(nonce: string): Promise<boolean> {
  const { databases } = createAdminClient();

  try {
    // Try to insert — if unique index rejects it, it's a replay
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.INGEST_NONCES,
      ID.unique(),
      { nonce }
    );
    return true;
  } catch (err: unknown) {
    const e = err as { code?: number };
    // 409 = duplicate unique index = nonce already used
    if (e.code === 409) return false;
    throw new Error(`Nonce check failed: ${e}`);
  }
}

export async function verifyRateLimit(sourceFeed: string): Promise<boolean> {
  const { databases } = createAdminClient();

  const result = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.RAW_CAPTURES,
    [
      Query.equal("source_feed", [sourceFeed]),
      Query.orderDesc("$createdAt"),
      Query.limit(1),
    ]
  );

  if (result.total === 0) return true;

  const lastIngest = new Date(result.documents[0].$createdAt).getTime();
  return Date.now() - lastIngest >= MIN_INGEST_INTERVAL_MS;
}

export async function verifyIngestRequest(
  rawBody: string,
  signature: string,
  timestampMs: number,
  nonce: string,
  sourceFeed: string
): Promise<VerifyResult> {
  const secret = process.env.INGEST_HMAC_SECRET;
  if (!secret) return { valid: false, error: "HMAC secret not configured" };

  // 1. Verify HMAC signature
  if (!verifySignature(rawBody, signature, secret)) {
    return { valid: false, error: "Invalid signature" };
  }

  // 2. Verify timestamp freshness
  if (!verifyTimestamp(timestampMs)) {
    return { valid: false, error: "Timestamp too old or too far in the future" };
  }

  // 3. Verify nonce uniqueness
  const nonceValid = await verifyNonce(nonce);
  if (!nonceValid) {
    return { valid: false, error: "Duplicate nonce — possible replay attack" };
  }

  // 4. Rate limit check
  const rateOk = await verifyRateLimit(sourceFeed);
  if (!rateOk) {
    return { valid: false, error: "Rate limit exceeded — wait at least 60s between ingests" };
  }

  return { valid: true };
}
