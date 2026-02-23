import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { AlphaCard, DailyData } from "@/types";

const DATA_DIR = join(process.cwd(), "data");

/** List all date files, newest first */
export function getAllDates(): string[] {
  if (!existsSync(DATA_DIR)) return [];
  return readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("signals"))
    .map((f) => f.replace(".json", ""))
    .sort()
    .reverse();
}

/** Read one day's cards */
export function getDailyData(date: string): DailyData | null {
  const filePath = join(DATA_DIR, `${date}.json`);
  if (!existsSync(filePath)) return null;
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as DailyData;
}

/** Get the latest day's data */
export function getLatestData(): DailyData | null {
  const dates = getAllDates();
  if (dates.length === 0) return null;
  return getDailyData(dates[0]);
}

/** Find a card by ID across all dates */
export function getCardById(id: string): AlphaCard | null {
  for (const date of getAllDates()) {
    const data = getDailyData(date);
    if (!data) continue;
    const card = data.cards.find((c) => c.id === id);
    if (card) return card;
  }
  return null;
}

/** Get adjacent dates for prev/next navigation */
export function getAdjacentDates(date: string): { prev: string | null; next: string | null } {
  const dates = getAllDates(); // newest-first
  const idx = dates.indexOf(date);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: dates[idx + 1] ?? null,  // older = further in array
    next: dates[idx - 1] ?? null,  // newer = earlier in array
  };
}

/** All cards (for static params generation) */
export function getAllCards(): AlphaCard[] {
  return getAllDates().flatMap((date) => getDailyData(date)?.cards ?? []);
}
