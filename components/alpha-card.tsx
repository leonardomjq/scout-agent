"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Lock } from "lucide-react";
import { MomentumBadge } from "./momentum-badge";
import { BookmarkButton } from "./bookmark-button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, DURATION } from "@/lib/motion";
import type { AlphaCard as AlphaCardType } from "@/types";

function getHoursAgo(createdAt: string): number {
  const created = new Date(createdAt).getTime();
  return Math.floor((Date.now() - created) / (1000 * 60 * 60));
}

interface AlphaCardProps {
  card: AlphaCardType;
  isLocked?: boolean;
}

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

const statusColors: Record<string, string> = {
  fresh: "text-accent-green",
  warm: "text-accent-amber",
  cold: "text-text-muted",
  archived: "text-border",
};

export function AlphaCard({ card, isLocked }: AlphaCardProps) {
  const hoursAgo = getHoursAgo(card.created_at);

  return (
    <motion.div
      {...fadeInUp}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: DURATION.normal }}
      className="h-full"
    >
      <Link href={`/alpha/${card.id}`} className="h-full">
        <Card
          variant="default"
          padding="spacious"
          className="texture-paper border-accent-green/30 hover:border-accent-green/50 transition-colors cursor-pointer h-full flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
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
          <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-3 leading-snug">
            {card.title}
          </h3>

          {/* Entities */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {card.entities.map((entity) => (
              <Badge key={entity} shape="tag">
                {entity}
              </Badge>
            ))}
          </div>

          {/* Thesis (now free tier) */}
          {card.thesis && (
            <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm line-clamp-2 leading-relaxed">
              {card.thesis}
            </p>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-text-muted pt-3 mt-4 border-t border-text-dim/20">
            <div className="flex items-center gap-2">
              <span className="font-mono text-text-dim">{hoursAgo}h ago</span>
              <span>{card.signal_count} signals</span>
              <BookmarkButton cardId={card.id} />
            </div>
            <div className="flex items-center gap-2">
              {isLocked && (
                <span className="inline-flex items-center gap-1 font-mono">
                  <Lock className="size-3" />
                  +10 Pro sections
                </span>
              )}
              <Badge
                variant={card.status === "fresh" ? "success" : "default"}
                shape="tag"
              >
                {card.status}
              </Badge>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
