"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookmarks } from "@/hooks/use-bookmarks";

interface BookmarkButtonProps {
  cardId: string;
  className?: string;
  size?: "sm" | "md";
}

export function BookmarkButton({ cardId, className, size = "sm" }: BookmarkButtonProps) {
  const { isBookmarked, toggle, atLimit } = useBookmarks();
  const [showLimit, setShowLimit] = useState(false);
  const bookmarked = isBookmarked(cardId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!bookmarked && atLimit) {
      setShowLimit(true);
      setTimeout(() => setShowLimit(false), 3000);
      return;
    }

    const result = await toggle(cardId);
    if (result?.error === "limit") {
      setShowLimit(true);
      setTimeout(() => setShowLimit(false), 3000);
    }
  };

  const iconSize = size === "sm" ? "size-4" : "size-5";

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={cn(
          "transition-colors",
          bookmarked
            ? "text-accent-green"
            : "text-text-muted hover:text-accent-green",
          className
        )}
        aria-label={bookmarked ? "Remove bookmark" : "Save bookmark"}
      >
        <Bookmark
          className={cn(iconSize, bookmarked && "fill-current")}
        />
      </button>
      {showLimit && (
        <div className="absolute right-0 top-full mt-1 z-overlay whitespace-nowrap rounded bg-surface border border-border px-2 py-1 text-[10px] font-mono text-text-muted shadow-elevated">
          3/3 used — upgrade for unlimited
        </div>
      )}
    </div>
  );
}
