/**
 * Appwrite Database Setup Script
 *
 * Creates the ScoutAgent database, collections, attributes, and indexes.
 * Run with: npx tsx scripts/setup-appwrite.ts
 *
 * Requires env vars: NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT, APPWRITE_API_KEY
 */

import { Client, Databases, ID, IndexType, Permission, Role } from "node-appwrite";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;
const API_KEY = process.env.APPWRITE_API_KEY!;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID ?? "scout_db";

if (!ENDPOINT || !PROJECT || !API_KEY) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT, APPWRITE_API_KEY"
  );
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT)
  .setKey(API_KEY);

const databases = new Databases(client);

// Helper: wait for attribute to be available before creating indexes
async function waitForAttribute(
  collectionId: string,
  key: string,
  maxWait = 30000
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const attr = await databases.getAttribute(DATABASE_ID, collectionId, key) as { status?: string };
    if (attr.status === "available") return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Attribute ${key} on ${collectionId} did not become available`);
}

async function main() {
  console.log("Creating database...");
  try {
    await databases.create(DATABASE_ID, "ScoutAgent");
    console.log("  Database created");
  } catch (e: unknown) {
    const err = e as { code?: number };
    if (err.code === 409) console.log("  Database already exists, continuing...");
    else throw e;
  }

  // ── raw_captures ──
  console.log("\nCreating raw_captures...");
  await createCollection("raw_captures", "Raw Captures", []);
  await databases.createStringAttribute(DATABASE_ID, "raw_captures", "capture_id", 255, true);
  await databases.createStringAttribute(DATABASE_ID, "raw_captures", "source_feed", 255, true);
  await databases.createEnumAttribute(DATABASE_ID, "raw_captures", "source_type", ["twitter", "github", "hackernews", "reddit"], false, "twitter");
  await databases.createDatetimeAttribute(DATABASE_ID, "raw_captures", "captured_at", true);
  await databases.createStringAttribute(DATABASE_ID, "raw_captures", "agent_version", 50, true);
  await databases.createStringAttribute(DATABASE_ID, "raw_captures", "payload", 1048576, true); // 1MB JSON string
  await databases.createEnumAttribute(DATABASE_ID, "raw_captures", "status", ["pending", "processing", "processed", "failed"], false, "pending");
  await databases.createStringAttribute(DATABASE_ID, "raw_captures", "error_message", 2000, false);
  await waitForAttribute("raw_captures", "capture_id");
  await waitForAttribute("raw_captures", "status");
  await waitForAttribute("raw_captures", "source_feed");
  await databases.createIndex(DATABASE_ID, "raw_captures", "idx_capture_id", IndexType.Unique, ["capture_id"]);
  await databases.createIndex(DATABASE_ID, "raw_captures", "idx_status", IndexType.Key, ["status"]);
  await databases.createIndex(DATABASE_ID, "raw_captures", "idx_source_feed_created", IndexType.Key, ["source_feed", "$createdAt"]);
  console.log("  Done");

  // ── scrubber_outputs ──
  console.log("\nCreating scrubber_outputs...");
  await createCollection("scrubber_outputs", "Scrubber Outputs", []);
  await databases.createStringAttribute(DATABASE_ID, "scrubber_outputs", "capture_id", 255, true);
  await databases.createDatetimeAttribute(DATABASE_ID, "scrubber_outputs", "processed_at", true);
  await databases.createIntegerAttribute(DATABASE_ID, "scrubber_outputs", "total_input", false, 0);
  await databases.createIntegerAttribute(DATABASE_ID, "scrubber_outputs", "total_passed", false, 0);
  await databases.createStringAttribute(DATABASE_ID, "scrubber_outputs", "entities", 1048576, true); // JSON string
  await databases.createStringAttribute(DATABASE_ID, "scrubber_outputs", "friction_points", 1048576, true);
  await databases.createStringAttribute(DATABASE_ID, "scrubber_outputs", "notable_tweets", 1048576, true);
  await waitForAttribute("scrubber_outputs", "processed_at");
  await databases.createIndex(DATABASE_ID, "scrubber_outputs", "idx_processed_at", IndexType.Key, ["processed_at"]);
  console.log("  Done");

  // ── entity_baselines ──
  console.log("\nCreating entity_baselines...");
  await createCollection("entity_baselines", "Entity Baselines", []);
  await databases.createStringAttribute(DATABASE_ID, "entity_baselines", "entity_name", 255, true);
  await databases.createStringAttribute(DATABASE_ID, "entity_baselines", "category", 50, true);
  await databases.createFloatAttribute(DATABASE_ID, "entity_baselines", "baseline_mentions_per_day", false, 0);
  await databases.createFloatAttribute(DATABASE_ID, "entity_baselines", "baseline_sentiment", false, 0.5);
  await databases.createFloatAttribute(DATABASE_ID, "entity_baselines", "baseline_friction_rate", false, 0);
  await databases.createDatetimeAttribute(DATABASE_ID, "entity_baselines", "last_updated", true);
  await databases.createStringAttribute(DATABASE_ID, "entity_baselines", "daily_snapshots", 50000, true); // JSON string (TEXT storage)
  await waitForAttribute("entity_baselines", "entity_name");
  await databases.createIndex(DATABASE_ID, "entity_baselines", "idx_entity_name", IndexType.Unique, ["entity_name"]);
  console.log("  Done");

  // ── signals (replaces pattern_clusters) ──
  console.log("\nCreating signals...");
  await createCollection("signals", "Signals", []);
  await databases.createStringAttribute(DATABASE_ID, "signals", "signal_id", 255, true);
  await databases.createEnumAttribute(DATABASE_ID, "signals", "type", ["velocity_spike", "sentiment_flip", "friction_cluster", "new_emergence"], true);
  await databases.createStringAttribute(DATABASE_ID, "signals", "entities", 10000, true, undefined, true); // array
  await databases.createFloatAttribute(DATABASE_ID, "signals", "signal_strength", true);
  await databases.createStringAttribute(DATABASE_ID, "signals", "friction_theme", 500, false);
  await databases.createFloatAttribute(DATABASE_ID, "signals", "mention_velocity", true);
  await databases.createFloatAttribute(DATABASE_ID, "signals", "sentiment_delta", true);
  await databases.createFloatAttribute(DATABASE_ID, "signals", "friction_spike", true);
  await databases.createEnumAttribute(DATABASE_ID, "signals", "direction", ["accelerating", "decelerating", "new"], true);
  await databases.createStringAttribute(DATABASE_ID, "signals", "evidence_tweet_ids", 10000, false, undefined, true); // array
  await databases.createDatetimeAttribute(DATABASE_ID, "signals", "first_detected", true);
  await databases.createIntegerAttribute(DATABASE_ID, "signals", "window_hours", true);
  await waitForAttribute("signals", "signal_id");
  await waitForAttribute("signals", "signal_strength");
  await databases.createIndex(DATABASE_ID, "signals", "idx_signal_id", IndexType.Unique, ["signal_id"]);
  await databases.createIndex(DATABASE_ID, "signals", "idx_signal_strength", IndexType.Key, ["signal_strength"]);
  console.log("  Done");

  // ── alpha_cards ──
  console.log("\nCreating alpha_cards...");
  await createCollection("alpha_cards", "Alpha Cards", [
    Permission.read(Role.users()),
  ]);
  await databases.createStringAttribute(DATABASE_ID, "alpha_cards", "title", 500, true);
  await databases.createEnumAttribute(DATABASE_ID, "alpha_cards", "category", ["velocity_spike", "sentiment_flip", "friction_cluster", "new_emergence"], true);
  await databases.createStringAttribute(DATABASE_ID, "alpha_cards", "entities", 10000, true, undefined, true); // array
  await databases.createFloatAttribute(DATABASE_ID, "alpha_cards", "signal_strength", true);
  await databases.createEnumAttribute(DATABASE_ID, "alpha_cards", "direction", ["accelerating", "decelerating", "new"], true);
  await databases.createIntegerAttribute(DATABASE_ID, "alpha_cards", "signal_count", false, 0);
  await databases.createEnumAttribute(DATABASE_ID, "alpha_cards", "status", ["fresh", "warm", "cold", "archived"], false, "fresh");
  await databases.createFloatAttribute(DATABASE_ID, "alpha_cards", "freshness_score", false, 1.0);
  await databases.createStringAttribute(DATABASE_ID, "alpha_cards", "cluster_id", 255, true);
  // Free-tier field
  // Sizes > 16381 use TEXT storage (12-byte pointer) instead of VARCHAR (size×4)
  await databases.createStringAttribute(DATABASE_ID, "alpha_cards", "thesis", 50000, true);
  // Pro-tier fields (nullable)
  await databases.createStringAttribute(DATABASE_ID, "alpha_cards", "friction_detail", 50000, false);
  await databases.createStringAttribute(DATABASE_ID, "alpha_cards", "gap_analysis", 50000, false);
  await databases.createStringAttribute(DATABASE_ID, "alpha_cards", "timing_signal", 50000, false);
  await databases.createStringAttribute(DATABASE_ID, "alpha_cards", "risk_factors", 10000, false, undefined, true); // array
  await databases.createStringAttribute(DATABASE_ID, "alpha_cards", "evidence", 1048576, false); // JSON string
  await databases.createStringAttribute(DATABASE_ID, "alpha_cards", "competitive_landscape", 50000, false);
  await databases.createEnumAttribute(DATABASE_ID, "alpha_cards", "opportunity_type", ["tooling_gap", "migration_aid", "dx_improvement", "integration"], false);
  await waitForAttribute("alpha_cards", "status");
  await waitForAttribute("alpha_cards", "freshness_score");
  await databases.createIndex(DATABASE_ID, "alpha_cards", "idx_status_freshness", IndexType.Key, ["status", "freshness_score"]);
  console.log("  Done");

  // ── pipeline_runs ──
  console.log("\nCreating pipeline_runs...");
  await createCollection("pipeline_runs", "Pipeline Runs", []);
  await databases.createEnumAttribute(DATABASE_ID, "pipeline_runs", "status", ["running", "completed", "failed"], false, "running");
  await databases.createDatetimeAttribute(DATABASE_ID, "pipeline_runs", "started_at", true);
  await databases.createDatetimeAttribute(DATABASE_ID, "pipeline_runs", "completed_at", false);
  await databases.createIntegerAttribute(DATABASE_ID, "pipeline_runs", "captures_processed", false, 0);
  await databases.createStringAttribute(DATABASE_ID, "pipeline_runs", "l1_stats", 50000, true); // JSON string (TEXT storage)
  await databases.createStringAttribute(DATABASE_ID, "pipeline_runs", "l2_stats", 50000, true);
  await databases.createStringAttribute(DATABASE_ID, "pipeline_runs", "l3_stats", 50000, true);
  await databases.createIntegerAttribute(DATABASE_ID, "pipeline_runs", "total_tokens_used", false, 0);
  await databases.createStringAttribute(DATABASE_ID, "pipeline_runs", "errors", 10000, false, undefined, true); // array
  await waitForAttribute("pipeline_runs", "status");
  await databases.createIndex(DATABASE_ID, "pipeline_runs", "idx_status", IndexType.Key, ["status"]);
  console.log("  Done");

  // ── processed_tweet_ids ──
  console.log("\nCreating processed_tweet_ids...");
  await createCollection("processed_tweet_ids", "Processed Tweet IDs", []);
  await databases.createStringAttribute(DATABASE_ID, "processed_tweet_ids", "tweet_id", 255, true);
  await databases.createStringAttribute(DATABASE_ID, "processed_tweet_ids", "capture_id", 255, true);
  await waitForAttribute("processed_tweet_ids", "tweet_id");
  await databases.createIndex(DATABASE_ID, "processed_tweet_ids", "idx_tweet_id", IndexType.Unique, ["tweet_id"]);
  console.log("  Done");

  // ── pipeline_locks ── (used for atomic concurrency control)
  console.log("\nCreating pipeline_locks...");
  await createCollection("pipeline_locks", "Pipeline Locks", []);
  // No custom attributes needed — document existence IS the lock
  console.log("  Done");

  // ── ingest_nonces ──
  console.log("\nCreating ingest_nonces...");
  await createCollection("ingest_nonces", "Ingest Nonces", []);
  await databases.createStringAttribute(DATABASE_ID, "ingest_nonces", "nonce", 255, true);
  await waitForAttribute("ingest_nonces", "nonce");
  await databases.createIndex(DATABASE_ID, "ingest_nonces", "idx_nonce", IndexType.Unique, ["nonce"]);
  console.log("  Done");

  // ── user_profiles ──
  console.log("\nCreating user_profiles...");
  await createCollection("user_profiles", "User Profiles", [
    Permission.read(Role.users()),
  ]);
  await databases.createEnumAttribute(DATABASE_ID, "user_profiles", "tier", ["free", "pro"], false, "free");
  await databases.createStringAttribute(DATABASE_ID, "user_profiles", "stripe_customer_id", 255, false);
  await waitForAttribute("user_profiles", "stripe_customer_id");
  await databases.createIndex(DATABASE_ID, "user_profiles", "idx_stripe_customer", IndexType.Key, ["stripe_customer_id"]);
  console.log("  Done");

  // ── subscriptions ──
  console.log("\nCreating subscriptions...");
  await createCollection("subscriptions", "Subscriptions", [
    Permission.read(Role.users()),
  ]);
  await databases.createStringAttribute(DATABASE_ID, "subscriptions", "user_id", 255, true);
  await databases.createStringAttribute(DATABASE_ID, "subscriptions", "stripe_subscription_id", 255, true);
  await databases.createStringAttribute(DATABASE_ID, "subscriptions", "stripe_price_id", 255, true);
  await databases.createEnumAttribute(DATABASE_ID, "subscriptions", "status", ["active", "canceled", "past_due", "trialing", "incomplete"], true);
  await databases.createDatetimeAttribute(DATABASE_ID, "subscriptions", "current_period_start", true);
  await databases.createDatetimeAttribute(DATABASE_ID, "subscriptions", "current_period_end", true);
  await databases.createBooleanAttribute(DATABASE_ID, "subscriptions", "cancel_at_period_end", false, false);
  await waitForAttribute("subscriptions", "stripe_subscription_id");
  await waitForAttribute("subscriptions", "user_id");
  await waitForAttribute("subscriptions", "status");
  await databases.createIndex(DATABASE_ID, "subscriptions", "idx_stripe_sub", IndexType.Unique, ["stripe_subscription_id"]);
  await databases.createIndex(DATABASE_ID, "subscriptions", "idx_user_status", IndexType.Key, ["user_id", "status"]);
  console.log("  Done");

  console.log("\nAll collections created successfully!");
}

async function createCollection(
  id: string,
  name: string,
  permissions: string[]
): Promise<void> {
  try {
    const col = await databases.createCollection(DATABASE_ID, id, name, permissions);
    console.log(`  Collection ${id} created (ID: ${col.$id})`);
  } catch (e: unknown) {
    const err = e as { code?: number; message?: string };
    if (err.code === 409) {
      console.log(`  Collection ${id} already exists, skipping...`);
    } else {
      console.error(`  Failed to create collection ${id}:`, err.message ?? e);
      throw e;
    }
  }
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
