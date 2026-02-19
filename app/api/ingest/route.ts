import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import { RawCaptureSchema } from "@/schemas/capture";
import { verifyIngestRequest } from "@/lib/ingest/verify";
import { createAdminClient } from "@/lib/appwrite/admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { toJsonString } from "@/lib/appwrite/helpers";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Validate schema (including 500-tweet batch cap)
    const parsed = RawCaptureSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues ?? parsed.error },
        { status: 400 }
      );
    }

    const capture = parsed.data;

    // Verify HMAC + timestamp + nonce + rate limit
    const verification = await verifyIngestRequest(
      rawBody,
      capture.signature,
      capture.timestamp,
      capture.nonce,
      capture.source_feed
    );

    if (!verification.valid) {
      const status = verification.error?.includes("Rate limit") ? 429 : 401;
      return NextResponse.json(
        { error: verification.error },
        { status }
      );
    }

    // Idempotency check
    const { databases } = createAdminClient();
    const existing = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.RAW_CAPTURES,
      [Query.equal("capture_id", [capture.capture_id]), Query.limit(1)]
    );

    if (existing.total > 0) {
      return NextResponse.json(
        { message: "Capture already ingested", capture_id: capture.capture_id },
        { status: 200 }
      );
    }

    // Store raw capture
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.RAW_CAPTURES,
      ID.unique(),
      {
        capture_id: capture.capture_id,
        source_feed: capture.source_feed,
        source_type: capture.source_type,
        captured_at: capture.captured_at,
        agent_version: capture.agent_version,
        payload: toJsonString(JSON.parse(rawBody)),
        status: "pending",
      }
    );

    return NextResponse.json(
      { message: "Capture ingested", capture_id: capture.capture_id },
      { status: 200 }
    );
  } catch (err) {
    console.error("Ingest error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
