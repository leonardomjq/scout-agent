import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScoutAgent — Venture Intelligence",
  description:
    "Your AI venture analyst. ScoutAgent tracks what developers are building and shipping, spots where traction is clustering, and delivers actionable opportunity briefs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg text-text font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
