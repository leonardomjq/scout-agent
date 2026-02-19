import { getLoggedInUser, createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { documentToAlphaCard, getUserTier } from "@/lib/appwrite/helpers";
import { gateAlphaCard } from "@/lib/refinery/gate";
import { MomentumBadge } from "@/components/momentum-badge";
import { BlurGate } from "@/components/blur-gate";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CopyLinkButton } from "@/components/copy-link-button";
import { InlineUpgradeHint } from "@/components/inline-upgrade-hint";
import { ProFieldTeaser } from "@/components/pro-field-teaser";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

const categoryLabels: Record<string, string> = {
  velocity_spike: "Velocity Spike",
  sentiment_flip: "Sentiment Flip",
  friction_cluster: "Friction Cluster",
  new_emergence: "New Emergence",
};

export default async function AlphaDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await getLoggedInUser();
  if (!user) notFound();

  const { databases } = await createSessionClient();
  const tier = await getUserTier(user.$id, databases);

  let rawDoc;
  try {
    rawDoc = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.ALPHA_CARDS,
      id
    );
  } catch {
    notFound();
  }

  const card = gateAlphaCard(documentToAlphaCard(rawDoc), tier);
  const isLocked = tier === "free";

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <Breadcrumbs
          crumbs={[
            { label: "Feed", href: "/" },
            { label: card.title },
          ]}
        />
        <CopyLinkButton />
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-accent-amber">
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
          <h1 className="text-3xl font-bold">{card.title}</h1>
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

        {/* Content sections */}
        <div className="space-y-6">
          {/* Thesis (free tier) */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Thesis</h2>
            <p className="text-text-muted leading-relaxed">{card.thesis}</p>
          </section>

          {/* Evidence (truncated for free, full for pro) */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Evidence</h2>
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
                    <p className="text-text-muted text-sm">{ev.snippet}</p>
                  </Card>
                ))}
                {isLocked && (
                  <InlineUpgradeHint />
                )}
              </div>
            ) : isLocked ? (
              <InlineUpgradeHint />
            ) : (
              <p className="text-text-muted text-sm">No evidence available.</p>
            )}
          </section>

          {/* Pro-only sections */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Friction Detail</h2>
            {isLocked ? (
              <ProFieldTeaser field="friction_detail" />
            ) : card.friction_detail ? (
              <p className="text-text-muted leading-relaxed">
                {card.friction_detail}
              </p>
            ) : null}
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Gap Analysis</h2>
            {isLocked ? (
              <ProFieldTeaser field="gap_analysis" />
            ) : card.gap_analysis ? (
              <p className="text-text-muted leading-relaxed">
                {card.gap_analysis}
              </p>
            ) : null}
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Timing Signal</h2>
            {isLocked ? (
              <ProFieldTeaser field="timing_signal" />
            ) : card.timing_signal ? (
              <p className="text-text-muted leading-relaxed">
                {card.timing_signal}
              </p>
            ) : null}
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Competitive Landscape</h2>
            {isLocked ? (
              <ProFieldTeaser field="competitive_landscape" />
            ) : card.competitive_landscape ? (
              <p className="text-text-muted leading-relaxed">
                {card.competitive_landscape}
              </p>
            ) : null}
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Risk Factors</h2>
            {isLocked ? (
              <ProFieldTeaser field="risk_factors" />
            ) : card.risk_factors ? (
              <ul className="list-disc list-inside text-text-muted space-y-1">
                {card.risk_factors.map((risk, i) => (
                  <li key={i}>{risk}</li>
                ))}
              </ul>
            ) : null}
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Opportunity Type</h2>
            {isLocked ? (
              <ProFieldTeaser field="opportunity_type" />
            ) : card.opportunity_type ? (
              <Badge variant="success" shape="tag" className="text-sm px-3 py-1">
                {card.opportunity_type.replace("_", " ")}
              </Badge>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
