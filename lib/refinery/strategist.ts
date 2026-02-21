import { v4 as uuidv4 } from "uuid";
import { createAdminClient } from "@/lib/appwrite/admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { toJsonString } from "@/lib/appwrite/helpers";
import { extractStructured } from "@/lib/ai";
import { AlphaCardSchema } from "@/schemas/alpha";
import type { AlphaCard, Signal, SignalSource, ScrubberOutput, EntityBaseline } from "@/types";

// Schema for LLM synthesis (omit fields we set ourselves)
const StrategistOutputSchema = AlphaCardSchema.omit({
  id: true,
  created_at: true,
  status: true,
  freshness_score: true,
  cluster_id: true,
});

function buildContext(
  signal: Signal,
  recentOutputs: ScrubberOutput[],
  baselines: Map<string, EntityBaseline>,
  originalSignals?: Map<string, SignalSource>
): string {
  const entityList = signal.entities.join(", ");
  const frictionPoints: string[] = [];
  const insights: string[] = [];

  for (const output of recentOutputs) {
    for (const fp of output.friction_points) {
      if (signal.entities.some((e) => fp.entity.toLowerCase() === e.toLowerCase())) {
        frictionPoints.push(`- [${fp.severity}] ${fp.entity}: ${fp.signal}`);
      }
    }
    for (const notable of output.notable_tweets) {
      if (signal.evidence_tweet_ids.includes(notable.tweet_id)) {
        // Look up original signal for real author/content
        const source = originalSignals?.get(notable.tweet_id);
        if (source && source.source_type === "twitter") {
          insights.push(
            `- @${source.author_handle}: "${source.content.slice(0, 280)}" (relevance: ${notable.relevance_score})`
          );
        } else if (source) {
          insights.push(
            `- [${source.source_type}]: "${source.content.slice(0, 280)}" (relevance: ${notable.relevance_score})`
          );
        } else {
          insights.push(
            `- ${notable.tweet_id} (relevance: ${notable.relevance_score}): ${notable.extracted_insight}`
          );
        }
      }
    }
  }

  // Baseline context
  const baselineInfo: string[] = [];
  for (const entityName of signal.entities) {
    const baseline = baselines.get(entityName.toLowerCase());
    if (baseline) {
      baselineInfo.push(
        `- ${entityName}: ${baseline.baseline_mentions_per_day} mentions/day avg, sentiment ${baseline.baseline_sentiment}, friction rate ${baseline.baseline_friction_rate} (${baseline.daily_snapshots.length} days of history)`
      );
    }
  }

  return `## Signal Analysis
Type: ${signal.type}
Entities: ${entityList}
Signal Strength: ${signal.signal_strength} (0-1)
Direction: ${signal.direction}
Mention Velocity: ${signal.mention_velocity}x (vs baseline)
Sentiment Delta: ${signal.sentiment_delta}
Friction Spike: ${signal.friction_spike}
Evidence Sources: ${signal.evidence_tweet_ids.length}
${signal.friction_theme ? `Friction Theme: ${signal.friction_theme}` : ""}
Window: ${signal.window_hours}h

## Entity Baselines
${baselineInfo.length > 0 ? baselineInfo.join("\n") : "No baseline history yet (cold start)"}

## Friction Points
${frictionPoints.length > 0 ? frictionPoints.join("\n") : "None identified"}

## Key Insights from Evidence
${insights.length > 0 ? insights.join("\n") : "No specific insights extracted"}`;
}

export interface StrategistResult {
  card: AlphaCard | null;
  tokensUsed: number;
  error?: string;
}

export async function synthesizeAlphaCard(
  signal: Signal,
  recentOutputs: ScrubberOutput[],
  baselines: Map<string, EntityBaseline>,
  originalSignals?: Map<string, SignalSource>
): Promise<StrategistResult> {
  const context = buildContext(signal, recentOutputs, baselines, originalSignals);

  const result = await extractStructured({
    model: "claude-sonnet",
    system: `You are a developer intelligence analyst. You transform technical signal data into evidence-grounded intelligence briefs ("Alpha Cards") for developers, indie hackers, and technical builders.

CRITICAL RULES:
1. Only make claims supported by evidence from the pipeline data provided
2. Quote or paraphrase actual developer statements from the evidence
3. Name specific tools, libraries, and versions when discussing gaps
4. Quantify: reference actual mention counts, velocity ratios, and baseline comparisons
5. NEVER invent product names, TAM numbers, pricing strategies, or speculative market sizes
6. Blueprint fields (mvp_scope, monetization_angle, target_buyer, distribution_channels) should provide STRATEGIC DIRECTION — not tactical implementation plans. Frame opportunities, not step-by-step instructions. Ground in the evidence.

Categories:
- velocity_spike: Significant increase in developer discussion volume vs baseline
- sentiment_flip: Notable shift in developer sentiment (positive→negative or vice versa)
- friction_cluster: Multiple technologies sharing similar pain points
- new_emergence: Previously unseen or very low-baseline entity suddenly gaining traction

Opportunity types:
- tooling_gap: Developers need a tool that doesn't exist yet
- migration_aid: Developers are migrating between technologies and need help
- dx_improvement: Existing tools work but have poor developer experience
- integration: Developers need better connections between existing tools`,
    prompt: `Based on this signal data, generate an Alpha Card intelligence brief.

${context}

Generate a structured Alpha Card with:
1. A compelling, specific title (mention the key entities)
2. Correct category classification matching the signal type
3. A thesis (2-3 sentences) explaining WHY this signal matters — reference the data
4. Friction detail: specific pain points in developers' own words from the evidence
5. Gap analysis: what exists vs what's missing, derived from the evidence
6. Timing signal: why now — reference velocity data, baseline comparisons, acceleration
7. Risk factors: counterarguments derived FROM THE DATA (not speculation)
8. Evidence: curate the most relevant tweets (up to 15) with author, snippet, relevance score
9. Competitive landscape: existing tools/solutions mentioned in the evidence
10. Opportunity type classification
11. MVP scope: smallest product that captures this opportunity. One tool, one workflow — not a platform.
12. Monetization angle: how a builder would charge. Reference evidence about willingness to pay if available.
13. Target buyer: specific persona, their context, their buying trigger. Beyond the category.
14. Distribution channels: where buyers gather, how to reach the first 10 customers. Reference evidence sources.

The thesis should be insightful enough that a developer reading just the title + thesis understands the opportunity.`,
    schema: StrategistOutputSchema,
  });

  if ("error" in result) {
    return { card: null, tokensUsed: result.tokensUsed, error: result.error };
  }

  const now = new Date();

  const card: AlphaCard = {
    id: uuidv4(),
    created_at: now.toISOString(),
    status: "fresh",
    freshness_score: 1.0,
    cluster_id: signal.signal_id,
    ...result.data,
  };

  // Validate the full card
  AlphaCardSchema.parse(card);

  return { card, tokensUsed: result.tokensUsed };
}

export async function persistAlphaCard(card: AlphaCard): Promise<void> {
  const { databases } = createAdminClient();

  await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.ALPHA_CARDS,
    card.id,
    {
      title: card.title,
      category: card.category,
      entities: card.entities,
      signal_strength: card.signal_strength,
      direction: card.direction,
      signal_count: card.signal_count,
      status: card.status,
      freshness_score: card.freshness_score,
      cluster_id: card.cluster_id,
      thesis: card.thesis,
      friction_detail: card.friction_detail ?? null,
      gap_analysis: card.gap_analysis ?? null,
      timing_signal: card.timing_signal ?? null,
      risk_factors: card.risk_factors ?? null,
      evidence: card.evidence ? toJsonString(card.evidence) : null,
      competitive_landscape: card.competitive_landscape ?? null,
      opportunity_type: card.opportunity_type ?? null,
      mvp_scope: card.mvp_scope ?? null,
      monetization_angle: card.monetization_angle ?? null,
      target_buyer: card.target_buyer ?? null,
      distribution_channels: card.distribution_channels ?? null,
    }
  );
}
