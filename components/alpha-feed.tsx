"use client";

import useSWRInfinite from "swr/infinite";
import { AlphaCard } from "./alpha-card";
import { CardSkeleton } from "./card-skeleton";
import type { AlphaCard as AlphaCardType, AlphaCategory, AlphaDirection } from "@/types";
import { useMemo, useState } from "react";
import { Search, Zap, Clock, ArrowDownWideNarrow } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AlphaResponse {
  data: AlphaCardType[];
  cursor: string | null;
  has_more: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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
  const [category, setCategory] = useState<string>("");
  const [direction, setDirection] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const getKey = (pageIndex: number, previousPageData: AlphaResponse | null) => {
    if (previousPageData && !previousPageData.has_more) return null;
    const params = new URLSearchParams();
    params.set("limit", "20");
    if (category) params.set("category", category);
    if (direction) params.set("direction", direction);
    if (previousPageData?.cursor) params.set("cursor", previousPageData.cursor);
    return `/api/alphas?${params.toString()}`;
  };

  const { data, size, setSize, isValidating, error } =
    useSWRInfinite<AlphaResponse>(getKey, fetcher, {
      revalidateFirstPage: false,
    });

  const rawCards = data?.flatMap((page) => page.data) ?? [];
  const hasMore = data?.[data.length - 1]?.has_more ?? false;
  const isEmpty = data?.[0]?.data?.length === 0;

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

      {/* Error state */}
      {error && (
        <div className="text-accent-red text-sm bg-accent-red/10 border border-accent-red/30 rounded p-4">
          Failed to load alpha cards. Please try again.
        </div>
      )}

      {/* Empty state */}
      {isEmpty && !isValidating && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="bg-accent-green/10 rounded-full p-4 mb-4">
            <Zap className="size-8 text-accent-green" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Your feed is warming up
          </h3>
          <p className="text-text-muted text-sm max-w-md mb-6">
            ScoutAgent is scanning developer activity and detecting traction
            signals. Here&apos;s what to expect:
          </p>
          <ol className="text-left text-sm text-text-muted space-y-2 max-w-sm">
            <li className="flex items-start gap-2">
              <span className="text-accent-green font-mono font-bold">1.</span>
              Anomalies detected across developer communities
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-green font-mono font-bold">2.</span>
              Alpha Cards generated with evidence-grounded intelligence
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-green font-mono font-bold">3.</span>
              Pro unlocks full evidence trails and gap analysis
            </li>
          </ol>
        </div>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <AlphaCard key={card.id} card={card} />
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
