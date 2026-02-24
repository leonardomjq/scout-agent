import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Overheard — Free Opportunity Briefs for Builders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 64,
            fontWeight: 700,
            color: "#f0f0f2",
            marginBottom: 24,
          }}
        >
          <span>over</span>
          <span style={{ color: "#6b6b78" }}>heard</span>
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#8b8b98",
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Free, daily opportunity briefs from HN, Reddit, GitHub, and Product Hunt
        </div>
      </div>
    ),
    { ...size }
  );
}
