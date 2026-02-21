"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Signal } from "lucide-react";
import { MomentumBadge } from "@/components/momentum-badge";
import { BookmarkButton } from "@/components/bookmark-button";
import { InlineUpgradeHint } from "@/components/inline-upgrade-hint";
import { ProFieldTeaser } from "@/components/pro-field-teaser";
import { UpgradeModal } from "@/components/upgrade-modal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { clipRevealStagger, clipRevealItem } from "@/lib/motion";
import type { AlphaCard } from "@/types";
import type { ProField } from "@/components/pro-field-teaser";

const categoryLabels: Record<string, string> = {
  velocity_spike: "Velocity Spike",
  sentiment_flip: "Sentiment Flip",
  friction_cluster: "Friction Cluster",
  new_emergence: "New Emergence",
};

type FreshnessLevel = "fresh" | "warm" | "cold";

function getCardAge(createdAt: string): {
  hoursAgo: number;
  hoursRemaining: number;
  level: FreshnessLevel;
} {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const hoursAgo = Math.floor((now - created) / (1000 * 60 * 60));
  const hoursRemaining = Math.max(0, 72 - hoursAgo);

  let level: FreshnessLevel = "fresh";
  if (hoursAgo >= 48) level = "cold";
  else if (hoursAgo >= 12) level = "warm";

  return { hoursAgo, hoursRemaining, level };
}

function getRecencyContext(hoursAgo: number, level: FreshnessLevel): {
  message: string;
  className: string;
  iconClassName: string;
} {
  if (level === "fresh") {
    return {
      message: `Signal detected ${hoursAgo}h ago \u2014 early opportunity window`,
      className: "bg-accent-green/5 border border-accent-green/15",
      iconClassName: "text-accent-green/70",
    };
  }
  if (level === "warm") {
    return {
      message: `Signal detected ${hoursAgo}h ago \u2014 market awareness may be growing`,
      className: "bg-accent-amber/5 border border-accent-amber/15",
      iconClassName: "text-accent-amber/70",
    };
  }
  return {
    message: `Signal detected ${hoursAgo}h ago \u2014 verify current conditions before building`,
    className: "bg-surface border border-border",
    iconClassName: "text-text-muted",
  };
}

interface AlphaDetailClientProps {
  card: AlphaCard;
  cardId: string;
  tier: "free" | "pro";
}

export function AlphaDetailClient({ card, cardId, tier }: AlphaDetailClientProps) {
  const isLocked = tier === "free";
  const searchParams = useSearchParams();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [triggerField, setTriggerField] = useState<ProField | undefined>();
  const [showReveal, setShowReveal] = useState(false);

  // Detect post-upgrade reveal
  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      setShowReveal(true);
      // Strip query params after animation starts
      const timeout = setTimeout(() => {
        router.replace(`/alpha/${cardId}`);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [searchParams, router, cardId]);

  const proSectionsRef = useRef<HTMLDivElement>(null);

  const openModal = useCallback((field?: ProField) => {
    // Respect 30-minute cooldown after "Maybe later" dismiss
    try {
      const dismissed = sessionStorage.getItem("upgrade_modal_dismissed");
      if (dismissed) {
        const elapsed = Date.now() - Number(dismissed);
        if (elapsed < 30 * 60 * 1000) {
          // Scroll to the pro section instead of opening modal
          proSectionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
    } catch {}
    setTriggerField(field);
    setModalOpen(true);
  }, []);

  // Recency context (all users)
  const { hoursAgo, level } = getCardAge(card.created_at);
  const recency = getRecencyContext(hoursAgo, level);

  // Wrap pro sections for reveal animation
  const proSectionVariants = showReveal ? clipRevealItem : undefined;
  const ProSection = showReveal ? motion.section : "section";

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-accent-amber">
              {categoryLabels[card.category] ?? card.category}
            </span>
            <MomentumBadge
              score={card.signal_strength}
              direction={card.direction}
            />
            <Badge
              variant={card.status === "fresh" ? "success" : "default"}
              shape="pill"
            >
              {card.status}
            </Badge>
          </div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">{card.title}</h1>
            <BookmarkButton cardId={cardId} size="md" className="mt-1 shrink-0" />
          </div>
        </div>

        {/* Entities */}
        <div className="flex flex-wrap gap-2">
          {card.entities.map((entity) => (
            <Badge key={entity} shape="tag" className="text-sm px-3 py-1">
              {entity}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card padding="compact">
            <div className="text-text-muted text-xs font-mono uppercase tracking-wider mb-1.5">Signals</div>
            <div className="text-2xl font-bold font-mono">
              {card.signal_count}
            </div>
          </Card>
          <Card padding="compact">
            <div className="text-text-muted text-xs font-mono uppercase tracking-wider mb-1.5">Strength</div>
            <div className="text-2xl font-bold font-mono">
              {Math.round(card.signal_strength * 100)}%
            </div>
          </Card>
          <Card padding="compact">
            <div className="text-text-muted text-xs font-mono uppercase tracking-wider mb-1.5">Freshness</div>
            <div className="text-2xl font-bold font-mono">
              {Math.round(card.freshness_score * 100)}%
            </div>
          </Card>
        </div>

        {/* Recency banner (all users) */}
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${recency.className}`}>
          <Signal className={`size-4 shrink-0 ${recency.iconClassName}`} />
          <span className="text-text-muted">{recency.message}</span>
        </div>

        {/* Content sections */}
        <div className="space-y-8">
          {/* Thesis (free tier) */}
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-4">Thesis</h2>
            <p className="font-[family-name:var(--font-serif)] text-text-muted leading-relaxed">{card.thesis}</p>
          </section>

          {/* Evidence (truncated for free, full for pro) */}
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-4">Evidence</h2>
            {card.evidence && card.evidence.length > 0 ? (
              <div className="space-y-3">
                {card.evidence.map((ev) => (
                  <Card key={ev.tweet_id} padding="compact">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm text-accent-green">
                        @{ev.author}
                      </span>
                      <span className="text-xs text-text-muted font-mono">
                        {Math.round(ev.relevance * 100)}% relevant
                      </span>
                    </div>
                    <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm">{ev.snippet}</p>
                  </Card>
                ))}
                {isLocked && (
                  <InlineUpgradeHint onUnlock={() => openModal()} />
                )}
              </div>
            ) : isLocked ? (
              <InlineUpgradeHint onUnlock={() => openModal()} />
            ) : (
              <p className="text-text-muted text-sm">No evidence available.</p>
            )}
          </section>

          {/* Pro-only sections */}
          {isLocked && (
            <div className="flex items-center gap-2 text-text-dim font-mono text-xs">
              <Lock className="size-3.5" />
              <span>10 Pro sections locked</span>
            </div>
          )}
          <motion.div
            ref={proSectionsRef}
            className="space-y-8 pt-2"
            variants={showReveal ? clipRevealStagger : undefined}
            initial={showReveal ? "hidden" : undefined}
            animate={showReveal ? "visible" : undefined}
          >
            <ProSection variants={proSectionVariants}>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-4">Friction Detail</h2>
              {isLocked ? (
                <ProFieldTeaser field="friction_detail" onUnlock={() => openModal("friction_detail")} />
              ) : card.friction_detail ? (
                <p className="font-[family-name:var(--font-serif)] text-text-muted leading-relaxed">
                  {card.friction_detail}
                </p>
              ) : null}
            </ProSection>

            <ProSection variants={proSectionVariants}>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-4">Gap Analysis</h2>
              {isLocked ? (
                <ProFieldTeaser field="gap_analysis" onUnlock={() => openModal("gap_analysis")} />
              ) : card.gap_analysis ? (
                <p className="font-[family-name:var(--font-serif)] text-text-muted leading-relaxed">
                  {card.gap_analysis}
                </p>
              ) : null}
            </ProSection>

            <ProSection variants={proSectionVariants}>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-4">Timing Signal</h2>
              {isLocked ? (
                <ProFieldTeaser field="timing_signal" onUnlock={() => openModal("timing_signal")} />
              ) : card.timing_signal ? (
                <p className="font-[family-name:var(--font-serif)] text-text-muted leading-relaxed">
                  {card.timing_signal}
                </p>
              ) : null}
            </ProSection>

            <ProSection variants={proSectionVariants}>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-4">Competitive Landscape</h2>
              {isLocked ? (
                <ProFieldTeaser field="competitive_landscape" onUnlock={() => openModal("competitive_landscape")} />
              ) : card.competitive_landscape ? (
                <p className="font-[family-name:var(--font-serif)] text-text-muted leading-relaxed">
                  {card.competitive_landscape}
                </p>
              ) : null}
            </ProSection>

            <ProSection variants={proSectionVariants}>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-4">Risk Factors</h2>
              {isLocked ? (
                <ProFieldTeaser field="risk_factors" onUnlock={() => openModal("risk_factors")} />
              ) : card.risk_factors ? (
                <ul className="font-[family-name:var(--font-serif)] list-disc list-inside text-text-muted space-y-1">
                  {card.risk_factors.map((risk, i) => (
                    <li key={i}>{risk}</li>
                  ))}
                </ul>
              ) : null}
            </ProSection>

            <ProSection variants={proSectionVariants}>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-4">Opportunity Type</h2>
              {isLocked ? (
                <ProFieldTeaser field="opportunity_type" onUnlock={() => openModal("opportunity_type")} />
              ) : card.opportunity_type ? (
                <Badge variant="success" shape="tag" className="text-sm px-3 py-1">
                  {card.opportunity_type.replace("_", " ")}
                </Badge>
              ) : null}
            </ProSection>

            {/* Blueprint section — strategic direction */}
            <div className="border-t border-text-dim/20 pt-8">
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent-green mb-8">The Blueprint</p>

              <div className="space-y-8">
                <ProSection variants={proSectionVariants}>
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-4">MVP Scope</h2>
                  {isLocked ? (
                    <ProFieldTeaser field="mvp_scope" onUnlock={() => openModal("mvp_scope")} />
                  ) : card.mvp_scope ? (
                    <p className="font-[family-name:var(--font-serif)] text-text-muted leading-relaxed">
                      {card.mvp_scope}
                    </p>
                  ) : null}
                </ProSection>

                <ProSection variants={proSectionVariants}>
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-4">Monetization Angle</h2>
                  {isLocked ? (
                    <ProFieldTeaser field="monetization_angle" onUnlock={() => openModal("monetization_angle")} />
                  ) : card.monetization_angle ? (
                    <p className="font-[family-name:var(--font-serif)] text-text-muted leading-relaxed">
                      {card.monetization_angle}
                    </p>
                  ) : null}
                </ProSection>

                <ProSection variants={proSectionVariants}>
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-4">Target Buyer</h2>
                  {isLocked ? (
                    <ProFieldTeaser field="target_buyer" onUnlock={() => openModal("target_buyer")} />
                  ) : card.target_buyer ? (
                    <p className="font-[family-name:var(--font-serif)] text-text-muted leading-relaxed">
                      {card.target_buyer}
                    </p>
                  ) : null}
                </ProSection>

                <ProSection variants={proSectionVariants}>
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-4">Distribution Channels</h2>
                  {isLocked ? (
                    <ProFieldTeaser field="distribution_channels" onUnlock={() => openModal("distribution_channels")} />
                  ) : card.distribution_channels ? (
                    <p className="font-[family-name:var(--font-serif)] text-text-muted leading-relaxed">
                      {card.distribution_channels}
                    </p>
                  ) : null}
                </ProSection>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Upgrade modal */}
      {isLocked && (
        <UpgradeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          cardTitle={card.title}
          cardId={cardId}
          triggerField={triggerField}
        />
      )}
    </>
  );
}
