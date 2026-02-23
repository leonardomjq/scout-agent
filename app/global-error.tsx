"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a1614",
          color: "#f5f0e8",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
            Something went wrong
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#9a9090",
              marginBottom: "1.5rem",
            }}
          >
            A critical error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1.5rem",
              fontSize: "0.875rem",
              backgroundColor: "#c8913a",
              color: "#1a1614",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
