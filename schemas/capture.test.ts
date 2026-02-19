import { describe, it, expect } from "vitest";
import { TweetDataSchema, SignalSourceSchema, RawCaptureSchema } from "./capture";
import rawCapture from "@/__fixtures__/raw-capture.json";

describe("TweetDataSchema (TwitterSignal)", () => {
  it("validates a correct tweet signal", () => {
    const tweet = rawCapture.signals[0];
    expect(() => TweetDataSchema.parse(tweet)).not.toThrow();
  });

  it("rejects tweet with negative followers", () => {
    const bad = { ...rawCapture.signals[0], author_followers: -1 };
    expect(() => TweetDataSchema.parse(bad)).toThrow();
  });

  it("rejects tweet with content exceeding 10000 chars", () => {
    const bad = { ...rawCapture.signals[0], content: "x".repeat(10001) };
    expect(() => TweetDataSchema.parse(bad)).toThrow();
  });

  it("accepts tweet with optional fields missing", () => {
    const minimal = {
      source_type: "twitter" as const,
      tweet_id: "t1",
      author_handle: "user",
      author_name: "User",
      author_followers: 0,
      author_verified: false,
      content: "Hello world",
      timestamp: "2025-01-01T00:00:00Z",
      likes: 0,
      retweets: 0,
      replies: 0,
      quotes: 0,
      is_thread: false,
    };
    const result = TweetDataSchema.parse(minimal);
    expect(result.media_urls).toEqual([]);
    expect(result.urls).toEqual([]);
    expect(result.hashtags).toEqual([]);
  });

  it("rejects invalid datetime format", () => {
    const bad = { ...rawCapture.signals[0], timestamp: "not-a-date" };
    expect(() => TweetDataSchema.parse(bad)).toThrow();
  });

  it("rejects invalid media URLs", () => {
    const bad = { ...rawCapture.signals[0], media_urls: ["not-a-url"] };
    expect(() => TweetDataSchema.parse(bad)).toThrow();
  });
});

describe("SignalSourceSchema discriminated union", () => {
  it("validates a twitter signal", () => {
    const signal = rawCapture.signals[0];
    expect(() => SignalSourceSchema.parse(signal)).not.toThrow();
  });

  it("validates a github signal", () => {
    const signal = {
      source_type: "github",
      repo: "facebook/react",
      stars_delta: 150,
      issues_delta: 10,
      event_type: "release",
      content: "React v20 released",
      timestamp: "2025-01-15T12:00:00Z",
    };
    expect(() => SignalSourceSchema.parse(signal)).not.toThrow();
  });

  it("validates a hackernews signal", () => {
    const signal = {
      source_type: "hackernews",
      post_id: "hn-123",
      points: 500,
      comment_count: 200,
      content: "Show HN: My new tool",
      timestamp: "2025-01-15T12:00:00Z",
    };
    expect(() => SignalSourceSchema.parse(signal)).not.toThrow();
  });

  it("validates a reddit signal", () => {
    const signal = {
      source_type: "reddit",
      subreddit: "programming",
      post_id: "abc123",
      upvotes: 1500,
      content: "Why I switched from X to Y",
      timestamp: "2025-01-15T12:00:00Z",
    };
    expect(() => SignalSourceSchema.parse(signal)).not.toThrow();
  });

  it("rejects unknown source_type", () => {
    const bad = {
      source_type: "mastodon",
      content: "test",
      timestamp: "2025-01-15T12:00:00Z",
    };
    expect(() => SignalSourceSchema.parse(bad)).toThrow();
  });
});

describe("RawCaptureSchema", () => {
  it("validates a correct capture payload", () => {
    expect(() => RawCaptureSchema.parse(rawCapture)).not.toThrow();
  });

  it("defaults source_type to twitter", () => {
    const { source_type, ...withoutSourceType } = rawCapture;
    const result = RawCaptureSchema.parse(withoutSourceType);
    expect(result.source_type).toBe("twitter");
  });

  it("rejects capture with more than 500 signals", () => {
    const signal = rawCapture.signals[0];
    const bad = {
      ...rawCapture,
      signals: Array(501).fill(signal),
    };
    expect(() => RawCaptureSchema.parse(bad)).toThrow();
  });

  it("rejects capture with invalid UUID capture_id", () => {
    const bad = { ...rawCapture, capture_id: "not-a-uuid" };
    expect(() => RawCaptureSchema.parse(bad)).toThrow();
  });

  it("rejects capture with invalid nonce", () => {
    const bad = { ...rawCapture, nonce: "not-a-uuid" };
    expect(() => RawCaptureSchema.parse(bad)).toThrow();
  });

  it("rejects missing required fields", () => {
    const { source_feed, ...bad } = rawCapture;
    expect(() => RawCaptureSchema.parse(bad)).toThrow();
  });
});
