"use client";

import { Lock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export function PulseTeaser() {
  return (
    <div className="relative border-t border-text-dim/20">
      {/* Blurred skeleton content */}
      <div className="blur-sm select-none pointer-events-none space-y-8 pt-6" aria-hidden>
        {/* Category grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {["Velocity Spike", "Sentiment Flip", "Friction Cluster", "New Emergence"].map((cat) => (
            <Card key={cat} padding="compact">
              <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">{cat}</p>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-lg font-bold font-mono">12</span>
                  <span className="text-text-muted text-xs ml-1">opportunities</span>
                </div>
                <span className="text-xs text-text-muted">87%</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Trending entities skeleton */}
        <div className="flex flex-wrap gap-2">
          {["AI Agents", "Stripe", "Next.js", "CRM", "OAuth", "Billing"].map((e) => (
            <Badge key={e} shape="tag" className="text-sm">{e}</Badge>
          ))}
        </div>

        {/* Top opportunities skeleton */}
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-surface-elevated" />
          ))}
        </div>
      </div>

      {/* Overlay prompt */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Card padding="spacious" className="max-w-sm text-center">
          <Lock className="size-6 text-text-dim mx-auto mb-3" />
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-2">
            Pulse is a Pro feature
          </h3>
          <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm mb-4">
            See what&apos;s heating up across all opportunities — trending entities,
            category breakdowns, and week-over-week momentum.
          </p>
          <ButtonLink href="/settings" className="gap-1.5">
            Upgrade to Pro
            <ArrowRight className="size-3.5" />
          </ButtonLink>
        </Card>
      </div>
    </div>
  );
}
