import type { AlphaCard } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://overheard.vercel.app";

/** Organization without @context — safe for embedding inside other schemas */
function orgEntity() {
  return {
    "@type": "Organization",
    name: "Overheard",
    url: BASE_URL,
    sameAs: ["https://github.com/leonardomjq/overheard"],
    founder: {
      "@type": "Person",
      name: "Leonardo Jaques",
      url: "https://github.com/leonardomjq",
    },
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Overheard",
    url: BASE_URL,
    description:
      "Daily AI-generated opportunity briefs from HN, Reddit, GitHub, and Product Hunt. Free, open-source market signals for founders and builders.",
    publisher: orgEntity(),
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    ...orgEntity(),
  };
}

export function buildArticleSchema(card: AlphaCard) {
  const citations = card.evidence
    .filter((ev) => ev.url)
    .map((ev) => ev.url);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: card.title,
    description: card.thesis,
    datePublished: card.date,
    dateModified: card.date,
    author: orgEntity(),
    publisher: orgEntity(),
    mainEntityOfPage: `${BASE_URL}/card/${card.id}`,
    articleSection: card.category,
    ...(citations.length > 0 && { citation: citations }),
  };
}

export function buildBreadcrumbSchema(
  crumbs: { name: string; url?: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      ...(crumb.url && { item: crumb.url }),
    })),
  };
}

export function buildCollectionPageSchema(
  date: string,
  cards: AlphaCard[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Overheard — ${date}`,
    url: `${BASE_URL}/edition/${date}`,
    description: `${cards.length} opportunity briefs from ${date}.`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: cards.length,
      itemListElement: cards.map((card, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${BASE_URL}/card/${card.id}`,
        name: card.title,
      })),
    },
  };
}

export function buildCategoryCollectionSchema(
  slug: string,
  label: string,
  cards: AlphaCard[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${label} Opportunities — Overheard`,
    url: `${BASE_URL}/category/${slug}`,
    description: `${cards.length} opportunity briefs in ${label}.`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: cards.length,
      itemListElement: cards.map((card, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${BASE_URL}/card/${card.id}`,
        name: card.title,
      })),
    },
  };
}

export function buildAboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Overheard",
    url: `${BASE_URL}/about`,
    description:
      "How Overheard works — data sources, methodology, and who built it.",
    mainEntity: orgEntity(),
  };
}

export function buildFAQSchema(
  items: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildDefinedTermSchema(term: {
  name: string;
  slug: string;
  definition: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: `${term.name} — Overheard Glossary`,
    url: `${BASE_URL}/glossary/${term.slug}`,
    hasDefinedTerm: {
      "@type": "DefinedTerm",
      name: term.name,
      description: term.definition,
      url: `${BASE_URL}/glossary/${term.slug}`,
      inDefinedTermSet: `${BASE_URL}/glossary`,
    },
  };
}
