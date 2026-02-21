"use client";

import useSWR from "swr";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MomentumBadge } from "./momentum-badge";
import { authFetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

interface PulseData {
  categories: Record<string, { count: number; avg_strength: number; dominant_direction: string }>;
  trending_entities: { name: string; count: number }[];
  week_over_week: { this_week: number; last_week: number; change_pct: number };
  top_cards: { id: string; title: string; signal_strength: number; category: string; direction: string }[];
}

const categoryLabels: Record<string, string> = {
  velocity_spike: "Velocity Spike",
  sentiment_flip: "Sentiment Flip",
  friction_cluster: "Friction Cluster",
  new_emergence: "New Emergence",
};

const categoryColors: Record<string, string> = {
  velocity_spike: "border-accent-blue/30",
  sentiment_flip: "border-accent-amber/30",
  friction_cluster: "border-accent-red/30",
  new_emergence: "border-accent-green/30",
};

const categoryTextColors: Record<string, string> = {
  velocity_spike: "text-accent-blue",
  sentiment_flip: "text-accent-amber",
  friction_cluster: "text-accent-red",
  new_emergence: "text-accent-green",
};

function DirectionIcon({ direction }: { direction: string }) {
  if (direction === "accelerating") return <TrendingUp className="size-4 text-accent-green" />;
  if (direction === "decelerating") return <TrendingDown className="size-4 text-accent-red" />;
  return <Minus className="size-4 text-text-muted" />;
}

export function PulseDashboard() {
  const { data, isLoading, error } = useSWR<PulseData>(
    "/api/pulse",
    authFetcher<PulseData>,
    { revalidateOnFocus: false }
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-surface animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-accent-red text-sm">Failed to load pulse data.</p>;
  }

  if (!data) return null;

  const categories = Object.entries(data.categories);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="font-mono text-[10px] text-text-dim">
          {weekAgo.toLocaleDateString()} — {now.toLocaleDateString()}
        </p>
      </div>

      {/* Category grid */}
      {categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(([cat, stats]) => (
            <Card
              key={cat}
              padding="compact"
              className={cn("border-l-2", categoryColors[cat])}
            >
              <p className={cn("text-[10px] font-mono uppercase tracking-widest mb-2", categoryTextColors[cat])}>
                {categoryLabels[cat] ?? cat}
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-lg font-bold font-mono">{stats.count}</span>
                  <span className="text-text-muted text-xs ml-1">opportunities</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-text-muted">
                  <span>{Math.round(stats.avg_strength * 100)}%</span>
                  <DirectionIcon direction={stats.dominant_direction} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Trending entities */}
      {data.trending_entities.length > 0 && (
        <div>
          <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">Trending Entities</p>
          <div className="flex flex-wrap gap-2">
            {data.trending_entities.map((entity) => (
              <Badge key={entity.name} shape="tag" className="text-sm">
                {entity.name}
                <span className="text-text-dim ml-1.5">{entity.count}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Week-over-week */}
      <div>
        <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">Week-over-Week</p>
        <div className="flex items-center gap-6 font-mono text-sm">
          <div>
            <span className="text-text-muted">This week: </span>
            <span className="font-bold">{data.week_over_week.this_week}</span>
            <span className="text-text-muted"> opportunities</span>
          </div>
          <div>
            <span className="text-text-muted">Last week: </span>
            <span className="font-bold">{data.week_over_week.last_week}</span>
          </div>
          <div className={cn(
            "font-bold",
            data.week_over_week.change_pct > 0 ? "text-accent-green" : data.week_over_week.change_pct < 0 ? "text-accent-red" : "text-text-muted"
          )}>
            {data.week_over_week.change_pct > 0 ? "+" : ""}{data.week_over_week.change_pct}%
          </div>
        </div>
      </div>

      {/* Top opportunities */}
      {data.top_cards.length > 0 && (
        <div>
          <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">Top Opportunities</p>
          <div className="space-y-2">
            {data.top_cards.map((card) => (
              <Link
                key={card.id}
                href={`/alpha/${card.id}`}
                className="group"
              >
                <Card padding="compact" className="flex items-center gap-3 hover:border-accent-green/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-accent-green transition-colors">
                      {card.title}
                    </p>
                  </div>
                  <MomentumBadge
                    score={card.signal_strength}
                    direction={card.direction as "accelerating" | "decelerating" | "new"}
                  />
                  <Badge shape="tag" className={cn("text-[10px]", categoryTextColors[card.category])}>
                    {categoryLabels[card.category] ?? card.category}
                  </Badge>
                  <ArrowRight className="size-3.5 text-text-dim group-hover:text-accent-green transition-colors shrink-0" />
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
