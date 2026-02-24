export interface GlossaryTerm {
  slug: string;
  name: string;
  definition: string;
  body: string;
  related: string[]; // slugs of related terms
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    slug: "alpha-card",
    name: "Alpha Card",
    definition:
      "A structured opportunity brief published by Overheard, synthesized from public signals across Hacker News, Reddit, GitHub, and Product Hunt.",
    body: `An Alpha Card is the core unit of content on Overheard. Each card identifies a specific opportunity — a demand spike, frustration cluster, or emerging gap — where builders could ship something useful.

Every Alpha Card contains: a title describing the opportunity, a thesis explaining why it matters, evidence quotes from real conversations with links to original sources, a signal strength score (1–10) reflecting engagement volume, and a suggested opportunity for builders.

Alpha Cards are generated daily at 8 AM UTC by an automated pipeline. The pipeline fetches signals from four public sources, clusters them by keyword overlap, scores clusters by engagement and source diversity, and synthesizes the top-scoring clusters into briefs using Google Gemini Flash.

The name "Alpha" refers to the investing concept of alpha — excess returns above the market. In Overheard's context, it means identifying opportunities before they become obvious.`,
    related: ["signal-strength", "evidence", "opportunity-brief"],
  },
  {
    slug: "signal-strength",
    name: "Signal Strength",
    definition:
      "A score from 1 to 10 on each Alpha Card that reflects engagement volume and source diversity across Hacker News, Reddit, GitHub, and Product Hunt.",
    body: `Signal strength is a numeric score assigned to each Alpha Card. It ranges from 1 (low) to 10 (high) and reflects how much attention a topic is getting across multiple platforms.

A higher signal strength means more people are discussing the topic across more platforms. The score is calculated from total engagement (upvotes, comments, stars) multiplied by a source diversity factor — signals that appear on multiple platforms rank higher than single-source signals.

Signal strength is not editorial judgment. It does not indicate that an opportunity is "good" or "bad." A score of 8 means the topic has high cross-platform engagement. A score of 3 means the signal is emerging but not yet widely discussed.

Overheard displays signal strength as data, not visual hierarchy. All cards render identically regardless of their score — the number is shown so readers can factor it into their own assessment.`,
    related: ["alpha-card", "evidence", "market-signals"],
  },
  {
    slug: "opportunity-brief",
    name: "Opportunity Brief",
    definition:
      "A concise document identifying a market opportunity, including evidence, thesis, and suggested action. The format used by Overheard's Alpha Cards.",
    body: `An opportunity brief is a structured document that identifies where demand exists but supply is lacking. Overheard's Alpha Cards are opportunity briefs formatted for quick scanning.

Each brief answers three questions: What is happening? (the thesis), Why does it matter? (the evidence), and What could a builder do about it? (the opportunity).

Unlike traditional market research reports that take weeks to produce and cost thousands, opportunity briefs on Overheard are generated daily from real-time signals. They trade depth for speed — the goal is to surface emerging patterns early, not to provide exhaustive market analysis.

Opportunity briefs are most useful for solo founders and indie hackers who need to quickly evaluate whether a problem space is worth exploring before committing development time.`,
    related: ["alpha-card", "demand-spike", "market-signals"],
  },
  {
    slug: "demand-spike",
    name: "Demand Spike",
    definition:
      "A sudden increase in conversations or engagement around a specific pain point or topic, detected across multiple public platforms.",
    body: `A demand spike occurs when conversations about a specific problem, tool, or need increase sharply across platforms like Hacker News, Reddit, GitHub, or Product Hunt.

Overheard detects demand spikes by monitoring engagement metrics — upvotes, comments, stars, and launches — across all four sources. When multiple signals about the same topic cluster together with above-average engagement, the pipeline flags it as a potential opportunity.

Demand spikes differ from trends. A trend is a sustained directional change over weeks or months. A demand spike is a short-term burst — a sudden cluster of people asking for the same thing, complaining about the same problem, or building toward the same solution.

For builders, demand spikes are actionable because they indicate a specific, current need. If hundreds of people are complaining about the same problem this week, there may be room for a product that solves it.`,
    related: ["market-signals", "signal-strength", "evidence"],
  },
  {
    slug: "evidence",
    name: "Evidence",
    definition:
      "A specific data point — a quote, engagement metric, or source link — from a public platform that supports the thesis of an Alpha Card.",
    body: `Evidence is the foundation of every Alpha Card. Each piece of evidence is a real quote or data point from a public conversation on Hacker News, Reddit, GitHub, or Product Hunt.

Every evidence item includes: the quoted text from the original conversation, the source platform, engagement metrics (upvotes, comments, stars), and a link to the original post so readers can verify the claim.

Evidence serves two purposes. First, it grounds the AI-generated thesis in real data — you can click through to see the actual conversations that triggered the opportunity brief. Second, it helps readers assess the quality and relevance of the signal before deciding to act on it.

Overheard typically includes 3–8 evidence items per Alpha Card. Evidence from multiple platforms (cross-platform evidence) is weighted higher in the clustering and scoring process.`,
    related: ["alpha-card", "signal-strength", "market-signals"],
  },
  {
    slug: "market-signals",
    name: "Market Signals",
    definition:
      "Public indicators of demand, frustration, or emerging opportunity detected from conversations across Hacker News, Reddit, GitHub, and Product Hunt.",
    body: `Market signals are the raw inputs that Overheard processes into opportunity briefs. A signal is any public data point that indicates demand, frustration, or an emerging gap — a Hacker News post with unusually high engagement, a Reddit thread where users request a specific tool, a GitHub repository gaining rapid stars, or a Product Hunt launch filling an obvious need.

Overheard fetches approximately 250 signals per day from four sources: Hacker News (front page, Ask HN, Show HN stories from the last 48 hours), Reddit (posts from r/SaaS, r/startups, r/Entrepreneur, and r/smallbusiness), GitHub (repositories created in the last 48 hours sorted by stars), and Product Hunt (daily launches via their Atom feed).

Not all signals become Alpha Cards. The pipeline clusters signals by keyword overlap, then scores each cluster by total engagement multiplied by a source diversity factor. Only the top-scoring clusters — typically 3 to 10 per day — are synthesized into opportunity briefs.

The term "market signals" is used instead of "data" or "intelligence" because it accurately describes what these are: indicators that suggest something is happening, not proof that an opportunity will succeed.`,
    related: ["demand-spike", "evidence", "signal-strength"],
  },
];

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find((t) => t.slug === slug);
}

export function getAllGlossaryTerms(): GlossaryTerm[] {
  return GLOSSARY_TERMS;
}
