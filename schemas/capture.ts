import { z } from "zod";

// ── Source-agnostic signal input ──

const BaseSignalSourceSchema = z.object({
  content: z.string().max(10000),
  timestamp: z.string().datetime(),
});

export const TwitterSignalSchema = BaseSignalSourceSchema.extend({
  source_type: z.literal("twitter"),
  tweet_id: z.string(),
  author_handle: z.string(),
  author_name: z.string(),
  author_followers: z.number().int().nonnegative(),
  author_verified: z.boolean(),
  likes: z.number().int().nonnegative(),
  retweets: z.number().int().nonnegative(),
  replies: z.number().int().nonnegative(),
  quotes: z.number().int().nonnegative(),
  media_urls: z.array(z.string().url()).default([]),
  is_thread: z.boolean(),
  thread_position: z.number().int().optional(),
  parent_tweet_id: z.string().optional(),
  urls: z.array(z.string()).default([]),
  hashtags: z.array(z.string()).default([]),
});

export const GitHubSignalSchema = BaseSignalSourceSchema.extend({
  source_type: z.literal("github"),
  repo: z.string(),
  stars_delta: z.number().int(),
  issues_delta: z.number().int(),
  event_type: z.string(),
});

export const HNSignalSchema = BaseSignalSourceSchema.extend({
  source_type: z.literal("hackernews"),
  post_id: z.string(),
  points: z.number().int().nonnegative(),
  comment_count: z.number().int().nonnegative(),
});

export const RedditSignalSchema = BaseSignalSourceSchema.extend({
  source_type: z.literal("reddit"),
  subreddit: z.string(),
  post_id: z.string(),
  upvotes: z.number().int(),
});

export const SignalSourceSchema = z.discriminatedUnion("source_type", [
  TwitterSignalSchema,
  GitHubSignalSchema,
  HNSignalSchema,
  RedditSignalSchema,
]);

// Backward-compatible alias — existing code uses TweetData
export const TweetDataSchema = TwitterSignalSchema;

export const RawCaptureSchema = z.object({
  capture_id: z.string().uuid(),
  source_feed: z.string(),
  source_type: z.enum(["twitter", "github", "hackernews", "reddit"]).default("twitter"),
  captured_at: z.string().datetime(),
  agent_version: z.string(),
  signals: z.array(SignalSourceSchema).max(500),
  metadata: z.object({
    scroll_depth: z.number(),
    capture_duration_ms: z.number(),
    total_extracted: z.number().int(),
  }),
  signature: z.string(),
  timestamp: z.number(),
  nonce: z.string().uuid(),
});
