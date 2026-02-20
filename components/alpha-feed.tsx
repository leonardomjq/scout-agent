"use client";

import useSWRInfinite from "swr/infinite";
import { motion } from "framer-motion";
import { AlphaCard } from "./alpha-card";
import { CardSkeleton } from "./card-skeleton";
import type { AlphaCard as AlphaCardType, AlphaCategory, AlphaDirection, AlphaTier } from "@/types";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Zap, Clock, ArrowDownWideNarrow, Lock, Twitter, Github, MessageSquare, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MomentumBadge } from "./momentum-badge";
import {
  clipRevealStagger,
  clipRevealItem,
  scanLine,
  fadeInUp,
} from "@/lib/motion";
import { authFetcher } from "@/lib/fetcher";

interface AlphaResponse {
  data: AlphaCardType[];
  cursor: string | null;
  has_more: boolean;
  tier?: AlphaTier;
}

const CATEGORIES: Array<{ value: AlphaCategory | ""; label: string }> = [
  { value: "", label: "All" },
  { value: "velocity_spike", label: "Velocity" },
  { value: "sentiment_flip", label: "Sentiment" },
  { value: "friction_cluster", label: "Friction" },
  { value: "new_emergence", label: "Emerging" },
];

const DIRECTIONS: Array<{ value: AlphaDirection | ""; label: string }> = [
  { value: "", label: "All" },
  { value: "accelerating", label: "Accelerating" },
  { value: "decelerating", label: "Decelerating" },
  { value: "new", label: "New" },
];

type SortOption = "newest" | "strength" | "freshness";

const SORT_OPTIONS: Array<{ value: SortOption; label: string; Icon: typeof Zap }> = [
  { value: "newest", label: "Newest", Icon: Clock },
  { value: "strength", label: "Strongest Signal", Icon: Zap },
  { value: "freshness", label: "Most Fresh", Icon: ArrowDownWideNarrow },
];

export function AlphaFeed() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const category = searchParams.get("category") ?? "";
  const direction = searchParams.get("direction") ?? "";
  const sortBy = (searchParams.get("sort") as SortOption) || "newest";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const setCategory = (v: string) => updateParam("category", v);
  const setDirection = (v: string) => updateParam("direction", v);
  const setSortBy = (v: SortOption) => updateParam("sort", v === "newest" ? "" : v);

  const getKey = (pageIndex: number, previousPageData: AlphaResponse | null) => {
    if (previousPageData && !previousPageData.has_more) return null;
    const params = new URLSearchParams();
    params.set("limit", "20");
    if (category) params.set("category", category);
    if (direction) params.set("direction", direction);
    if (previousPageData?.cursor) params.set("cursor", previousPageData.cursor);
    return `/api/alphas?${params.toString()}`;
  };

  const { data, size, setSize, isValidating, error, mutate } =
    useSWRInfinite<AlphaResponse>(getKey, authFetcher<AlphaResponse>, {
      revalidateFirstPage: false,
      errorRetryCount: 3,
      revalidateOnFocus: false,
    });

  const rawCards = data?.flatMap((page) => page.data) ?? [];
  const hasMore = data?.[data.length - 1]?.has_more ?? false;
  const isEmpty = data?.[0]?.data?.length === 0;
  const tier = data?.[0]?.tier;
  const isLocked = tier === "free";

  // Client-side search filter
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return rawCards;
    const q = searchQuery.toLowerCase();
    return rawCards.filter(
      (card) =>
        card.title.toLowerCase().includes(q) ||
        card.entities.some((e) => e.toLowerCase().includes(q))
    );
  }, [rawCards, searchQuery]);

  // Client-side sort
  const cards = useMemo(() => {
    if (sortBy === "newest") return filtered;
    const sorted = [...filtered];
    if (sortBy === "strength") {
      sorted.sort((a, b) => b.signal_strength - a.signal_strength);
    } else if (sortBy === "freshness") {
      sorted.sort((a, b) => b.freshness_score - a.freshness_score);
    }
    return sorted;
  }, [filtered, sortBy]);

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <Input
          icon={<Search className="size-4" />}
          type="text"
          placeholder="Search by title or entity..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filters + Sort */}
      <div className="flex flex-wrap items-start gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-sm">Category:</span>
          <div className="flex gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  category === cat.value
                    ? "bg-accent-green/20 text-accent-green border border-accent-green/30"
                    : "bg-surface text-text-muted border border-border hover:border-accent-green/20"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-sm">Direction:</span>
          <div className="flex gap-1">
            {DIRECTIONS.map((dir) => (
              <button
                key={dir.value}
                onClick={() => setDirection(dir.value)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  direction === dir.value
                    ? "bg-accent-green/20 text-accent-green border border-accent-green/30"
                    : "bg-surface text-text-muted border border-border hover:border-accent-green/20"
                }`}
              >
                {dir.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-text-muted text-sm">Sort:</span>
          <div className="flex gap-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-colors ${
                  sortBy === opt.value
                    ? "bg-accent-green/20 text-accent-green border border-accent-green/30"
                    : "bg-surface text-text-muted border border-border hover:border-accent-green/20"
                }`}
              >
                <opt.Icon className="size-3" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aggregate pro awareness banner (free users) */}
      {isLocked && cards.length > 0 && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-surface border border-border text-sm text-text-muted">
          <Lock className="size-3.5 shrink-0" />
          <span>
            You&apos;ve browsed {cards.length} opportunities. Pro unlocks full
            strategy + risk analysis for every one.
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-accent-red text-sm bg-accent-red/10 border border-accent-red/30 rounded p-4 flex items-center justify-between">
          <span>Failed to load alpha cards.</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => mutate()}
            disabled={isValidating}
          >
            <RefreshCw className={`size-3.5 ${isValidating ? "animate-spin" : ""}`} />
            Retry
          </Button>
        </div>
      )}

      {/* Onboarding empty state */}
      {isEmpty && !isValidating && <OnboardingState />}

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <AlphaCard key={card.id} card={card} isLocked={isLocked} />
        ))}
        {/* Skeleton loading for next page */}
        {isValidating &&
          cards.length > 0 &&
          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={`sk-${i}`} />)}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="text-center mt-8">
          <Button
            variant="secondary"
            onClick={() => setSize(size + 1)}
            disabled={isValidating}
          >
            {isValidating ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Sample card data for onboarding ──

const SAMPLE_CARDS: AlphaCardType[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    created_at: new Date().toISOString(),
    status: "fresh",
    freshness_score: 0.95,
    title: "Notion users frustrated with task management — 47% demand spike in alternatives",
    category: "friction_cluster",
    entities: ["Notion", "Task Management", "Productivity"],
    signal_strength: 0.82,
    direction: "accelerating",
    signal_count: 34,
    thesis:
      "A growing cluster of builders are vocal about Notion's limitations for task management. Conversations reveal demand for a focused, lightweight alternative that integrates with existing Notion workspaces.",
    friction_detail: null,
    gap_analysis: null,
    timing_signal: null,
    risk_factors: null,
    evidence: null,
    competitive_landscape: null,
    opportunity_type: null,
    cluster_id: "00000000-0000-0000-0000-000000000001",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    created_at: new Date().toISOString(),
    status: "fresh",
    freshness_score: 0.88,
    title: "AI-native CRM for solo founders — new emergence across Reddit and HN",
    category: "new_emergence",
    entities: ["CRM", "AI Agents", "Solo Founders"],
    signal_strength: 0.74,
    direction: "new",
    signal_count: 21,
    thesis:
      "Multiple threads across builder communities point to unmet demand for a CRM built from the ground up with AI — not bolted on. Solo founders want something that does the follow-up work, not just tracks it.",
    friction_detail: null,
    gap_analysis: null,
    timing_signal: null,
    risk_factors: null,
    evidence: null,
    competitive_landscape: null,
    opportunity_type: null,
    cluster_id: "00000000-0000-0000-0000-000000000002",
  },
];

const SOURCES = [
  { label: "X / Twitter", Icon: Twitter },
  { label: "GitHub", Icon: Github },
  { label: "Hacker News", Icon: MessageSquare },
  { label: "Reddit", Icon: MessageSquare },
];

const categoryLabels: Record<string, string> = {
  velocity_spike: "Velocity Spike",
  sentiment_flip: "Sentiment Flip",
  friction_cluster: "Friction Cluster",
  new_emergence: "New Emergence",
};

const categoryColors: Record<string, string> = {
  velocity_spike: "text-accent-blue",
  sentiment_flip: "text-accent-amber",
  friction_cluster: "text-accent-red",
  new_emergence: "text-accent-green",
};

function OnboardingState() {
  return (
    <motion.div
      className="space-y-8"
      variants={clipRevealStagger}
      initial="hidden"
      animate="visible"
    >
      {/* Hero section */}
      <motion.div variants={clipRevealItem}>
        <Card variant="glass" className="texture-paper relative overflow-hidden">
          <div className="relative z-10 space-y-6 text-center py-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent-green">
              Scanning in progress
            </p>

            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-text">
              Your opportunity radar is live
            </h2>

            <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm leading-relaxed max-w-lg mx-auto">
              ScoutAgent is scanning thousands of conversations across builder
              communities — detecting demand spikes, frustration clusters, and
              market gaps.
            </p>

            {/* Source icons */}
            <div className="flex items-center justify-center gap-3">
              {SOURCES.map((source) => (
                <div
                  key={source.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface border border-border"
                >
                  <source.Icon className="size-3.5 text-text-muted" />
                  <span className="font-mono text-[10px] text-text-muted">
                    {source.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Scan line animation */}
            <motion.div
              className="h-px bg-accent-green mx-auto max-w-xs"
              variants={scanLine}
            />

            <p className="font-mono text-xs text-text-dim">
              First opportunity briefs arrive within 24-72 hours
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Sample cards section */}
      <motion.div variants={clipRevealItem}>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-dim">
            What you&apos;ll get
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAMPLE_CARDS.map((card) => (
            <motion.div
              key={card.id}
              {...fadeInUp}
            >
              <Card
                variant="default"
                className="texture-paper border-accent-green/30 relative opacity-80"
              >
                {/* Sample badge */}
                <Badge
                  variant="info"
                  shape="tag"
                  className="absolute top-3 right-3"
                >
                  SAMPLE
                </Badge>

                {/* Header */}
                <div className="flex items-start justify-between mb-3 pr-16">
                  <span
                    className={`text-[10px] font-mono uppercase tracking-widest ${categoryColors[card.category] ?? "text-text-muted"}`}
                  >
                    {categoryLabels[card.category] ?? card.category}
                  </span>
                  <MomentumBadge
                    score={card.signal_strength}
                    direction={card.direction}
                  />
                </div>

                {/* Title */}
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-2 leading-snug">
                  {card.title}
                </h3>

                {/* Entities */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {card.entities.map((entity) => (
                    <Badge key={entity} shape="tag">
                      {entity}
                    </Badge>
                  ))}
                </div>

                {/* Thesis */}
                <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm line-clamp-2 mb-3">
                  {card.thesis}
                </p>

                {/* Pro fields blurred */}
                <div className="relative rounded bg-surface/50 border border-border p-3 select-none">
                  <div className="blur-[6px] pointer-events-none space-y-2">
                    <p className="text-xs text-text-muted">
                      Gap analysis, timing signals, risk factors, competitive landscape...
                    </p>
                    <p className="text-xs text-text-muted">
                      Full evidence trail with source attribution and relevance scoring.
                    </p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-text-muted bg-surface/90 px-3 py-1 rounded border border-border">
                      <Lock className="size-3" />
                      Pro — full strategy + evidence
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-text-muted mt-3">
                  <span>{card.signal_count} signals</span>
                  <Badge variant="success" shape="tag">
                    {card.status}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
