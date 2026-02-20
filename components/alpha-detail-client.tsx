"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, Lock } from "lucide-react";
import { MomentumBadge } from "@/components/momentum-badge";
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

function getUrgencyMessage(hoursAgo: number, hoursRemaining: number, level: FreshnessLevel): string | null {
  if (level === "fresh") {
    return `Detected ${hoursAgo}h ago. Early window \u2014 full strategy available now.`;
  }
  if (level === "warm") {
    return `Detected ${hoursAgo}h ago. Window closing \u2014 ${hoursRemaining}h until this brief expires.`;
  }
  if (level === "cold") {
    return `This opportunity expires in ${hoursRemaining}h. Unlock before it\u2019s gone.`;
  }
  return null;
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

  // Urgency calculations (free users only)
  const { hoursAgo, hoursRemaining, level } = getCardAge(card.created_at);
  const urgencyMessage = isLocked ? getUrgencyMessage(hoursAgo, hoursRemaining, level) : null;
  const modalUrgencyText =
    isLocked && level !== "fresh"
      ? `This brief expires in ${hoursRemaining}h.`
      : undefined;

  // Wrap pro sections for reveal animation
  const proSectionVariants = showReveal ? clipRevealItem : undefined;
  const ProSection = showReveal ? motion.section : "section";

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
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
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">{card.title}</h1>
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
            <div className="text-text-muted text-xs mb-1">Signals</div>
            <div className="text-2xl font-bold font-mono">
              {card.signal_count}
            </div>
          </Card>
          <Card padding="compact">
            <div className="text-text-muted text-xs mb-1">Strength</div>
            <div className="text-2xl font-bold font-mono">
              {Math.round(card.signal_strength * 100)}%
            </div>
          </Card>
          <Card padding="compact">
            <div className="text-text-muted text-xs mb-1">Freshness</div>
            <div className="text-2xl font-bold font-mono">
              {Math.round(card.freshness_score * 100)}%
            </div>
          </Card>
        </div>

        {/* Urgency banner (free users only) */}
        {isLocked && urgencyMessage && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-accent-orange/5 border border-accent-orange/20 text-sm">
            <Clock className="size-4 text-accent-orange shrink-0" />
            <span className="text-text-muted">{urgencyMessage}</span>
          </div>
        )}

        {/* Content sections */}
        <div className="space-y-6">
          {/* Thesis (free tier) */}
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-3">Thesis</h2>
            <p className="font-[family-name:var(--font-serif)] text-text-muted leading-relaxed">{card.thesis}</p>
          </section>

          {/* Evidence (truncated for free, full for pro) */}
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-3">Evidence</h2>
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
              <span>6 Pro sections locked</span>
            </div>
          )}
          <motion.div
            ref={proSectionsRef}
            className="space-y-6"
            variants={showReveal ? clipRevealStagger : undefined}
            initial={showReveal ? "hidden" : undefined}
            animate={showReveal ? "visible" : undefined}
          >
            <ProSection variants={proSectionVariants}>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-3">Friction Detail</h2>
              {isLocked ? (
                <ProFieldTeaser field="friction_detail" onUnlock={() => openModal("friction_detail")} />
              ) : card.friction_detail ? (
                <p className="font-[family-name:var(--font-serif)] text-text-muted leading-relaxed">
                  {card.friction_detail}
                </p>
              ) : null}
            </ProSection>

            <ProSection variants={proSectionVariants}>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-3">Gap Analysis</h2>
              {isLocked ? (
                <ProFieldTeaser field="gap_analysis" onUnlock={() => openModal("gap_analysis")} />
              ) : card.gap_analysis ? (
                <p className="font-[family-name:var(--font-serif)] text-text-muted leading-relaxed">
                  {card.gap_analysis}
                </p>
              ) : null}
            </ProSection>

            <ProSection variants={proSectionVariants}>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-3">Timing Signal</h2>
              {isLocked ? (
                <ProFieldTeaser field="timing_signal" onUnlock={() => openModal("timing_signal")} />
              ) : card.timing_signal ? (
                <p className="font-[family-name:var(--font-serif)] text-text-muted leading-relaxed">
                  {card.timing_signal}
                </p>
              ) : null}
            </ProSection>

            <ProSection variants={proSectionVariants}>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-3">Competitive Landscape</h2>
              {isLocked ? (
                <ProFieldTeaser field="competitive_landscape" onUnlock={() => openModal("competitive_landscape")} />
              ) : card.competitive_landscape ? (
                <p className="font-[family-name:var(--font-serif)] text-text-muted leading-relaxed">
                  {card.competitive_landscape}
                </p>
              ) : null}
            </ProSection>

            <ProSection variants={proSectionVariants}>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-3">Risk Factors</h2>
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
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-3">Opportunity Type</h2>
              {isLocked ? (
                <ProFieldTeaser field="opportunity_type" onUnlock={() => openModal("opportunity_type")} />
              ) : card.opportunity_type ? (
                <Badge variant="success" shape="tag" className="text-sm px-3 py-1">
                  {card.opportunity_type.replace("_", " ")}
                </Badge>
              ) : null}
            </ProSection>
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
          urgencyText={modalUrgencyText}
        />
      )}
    </>
  );
}
