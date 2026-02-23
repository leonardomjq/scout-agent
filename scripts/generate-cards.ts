/**
 * Generate Alpha Cards from raw signals using Gemini Flash.
 * Reads data/signals-raw.json, clusters signals, generates cards, writes data/YYYY-MM-DD.json.
 *
 * Run: npx tsx scripts/generate-cards.ts
 * Requires: GEMINI_API_KEY environment variable
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DailyDataSchema } from "../schemas/card";
import type { AlphaCard, DailyData } from "../types";

// ── Types for raw signals ──

interface RawSignal {
  source_type: "hackernews" | "reddit" | "github" | "producthunt";
  content: string;
  post_id?: string;
  repo?: string;
  timestamp: string;
  points?: number;
  comment_count?: number;
  upvotes?: number;
  stars?: number;
  forks?: number;
  url?: string;
  subreddit?: string;
  maker?: string;
  language?: string | null;
  topics?: string[];
}

interface RawData {
  fetched_at: string;
  signals: RawSignal[];
}

// ── Helpers ──

function log(msg: string) {
  process.stderr.write(`[generate] ${msg}\n`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function getEngagement(signal: RawSignal): number {
  return (
    (signal.points ?? 0) +
    (signal.upvotes ?? 0) +
    (signal.stars ?? 0) +
    (signal.comment_count ?? 0)
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

// ── Clustering ──

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "can", "shall", "to", "of", "in", "for",
  "on", "with", "at", "by", "from", "as", "into", "through", "during",
  "before", "after", "above", "below", "between", "out", "off", "over",
  "under", "again", "further", "then", "once", "here", "there", "when",
  "where", "why", "how", "all", "both", "each", "few", "more", "most",
  "other", "some", "such", "no", "nor", "not", "only", "own", "same",
  "so", "than", "too", "very", "just", "don", "now", "and", "but", "or",
  "if", "it", "its", "this", "that", "what", "which", "who", "whom",
  "my", "your", "his", "her", "we", "they", "them", "our", "their",
  "i", "me", "you", "he", "she", "up", "about", "also", "like", "get",
  "got", "use", "using", "used", "one", "two", "new", "way", "make",
  "made", "much", "many", "well", "back", "even", "give", "still",
  "thing", "things", "want", "need", "try", "really", "going", "know",
  "think", "good", "great", "best", "work", "working", "people", "time",
]);

function extractKeywords(content: string): Set<string> {
  const words = content.toLowerCase().match(/[a-z][a-z0-9.+-]{2,}/g) ?? [];
  return new Set(words.filter((w) => !STOP_WORDS.has(w)));
}

interface Cluster {
  signals: RawSignal[];
  keywords: Set<string>;
  totalEngagement: number;
}

/** Source diversity multiplier for composite cluster scoring */
const SOURCE_DIVERSITY_MULTIPLIER: Record<number, number> = {
  1: 1.0,
  2: 1.3,
  3: 1.6,
  4: 2.0,
};

function getClusterScore(cluster: Cluster): number {
  const uniqueSources = new Set(cluster.signals.map((s) => s.source_type)).size;
  const multiplier = SOURCE_DIVERSITY_MULTIPLIER[uniqueSources] ?? 2.0;
  return cluster.totalEngagement * multiplier;
}

function clusterSignals(signals: RawSignal[]): Cluster[] {
  const clusters: Cluster[] = [];
  const assigned = new Set<number>();

  // Build keyword sets for each signal
  const signalKeywords = signals.map((s) => extractKeywords(s.content));

  for (let i = 0; i < signals.length; i++) {
    if (assigned.has(i)) continue;

    const cluster: Cluster = {
      signals: [signals[i]],
      keywords: new Set(signalKeywords[i]),
      totalEngagement: getEngagement(signals[i]),
    };
    assigned.add(i);

    for (let j = i + 1; j < signals.length; j++) {
      if (assigned.has(j)) continue;

      // Count shared meaningful keywords
      let shared = 0;
      for (const kw of signalKeywords[j]) {
        if (cluster.keywords.has(kw)) shared++;
      }

      if (shared >= 2) {
        cluster.signals.push(signals[j]);
        for (const kw of signalKeywords[j]) cluster.keywords.add(kw);
        cluster.totalEngagement += getEngagement(signals[j]);
        assigned.add(j);
      }
    }

    // Only keep clusters with 2+ signals
    if (cluster.signals.length >= 2) {
      clusters.push(cluster);
    }
  }

  // Sort by composite score (engagement × source diversity multiplier)
  return clusters.sort((a, b) => getClusterScore(b) - getClusterScore(a));
}

// ── Gemini generation ──

const SYSTEM_PROMPT = `You are an opportunity analyst for builders — solo founders, indie hackers, and AI-native makers who ship products.

You transform raw signal data from developer communities into evidence-grounded opportunity briefs.

CRITICAL RULES:
1. Only make claims supported by evidence from the signals provided
2. Quote or paraphrase actual statements from the evidence
3. Name specific tools, libraries, and products when discussing gaps
4. Reference actual engagement numbers from the data
5. NEVER invent product names, TAM numbers, or speculative market sizes
6. The thesis should be insightful enough that someone reading just the title + thesis understands the opportunity
7. Keep tone informational and evidence-grounded — not sales-y. The opportunity section should read like analysis, not like a pitch deck.
8. Choose the analytical angle that best fits the evidence. Some opportunities are about market gaps; others about timing, distribution, competitive positioning, or counterintuitive insights. The opportunity section should add information the reader wouldn't get from the evidence alone — not restate what to build.`;

function buildPrompt(cluster: Cluster): string {
  // Build cluster summary for model context
  const sourceCounts = cluster.signals.reduce<Record<string, number>>((acc, s) => {
    acc[s.source_type] = (acc[s.source_type] ?? 0) + 1;
    return acc;
  }, {});
  const sourceStr = Object.entries(sourceCounts).map(([k, v]) => `${k}: ${v}`).join(", ");
  const clusterSummary = `CLUSTER: ${cluster.signals.length} signals from ${Object.keys(sourceCounts).length} sources (${sourceStr})`;

  const signalTexts = cluster.signals
    .slice(0, 15)
    .map((s) => {
      const eng = getEngagement(s);
      const source = s.source_type;
      const url = s.url ?? (s.repo ? `https://github.com/${s.repo}` : "");
      return `[${source}] (${eng} engagement${url ? `, ${url}` : ""}) ${s.content.slice(0, 500)}`;
    })
    .join("\n\n");

  return `Based on these signals from developer communities, generate an opportunity brief.

${clusterSummary}

SIGNALS:
${signalTexts}

Respond with a JSON object (no markdown fences) with these fields:
- "title": string — compelling, specific title mentioning key entities
- "category": string — one of: "developer-tools", "saas", "ai-ml", "infrastructure", "business-model", "fintech", "devops", "data", "security", "marketplace"
- "thesis": string — 2-3 sentences explaining WHY this signal matters, referencing the data
- "signal_strength": number — 1-10 based on engagement volume and signal clarity
- "evidence": array of objects with { "text": string (quote/paraphrase), "source": "hackernews"|"reddit"|"github"|"producthunt", "url": string (if available), "engagement": number }. Include 3-5 most relevant pieces.
- "opportunity": string — The most actionable, non-obvious insight for a builder examining these signals. This is NOT a business plan — it's the one thing the reader wouldn't figure out from the evidence alone. Could be: a market gap nobody's filling, a specific wedge product, a distribution channel that fits this use case, a timing argument, or a contrarian take on why most approaches will fail. Be concrete — name specific tools, audiences, or channels when the evidence supports it. 1-3 sentences. NEVER start with "Build a..."
- "sources": string[] — unique source types present (e.g., ["hackernews", "reddit"])
- "signal_count": number — total signals in this cluster`;
}

async function generateCard(
  genAI: GoogleGenerativeAI,
  cluster: Cluster,
  date: string,
  index: number,
): Promise<AlphaCard | null> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const prompt = buildPrompt(cluster);

  try {
    const result = await model.generateContent({
      systemInstruction: SYSTEM_PROMPT,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = result.response.text();
    const parsed = JSON.parse(text);

    const card: AlphaCard = {
      id: `${date}-${slugify(parsed.title ?? `card-${index}`)}`,
      date,
      title: parsed.title,
      category: parsed.category,
      thesis: parsed.thesis,
      signal_strength: Math.min(10, Math.max(1, Math.round(parsed.signal_strength))),
      evidence: (parsed.evidence ?? []).slice(0, 5).map((ev: Record<string, unknown>) => ({
        text: String(ev.text ?? ""),
        source: String(ev.source ?? "hackernews"),
        url: ev.url ? String(ev.url) : undefined,
        engagement: Number(ev.engagement ?? 0),
      })),
      opportunity: parsed.opportunity,
      sources: parsed.sources ?? [...new Set(cluster.signals.map((s) => s.source_type))],
      signal_count: parsed.signal_count ?? cluster.signals.length,
    };

    return card;
  } catch (err) {
    log(`  Error generating card ${index}: ${err}`);
    return null;
  }
}

// ── Main ──

/** Maximum cards per day — generous ceiling for a daily digest */
const MAX_CARDS = 12;

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY environment variable is required");
    process.exit(1);
  }

  const rawPath = resolve(process.cwd(), "data", "signals-raw.json");
  if (!existsSync(rawPath)) {
    console.error("Error: data/signals-raw.json not found. Run fetch-signals.ts first.");
    process.exit(1);
  }

  const rawData = JSON.parse(readFileSync(rawPath, "utf-8")) as RawData;
  log(`Loaded ${rawData.signals.length} signals from ${rawData.fetched_at}`);

  // Cluster signals — returns all valid clusters sorted by composite score
  const allClusters = clusterSignals(rawData.signals);
  log(`Found ${allClusters.length} valid clusters`);

  if (allClusters.length === 0) {
    console.error("Error: No clusters found. Not enough signals to generate cards.");
    process.exit(1);
  }

  // Take up to MAX_CARDS clusters
  const clusters = allClusters.slice(0, MAX_CARDS);

  // Log cluster details for observability
  for (let i = 0; i < clusters.length; i++) {
    const c = clusters[i];
    const sources = c.signals.reduce<Record<string, number>>((acc, s) => {
      acc[s.source_type] = (acc[s.source_type] ?? 0) + 1;
      return acc;
    }, {});
    const sourceStr = Object.entries(sources).map(([k, v]) => `${k}: ${v}`).join(", ");
    log(`  Cluster ${i + 1}: score=${Math.round(getClusterScore(c))}, signals=${c.signals.length}, sources=[${sourceStr}]`);
  }

  // Generate cards
  const genAI = new GoogleGenerativeAI(apiKey);
  const today = new Date().toISOString().slice(0, 10);
  const cards: AlphaCard[] = [];

  for (let i = 0; i < clusters.length; i++) {
    log(`Generating card ${i + 1}/${clusters.length}...`);
    const card = await generateCard(genAI, clusters[i], today, i);

    if (card) {
      // Post-generation quality check
      if (card.evidence.length < 2) {
        log(`  ⚠ Skipping "${card.title}" — only ${card.evidence.length} evidence item(s)`);
      } else if (card.thesis.length < 50) {
        log(`  ⚠ Skipping "${card.title}" — thesis too short (${card.thesis.length} chars)`);
      } else {
        cards.push(card);
        log(`  → "${card.title}" (strength: ${card.signal_strength})`);
      }
    }

    // Rate limit safety: 5s delay between calls (well within 15 RPM free tier)
    if (i < clusters.length - 1) {
      await sleep(5000);
    }
  }

  if (cards.length === 0) {
    console.error("Error: No cards generated successfully.");
    process.exit(1);
  }

  // Build daily data
  const dailyData: DailyData = {
    date: today,
    generated_at: new Date().toISOString(),
    cards,
  };

  // Validate with Zod
  const validated = DailyDataSchema.safeParse(dailyData);
  if (!validated.success) {
    console.error("Validation failed:", validated.error.message);
    process.exit(1);
  }

  // Write output
  const outPath = resolve(process.cwd(), "data", `${today}.json`);
  writeFileSync(outPath, JSON.stringify(dailyData, null, 2));

  log(`\nDone! ${cards.length} cards written to ${outPath}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
