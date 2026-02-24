/**
 * Fetch signals from free data sources (HN + Reddit + GitHub + Product Hunt).
 * Outputs raw signals to data/signals-raw.json for card generation.
 *
 * Run: npx tsx scripts/fetch-signals.ts
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

// ── Inlined noise patterns from lib/refinery/scrubber.ts ──

const NOISE_PATTERNS = [
  /\bgiveaway\b/i,
  /\bairdrop\b/i,
  /\bfollow.*retweet\b/i,
  /\bwin\s+\$?\d/i,
  /\b(dm|DM)\s+me\b/i,
  /\bcheck\s+my\s+bio\b/i,
  /\bfree\s+nft\b/i,
  /\b🚀{3,}/,
];

function isNoise(content: string): boolean {
  return NOISE_PATTERNS.some((p) => p.test(content));
}

// ── Types matching schemas/capture.ts shapes ──

interface HNSignal {
  source_type: "hackernews";
  post_id: string;
  content: string;
  timestamp: string;
  points: number;
  comment_count: number;
  url: string;
  link_url?: string;
}

interface RedditSignal {
  source_type: "reddit";
  subreddit: string;
  post_id: string;
  content: string;
  timestamp: string;
  upvotes: number;
  url: string;
  comment_count: number;
}

interface GitHubSignal {
  source_type: "github";
  repo: string;
  content: string;
  timestamp: string;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  url: string;
  homepage_url?: string;
}

interface ProductHuntSignal {
  source_type: "producthunt";
  post_id: string;
  content: string;
  timestamp: string;
  url: string;
  maker: string;
}

type Signal = HNSignal | RedditSignal | GitHubSignal | ProductHuntSignal;

interface ExperimentData {
  fetched_at: string;
  sources: {
    hackernews: { count: number; categories: string[] };
    reddit: { count: number; subreddits: string[] };
    github: { count: number };
    producthunt: { count: number };
  };
  signals: Signal[];
}

// ── Helpers ──

function log(msg: string) {
  process.stderr.write(`[fetch] ${msg}\n`);
}

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 1
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, options);
    if (res.ok) return res;
    if (res.status === 429 && attempt < retries) {
      log(`  429 rate-limited, retrying in 2s...`);
      await sleep(2000);
      continue;
    }
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  throw new Error("Unreachable");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── HN via Algolia API ──

interface AlgoliaHit {
  objectID: string;
  title?: string;
  story_text?: string;
  url?: string;
  points: number;
  num_comments: number;
  created_at: string;
}

async function fetchHN(): Promise<HNSignal[]> {
  // Filter to last 48 hours — Ask HN / Show HN return all-time top without this
  const since = Math.floor((Date.now() - 48 * 60 * 60 * 1000) / 1000);
  const timeFilter = `&numericFilters=created_at_i>${since}`;

  const endpoints = [
    {
      url: `https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=50${timeFilter}`,
      category: "front_page",
    },
    {
      url: `https://hn.algolia.com/api/v1/search?tags=ask_hn&hitsPerPage=30${timeFilter}`,
      category: "ask_hn",
    },
    {
      url: `https://hn.algolia.com/api/v1/search?tags=show_hn&hitsPerPage=20${timeFilter}`,
      category: "show_hn",
    },
  ];

  const signals: HNSignal[] = [];

  for (const { url, category } of endpoints) {
    log(`Fetching HN ${category}...`);
    const res = await fetchWithRetry(url);
    const data = (await res.json()) as { hits: AlgoliaHit[] };

    for (const hit of data.hits) {
      const title = hit.title ?? "";
      const body = hit.story_text ?? "";
      const content = body ? `${title}: ${body}` : title;

      if (!content.trim()) continue;
      if (hit.points < 2) continue;
      if (isNoise(content)) continue;

      signals.push({
        source_type: "hackernews",
        post_id: hit.objectID,
        content,
        timestamp: new Date(hit.created_at).toISOString(),
        points: hit.points,
        comment_count: hit.num_comments,
        url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
        link_url: hit.url || undefined,
      });
    }

    log(`  → ${data.hits.length} hits, ${signals.length} kept so far`);
  }

  return signals;
}

// ── Reddit via .json endpoints ──

interface RedditPost {
  data: {
    id: string;
    title: string;
    selftext: string;
    ups: number;
    num_comments: number;
    created_utc: number;
    subreddit: string;
    stickied: boolean;
  };
}

interface RedditListing {
  data: {
    children: RedditPost[];
  };
}

const REDDIT_UA =
  "ScoutAgent-Experiment/1.0 (free-source pipeline validation)";

const SUBREDDITS = ["SaaS", "startups", "Entrepreneur", "smallbusiness"];

async function fetchReddit(): Promise<RedditSignal[]> {
  const signals: RedditSignal[] = [];

  for (const sub of SUBREDDITS) {
    log(`Fetching r/${sub}...`);
    const url = `https://www.reddit.com/r/${sub}/hot.json?limit=25`;
    const res = await fetchWithRetry(url, {
      headers: { "User-Agent": REDDIT_UA },
    });
    const data = (await res.json()) as RedditListing;

    for (const post of data.data.children) {
      const { id, title, selftext, ups, num_comments, created_utc, subreddit, stickied } =
        post.data;

      // Skip stickied mod posts
      if (stickied) continue;
      if (ups < 2) continue;

      const body = selftext ? selftext.slice(0, 2000) : "";
      const content = body ? `${title}: ${body}` : title;

      if (isNoise(content)) continue;

      signals.push({
        source_type: "reddit",
        subreddit,
        post_id: id,
        content,
        timestamp: new Date(created_utc * 1000).toISOString(),
        upvotes: ups,
        url: `https://reddit.com/r/${subreddit}/comments/${id}/`,
        comment_count: num_comments,
      });
    }

    log(`  → ${signals.length} kept so far`);

    // 1s delay between Reddit requests to be polite
    await sleep(1000);
  }

  return signals;
}

// ── GitHub via Search API (no auth, 10 req/min limit) ──

interface GitHubRepo {
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
}

interface GitHubSearchResult {
  total_count: number;
  items: GitHubRepo[];
}

async function fetchGitHub(): Promise<GitHubSignal[]> {
  // Repos created in the last 48h, sorted by stars
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const queries = [
    // New repos created in last 48h, sorted by stars (genuine new projects)
    `created:>${since}&sort=stars&order=desc&per_page=50`,
  ];

  const signals: GitHubSignal[] = [];
  const seen = new Set<string>();

  for (const q of queries) {
    log(`Fetching GitHub (${q.slice(0, 40)}...)...`);
    const url = `https://api.github.com/search/repositories?q=${q}`;
    const res = await fetchWithRetry(url, {
      headers: { Accept: "application/vnd.github+json" },
    });
    const data = (await res.json()) as GitHubSearchResult;

    for (const repo of data.items) {
      if (seen.has(repo.full_name)) continue;
      seen.add(repo.full_name);

      const desc = repo.description ?? "";
      const content = `${repo.full_name}: ${desc}`;

      if (isNoise(content)) continue;

      signals.push({
        source_type: "github",
        repo: repo.full_name,
        content,
        timestamp: new Date(repo.created_at).toISOString(),
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        topics: repo.topics ?? [],
        url: repo.html_url,
        homepage_url: repo.homepage || undefined,
      });
    }

    log(`  → ${signals.length} repos kept so far`);

    // Respect rate limit (10 req/min)
    await sleep(1000);
  }

  return signals;
}

// ── Product Hunt via Atom feed (no auth) ──

function parseAtomEntries(xml: string): ProductHuntSignal[] {
  const signals: ProductHuntSignal[] = [];
  // Simple regex parsing — no XML library needed for this structure
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];

    const title = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? "";
    const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.trim() ?? "";
    const link = entry.match(/<link[^>]*href="([^"]*)"[^>]*\/>/)?.[1] ?? "";
    const id = entry.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim() ?? "";
    const author = entry.match(/<author>\s*<name>([\s\S]*?)<\/name>/)?.[1]?.trim() ?? "";

    // Extract description from content HTML
    const contentHtml = entry.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] ?? "";
    // Decode HTML entities first, then strip tags
    const description = contentHtml
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<a[^>]*>.*?<\/a>/g, "") // remove links entirely
      .replace(/<[^>]+>/g, " ")         // strip remaining tags
      .replace(/\s+/g, " ")
      .trim();

    // Extract post ID from tag URI: tag:www.producthunt.com,2005:Post/123456
    const postId = id.match(/Post\/(\d+)/)?.[1] ?? id;

    if (!title) continue;

    const content = description ? `${title}: ${description}` : title;

    if (isNoise(content)) continue;

    signals.push({
      source_type: "producthunt",
      post_id: postId,
      content,
      timestamp: published ? new Date(published).toISOString() : new Date().toISOString(),
      url: link,
      maker: author,
    });
  }

  return signals;
}

async function fetchProductHunt(): Promise<ProductHuntSignal[]> {
  log("Fetching Product Hunt feed...");
  const res = await fetchWithRetry("https://www.producthunt.com/feed");
  const xml = await res.text();
  const signals = parseAtomEntries(xml);
  log(`  → ${signals.length} launches parsed`);
  return signals;
}

// ── Main ──

async function main() {
  log("Starting free-source fetch experiment...\n");

  const hnSignals = await fetchHN();
  log(`\nHN total: ${hnSignals.length} signals\n`);

  const redditSignals = await fetchReddit();
  log(`\nReddit total: ${redditSignals.length} signals\n`);

  const githubSignals = await fetchGitHub();
  log(`\nGitHub total: ${githubSignals.length} signals\n`);

  const phSignals = await fetchProductHunt();
  log(`\nProduct Hunt total: ${phSignals.length} signals\n`);

  const output: ExperimentData = {
    fetched_at: new Date().toISOString(),
    sources: {
      hackernews: {
        count: hnSignals.length,
        categories: ["front_page", "ask_hn", "show_hn"],
      },
      reddit: {
        count: redditSignals.length,
        subreddits: SUBREDDITS,
      },
      github: {
        count: githubSignals.length,
      },
      producthunt: {
        count: phSignals.length,
      },
    },
    signals: [...hnSignals, ...redditSignals, ...githubSignals, ...phSignals],
  };

  const outPath = resolve(process.cwd(), "data", "signals-raw.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));

  log(`Done! ${output.signals.length} signals saved to ${outPath}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
