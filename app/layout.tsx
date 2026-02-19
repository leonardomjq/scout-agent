import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk, IBM_Plex_Serif } from "next/font/google";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-serif",
});

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
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${ibmPlexSerif.variable}`}
    >
      <body className="min-h-screen bg-bg text-text font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
