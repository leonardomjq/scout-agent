import { ImageResponse } from "next/og";
import { getCardById } from "@/lib/data";

export const runtime = "nodejs";
export const alt = "Overheard Alpha Card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = getCardById(id);

  if (!card) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1a1a1f",
            color: "#f0f0f2",
            fontSize: 32,
            fontFamily: "sans-serif",
          }}
        >
          Card not found
        </div>
      ),
      { ...size }
    );
  }

  const uniqueSources = new Set(card.sources);
  const thesisPreview =
    card.thesis.length > 160 ? card.thesis.slice(0, 157) + "..." : card.thesis;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#1a1a1f",
          padding: 60,
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: logo + category */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 24, fontWeight: 700 }}>
            <span style={{ color: "#f0f0f2" }}>over</span>
            <span style={{ color: "#6b6b78" }}>heard</span>
          </div>
          <span
            style={{
              fontSize: 14,
              color: "#6b6b78",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {card.category.replace(/-/g, " ")}
          </span>
        </div>

        {/* Middle: title + thesis */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, justifyContent: "center" }}>
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: "#f0f0f2",
              lineHeight: 1.2,
              maxWidth: 900,
            }}
          >
            {card.title}
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#8b8b98",
              lineHeight: 1.5,
              maxWidth: 900,
            }}
          >
            {thesisPreview}
          </div>
        </div>

        {/* Bottom: meta */}
        <div
          style={{
            display: "flex",
            gap: 32,
            fontSize: 16,
            color: "#6b6b78",
          }}
        >
          <span>{card.date}</span>
          <span>{card.evidence.length} evidence</span>
          <span>{uniqueSources.size} sources</span>
          <span>Signal {card.signal_strength}/10</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
