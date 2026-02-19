/**
 * Freshness decay model for Alpha Cards.
 *
 * - < 12h → fresh (score 1.0-0.75)
 * - 12-48h → warm (score 0.75-0.4)
 * - 48h-7d → cold (score 0.4-0.1)
 * - > 7d → archived (score 0)
 */
export function computeFreshness(createdAt: string): { status: string; score: number } {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  if (ageHours < 12) {
    // Linear decay from 1.0 to 0.75 over 12 hours
    const score = 1.0 - (ageHours / 12) * 0.25;
    return { status: "fresh", score: Math.round(score * 100) / 100 };
  }
  if (ageHours < 48) {
    // Linear decay from 0.75 to 0.4 over 36 hours
    const score = 0.75 - ((ageHours - 12) / 36) * 0.35;
    return { status: "warm", score: Math.round(score * 100) / 100 };
  }
  if (ageHours < 168) {
    // Linear decay from 0.4 to 0.1 over 120 hours (5 days)
    const score = 0.4 - ((ageHours - 48) / 120) * 0.3;
    return { status: "cold", score: Math.round(Math.max(score, 0.1) * 100) / 100 };
  }
  return { status: "archived", score: 0 };
}
