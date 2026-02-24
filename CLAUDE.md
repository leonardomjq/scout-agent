# Scout Daily

Free, open-source site that publishes AI-generated opportunity briefs ("Alpha Cards") every morning, synthesized from signals across Hacker News, Reddit, GitHub, and Product Hunt.

## Commands

```bash
pnpm dev              # Start dev server (Turbopack)
pnpm build            # Production build
pnpm typecheck        # TypeScript type checking (tsc --noEmit)
pnpm fetch            # Fetch signals from all 4 sources → data/signals-raw.json
pnpm generate         # Generate Alpha Cards from signals → data/YYYY-MM-DD.json
pnpm daily            # Run full pipeline (fetch → generate)
```

When done making changes, run `pnpm typecheck` to verify.

## Architecture

Static site with a daily cron pipeline. No database, no auth, no payments. One API route (`/api/subscribe`) for email capture.

- **Data source:** JSON files in `data/` directory, committed to the repo
- **Generation:** Daily GitHub Actions cron (8 AM UTC) runs `scripts/daily.ts` → fetches signals → generates cards via Gemini Flash → commits JSON → Vercel auto-deploys
- **Rendering:** All pages are statically generated at build time from the JSON data

### Key directories

- `scripts/` — Daily pipeline (`fetch-signals.ts`, `generate-cards.ts`, `daily.ts`)
- `data/` — Daily card JSON files (`YYYY-MM-DD.json`) and raw signals (`signals-raw.json`)
- `schemas/card.ts` — Zod schemas (single source of truth for data shapes)
- `types/index.ts` — Re-exports `z.infer<>` types. Import types from `@/types`, not from schema files.
- `lib/data.ts` — Data access layer (`getAllDates`, `getDailyData`, `getLatestData`, `getCardById`, `getAllCards`, `getAdjacentDates`)
- `lib/motion.ts` — Framer Motion animation presets
- `lib/utils.ts` — `cn()` utility for Tailwind class merging
- `components/` — Page components (`alpha-card.tsx`, `card-detail.tsx`, `card-grid.tsx`, `sidebar.tsx`, `date-nav.tsx`, `next-edition-countdown.tsx`, `email-signup.tsx`, `site-header.tsx`, `site-footer.tsx`)
- `components/ui/` — Design system primitives (Button, Card, Badge, Input)
- `app/` — Next.js App Router pages (home, edition/[date], card detail, about, legal)
- `app/api/subscribe/` — Email capture endpoint (POST, stores to `data/subscribers.json`)

## Daily Pipeline

Three-step flow orchestrated by `scripts/daily.ts`:

1. **Fetch** (`scripts/fetch-signals.ts`) — Pulls signals from 4 public sources via their APIs/feeds:
   - Hacker News (Algolia API — front page, Ask HN, Show HN, last 48h)
   - Reddit (JSON endpoints — r/SaaS, r/startups, r/Entrepreneur, r/smallbusiness)
   - GitHub (Search API — repos created in last 48h, sorted by stars)
   - Product Hunt (Atom feed — daily launches)
   - Output: `data/signals-raw.json`

2. **Generate** (`scripts/generate-cards.ts`) — Clusters signals by keyword overlap (2+ shared keywords), scores clusters by `totalEngagement × sourceDiversityMultiplier`, takes up to 12 top-scoring clusters, synthesizes each into an Alpha Card via Gemini 2.5 Flash.
   - Output: `data/YYYY-MM-DD.json`

3. **Deploy** — GitHub Actions commits the new JSON, pushes to main, Vercel auto-deploys.

## Data Format

### AlphaCard
```ts
{
  id: string;           // "2026-02-22-ai-coding-tools"
  date: string;         // "2026-02-22"
  title: string;
  category: string;     // "developer-tools", "saas", "ai-ml", etc.
  thesis: string;
  signal_strength: number; // 1-10
  evidence: Evidence[];
  opportunity: string;
  sources: string[];    // ["hackernews", "reddit"]
  signal_count: number;
}
```

### Evidence
```ts
{
  text: string;
  source: "hackernews" | "reddit" | "github" | "producthunt";
  url?: string;
  engagement: number;
}
```

### DailyData
```ts
{
  date: string;
  generated_at: string;
  cards: AlphaCard[];
}
```

Schemas defined in `schemas/card.ts`, types re-exported from `types/index.ts`.

## Voice & Messaging

The full voice and content guide lives in `.claude/product-marketing-context.md`. Summary:

**Audience:** Solo founders, indie hackers, and AI-native builders who ship products.

**Voice:** Transparent, grounded, quietly useful. Let evidence speak. No sales language for a free product.

**Key rules:**
- Use "Scout Daily" as subject, not "we"
- State honest metrics (~250 signals/day, 4 sources, typically 3-10 cards)
- Always attribute AI generation
- Link evidence to original sources
- No urgency framing, no FOMO, no exclusivity language

**Words to use:** opportunity, signals, evidence, builders, daily, free, open source, sign up, get briefs by email
**Words to avoid:** exclusive, limited, upgrade, subscribe (in marketing copy), intelligence, curated, "we"

## Code style

- File names: `kebab-case.ts`. Components: `PascalCase`. Functions/variables: `camelCase`.
- Imports use `@/` path alias exclusively (maps to project root).
- Use `import type` for type-only imports.
- Server components by default. Add `"use client"` only when needed.
- Named exports for everything except page components (default export).
- Always use design tokens from `globals.css` — never hardcode hex colors.
- Use `cn()` from `@/lib/utils` for Tailwind class merging.
- Animation presets from `lib/motion.ts` — never inline raw Framer Motion objects.
- Icons from `lucide-react` only.
- Reference `DESIGN_SYSTEM.md` for color palette, typography, spacing, and component patterns.

## Environment

Copy `.env.example` to `.env.local`. Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI Studio API key for card generation |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | No | Plausible Analytics domain |
| `NEXT_PUBLIC_APP_URL` | No | Site URL (defaults to Vercel URL) |

## Things that will bite you

- **Zod v4** is installed. API is largely compatible with v3 syntax for schemas used here, but check `zod` docs if adding new schema features.
- **Dark theme is always on** (`class="dark"` on `<html>`). Design tokens defined via CSS `@theme` in `globals.css`, not a Tailwind config file.
- **Colors use OKLCH color space** — not hex. The cool-dark palette uses `oklch(L C H)` with hue 270 for neutrals and hue 240 for the slate-blue accent. Never hardcode hex colors.
- **Slate-blue accent, not amber/green** — the primary accent is a muted slate-blue (`--color-accent`). The old `accent-green` and `accent-blue` tokens map to the primary accent for backward compatibility. No amber or green as primary accent.
- **Flat card system** — all cards render identically regardless of `signal_strength`. Signal strength is displayed as data (number + bar), not as visual hierarchy. No featured tier, no gradients, no sorting by strength.
- **Signal ramp is single-hue** — `signal-high`, `signal-medium`, `signal-low` are all slate-blue at different luminance. Not a traffic-light system.
- **HN Algolia API timestamp filter:** Without `numericFilters=created_at_i>`, Ask HN and Show HN return all-time top posts instead of recent ones. Always filter to last 48 hours.
- **GitHub Search API rate limit:** 10 requests/minute without auth. The fetch script uses 1-second delays between requests.
- **Reddit requires a User-Agent header.** Requests without one get 429'd. The fetch script sets `ScoutAgent-Experiment/1.0`.
- **Product Hunt Atom feed HTML entities:** Content contains encoded HTML (`&amp;`, `&lt;`, etc.) that must be decoded before stripping tags.
- **Gemini free tier rate limit:** 10 requests per minute (Gemini 2.5 Flash). The generate script uses 5-second delays between card generation calls.
- **Data files are committed to the repo.** The `data/` directory contains both `signals-raw.json` (transient, overwritten each run) and `YYYY-MM-DD.json` (permanent daily snapshots).
- **`data/subscribers.json` is gitignored.** Unlike card data, subscriber emails are private and must not be committed.
- **The `/api/subscribe` route is the only server-side endpoint.** Everything else is statically generated. This route writes to `data/subscribers.json` on the server filesystem.
- **Card count is dynamic.** The pipeline publishes 1-12 cards per day depending on signal quality. Clusters are scored by `totalEngagement × sourceDiversityMultiplier` (cross-platform signals rank higher). Do NOT hardcode card count assumptions in UI or copy.
