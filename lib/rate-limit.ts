import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface RateLimitResult {
  allowed: boolean;
}

// ── Upstash Redis (production) ──────────────────────────────
function createUpstashLimiter(limit: number, windowMs: number) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  // Upstash sliding window expects a duration string — convert ms to seconds
  const windowSec = Math.max(1, Math.round(windowMs / 1000));
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    analytics: false,
  });
}

// Cache limiter instances to avoid creating new Redis connections every call
const limiterCache = new Map<string, Ratelimit>();

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`;
  let limiter = limiterCache.get(cacheKey);
  if (!limiter) {
    limiter = createUpstashLimiter(limit, windowMs);
    limiterCache.set(cacheKey, limiter);
  }
  return limiter;
}

// ── In-memory fallback (local dev / missing env vars) ───────
const memoryStore = new Map<string, number[]>();
let lastCleanup = Date.now();

const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
const MAX_WINDOW_MS = 60 * 60 * 1000;

function checkMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    const cutoff = now - MAX_WINDOW_MS;
    for (const [k, timestamps] of memoryStore) {
      const filtered = timestamps.filter((t) => t > cutoff);
      if (filtered.length === 0) {
        memoryStore.delete(k);
      } else {
        memoryStore.set(k, filtered);
      }
    }
    lastCleanup = now;
  }

  const windowStart = now - windowMs;
  const timestamps = memoryStore.get(key) ?? [];
  const recent = timestamps.filter((t) => t > windowStart);

  if (recent.length >= limit) {
    memoryStore.set(key, recent);
    return { allowed: false };
  }

  recent.push(now);
  memoryStore.set(key, recent);
  return { allowed: true };
}

// ── Public API ──────────────────────────────────────────────

const useUpstash = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

/** Sync in-memory rate limiter. Use `checkRateLimitAsync` for Upstash-backed limiting. */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  return checkMemoryRateLimit(key, limit, windowMs);
}

export async function checkRateLimitAsync(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (!useUpstash) {
    return checkMemoryRateLimit(key, limit, windowMs);
  }

  const limiter = getUpstashLimiter(limit, windowMs);
  const { success } = await limiter.limit(key);
  return { allowed: success };
}

/** Reset in-memory store — exported for tests only. */
export function _resetStore(): void {
  memoryStore.clear();
  lastCleanup = Date.now();
}
