import { getAllDates, getDailyData } from "@/lib/data";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://overheard.vercel.app";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const dates = getAllDates().slice(0, 30);
  const latestDate = dates[0];
  const lastBuildDate = latestDate
    ? new Date(latestDate + "T08:00:00Z").toUTCString()
    : new Date().toUTCString();

  const items: string[] = [];

  for (const date of dates) {
    const data = getDailyData(date);
    if (!data) continue;

    for (const card of data.cards) {
      items.push(`    <item>
      <title>${escapeXml(card.title)}</title>
      <link>${BASE_URL}/card/${escapeXml(card.id)}</link>
      <guid isPermaLink="true">${BASE_URL}/card/${escapeXml(card.id)}</guid>
      <description>${escapeXml(card.thesis)}</description>
      <pubDate>${new Date(card.date + "T08:00:00Z").toUTCString()}</pubDate>
      <category>${escapeXml(card.category)}</category>
    </item>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Overheard</title>
    <link>${BASE_URL}</link>
    <description>Daily AI-generated opportunity briefs from HN, Reddit, GitHub, and Product Hunt.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
