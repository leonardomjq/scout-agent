"use client";

import useSWR from "swr";
import { useCallback } from "react";
import { authFetcher } from "@/lib/fetcher";

interface BookmarkIdsResponse {
  ids: string[];
  count: number;
  limit: number | null;
}

export function useBookmarks() {
  const { data, error, isLoading, mutate } = useSWR<BookmarkIdsResponse>(
    "/api/bookmarks/ids",
    authFetcher<BookmarkIdsResponse>,
    { revalidateOnFocus: false }
  );

  const ids = data?.ids ?? [];
  const count = data?.count ?? 0;
  const limit = data?.limit ?? null;
  const atLimit = limit !== null && count >= limit;

  const toggle = useCallback(
    async (cardId: string) => {
      const isBookmarked = ids.includes(cardId);

      // Optimistic update
      const optimisticIds = isBookmarked
        ? ids.filter((id) => id !== cardId)
        : [...ids, cardId];

      mutate(
        {
          ids: optimisticIds,
          count: optimisticIds.length,
          limit,
        },
        false
      );

      try {
        if (isBookmarked) {
          await fetch(`/api/bookmarks?card_id=${cardId}`, { method: "DELETE" });
        } else {
          const res = await fetch("/api/bookmarks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ card_id: cardId }),
          });
          if (res.status === 403) {
            // Free tier limit reached — revert
            mutate();
            return { error: "limit" as const };
          }
        }
        mutate();
      } catch {
        // Revert optimistic update on failure
        mutate();
      }

      return { error: null };
    },
    [ids, limit, mutate]
  );

  const isBookmarked = useCallback(
    (cardId: string) => ids.includes(cardId),
    [ids]
  );

  return {
    ids,
    count,
    limit,
    atLimit,
    isBookmarked,
    toggle,
    isLoading,
    error,
  };
}
