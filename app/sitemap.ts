import type { MetadataRoute } from "next";
import { getAllCards, getAllDates, getAllCategories } from "@/lib/data";
import { getAllGlossaryTerms } from "@/lib/glossary";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://overheard.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const latestDate = getAllDates()[0];

  const editionEntries: MetadataRoute.Sitemap = getAllDates().map((date) => ({
    url: `${BASE_URL}/edition/${date}`,
    lastModified: new Date(date),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const cardEntries: MetadataRoute.Sitemap = getAllCards().map((card) => ({
    url: `${BASE_URL}/card/${card.id}`,
    lastModified: new Date(card.date),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = getAllCategories().map((slug) => ({
    url: `${BASE_URL}/category/${slug}`,
    lastModified: latestDate ? new Date(latestDate) : new Date(),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const glossaryEntries: MetadataRoute.Sitemap = getAllGlossaryTerms().map((term) => ({
    url: `${BASE_URL}/glossary/${term.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: latestDate ? new Date(latestDate) : new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/archive`,
      lastModified: latestDate ? new Date(latestDate) : new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/glossary`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/terms`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    ...glossaryEntries,
    ...categoryEntries,
    ...editionEntries,
    ...cardEntries,
  ];
}
