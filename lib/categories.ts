interface CategoryMeta {
  label: string;
  description: string;
}

/**
 * Canonical category metadata. Labels for display, descriptions for SEO.
 * Categories not in this map get auto-generated labels from slugs.
 */
export const CATEGORY_META: Record<string, CategoryMeta> = {
  "ai-tools": {
    label: "AI Tools",
    description:
      "Opportunities around AI-powered tools, coding assistants, and products that use AI to solve real problems. What's blowing up, what's broken, and what you could build next.",
  },
  "making-money": {
    label: "Making Money",
    description:
      "Signals about monetization, pricing, revenue models, and business opportunities. Real talk from founders about what's actually making money right now.",
  },
  "side-projects": {
    label: "Side Projects",
    description:
      "Weekend-sized opportunities you can ship fast. Browser extensions, micro-tools, and small bets that real people are already paying for.",
  },
  "no-code": {
    label: "No-Code & Low-Code",
    description:
      "Opportunities in the no-code and low-code space. Visual builders, automation platforms, and tools that let non-technical builders ship real products.",
  },
  apps: {
    label: "Apps & Products",
    description:
      "Opportunities around apps, products, and tools people are asking for. What users want, what's missing, and where the gaps are.",
  },
  trends: {
    label: "Trends",
    description:
      "Emerging patterns and shifts happening across tech communities right now. The stuff everyone will be talking about next month.",
  },
  "creator-tools": {
    label: "Creator Tools",
    description:
      "Tools for creators, educators, and content builders. What creators need, what's underserved, and where the next wave of tools is heading.",
  },
  saas: {
    label: "SaaS",
    description:
      "Software-as-a-service opportunities — what niches are underserved, what founders are frustrated with, and where there's room for a new product.",
  },
  automation: {
    label: "Automation",
    description:
      "Workflow automation, bots, and tools that save people time. Signals about what people are desperate to automate and what's not solved yet.",
  },
  marketplaces: {
    label: "Marketplaces",
    description:
      "Marketplace and e-commerce opportunities. Where buyers and sellers aren't well connected, and what platforms people wish existed.",
  },
};

export function getCategoryLabel(slug: string): string {
  return (
    CATEGORY_META[slug]?.label ??
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function getCategoryDescription(slug: string): string {
  return (
    CATEGORY_META[slug]?.description ??
    `Opportunity briefs in the ${getCategoryLabel(slug)} category, synthesized from signals across Hacker News, Reddit, GitHub, and Product Hunt.`
  );
}
