export interface Evidence {
  text: string;
  source: "hackernews" | "reddit" | "github" | "producthunt";
  url?: string;
  engagement: number;
}

export interface AlphaCard {
  id: string; // "2026-02-22-ai-coding-tools"
  date: string; // "2026-02-22"
  title: string;
  category: string; // "ai-tools", "saas", "making-money", etc.
  thesis: string;
  signal_strength: number; // 1-10
  evidence: Evidence[];
  opportunity: string;
  sources: string[];
  signal_count: number;
}

export interface DailyData {
  date: string;
  generated_at: string;
  cards: AlphaCard[];
}
