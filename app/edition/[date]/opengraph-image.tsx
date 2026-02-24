import { ImageResponse } from "next/og";
import { getDailyData } from "@/lib/data";

export const runtime = "nodejs";
export const alt = "Overheard Edition";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function Image({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const data = getDailyData(date);
  const cardCount = data?.cards.length ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a1a1f",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 40,
          }}
        >
          <span style={{ color: "#f0f0f2" }}>over</span>
          <span style={{ color: "#6b6b78" }}>heard</span>
        </div>

        {/* Date */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#f0f0f2",
            marginBottom: 16,
          }}
        >
          {formatDate(date)}
        </div>

        {/* Card count */}
        <div
          style={{
            fontSize: 24,
            color: "#8b8b98",
          }}
        >
          {cardCount} opportunity {cardCount === 1 ? "brief" : "briefs"}
        </div>
      </div>
    ),
    { ...size }
  );
}
