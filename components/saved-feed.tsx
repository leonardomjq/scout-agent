"use client";

import useSWR from "swr";
import { Bookmark } from "lucide-react";
import { AlphaCard } from "./alpha-card";
import { CardSkeleton } from "./card-skeleton";
import type { AlphaCard as AlphaCardType } from "@/types";
import { authFetcher } from "@/lib/fetcher";

interface BookmarksResponse {
  data: AlphaCardType[];
}

export function SavedFeed() {
  const { data, isLoading, error } = useSWR<BookmarksResponse>(
    "/api/bookmarks",
    authFetcher<BookmarksResponse>,
    { revalidateOnFocus: false }
  );

  const cards = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-accent-red text-sm">Failed to load saved opportunities.</p>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-16">
        <Bookmark className="size-8 text-text-dim mx-auto mb-3" />
        <p className="font-[family-name:var(--font-display)] text-lg font-semibold mb-1">
          No saved opportunities yet
        </p>
        <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm">
          Tap the bookmark icon on any opportunity to save it here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
      {cards.map((card) => (
        <AlphaCard key={card.id} card={card} />
      ))}
    </div>
  );
}
