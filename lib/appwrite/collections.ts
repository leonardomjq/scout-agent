export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID ?? "scout_db";

export const COLLECTIONS = {
  RAW_CAPTURES: "raw_captures",
  SCRUBBER_OUTPUTS: "scrubber_outputs",
  ENTITY_BASELINES: "entity_baselines",
  SIGNALS: "signals",
  ALPHA_CARDS: "alpha_cards",
  PIPELINE_RUNS: "pipeline_runs",
  PROCESSED_TWEET_IDS: "processed_tweet_ids",
  INGEST_NONCES: "ingest_nonces",
  PIPELINE_LOCKS: "pipeline_locks",
  USER_PROFILES: "user_profiles",
  SUBSCRIPTIONS: "subscriptions",
} as const;

export const SESSION_COOKIE = "scout_session";
