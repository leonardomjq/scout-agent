# Overheard

[![CI](https://github.com/leonardomjq/overheard/actions/workflows/ci.yml/badge.svg)](https://github.com/leonardomjq/overheard/actions/workflows/ci.yml)
[![Daily Cards](https://github.com/leonardomjq/overheard/actions/workflows/daily.yml/badge.svg)](https://github.com/leonardomjq/overheard/actions/workflows/daily.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D10-orange)](https://pnpm.io/)
[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=flat-square)](https://overheard.vercel.app)

**Spots what's blowing up across HN, Reddit, GitHub, and Product Hunt — and tells you what to build next.**

---

## What is this

Overheard is a free, open-source site that publishes AI-generated opportunity briefs ("Alpha Cards") every morning. It scans ~250 signals a day from four sources, clusters them by topic, and uses Gemini Flash to turn the interesting patterns into plain-English cards.

No account needed. No paywall. No "premium tier."

Built for vibe coders, aspiring founders, and anyone who wants to know what's trending before everyone else catches on.

![Overheard — Alpha Cards dashboard](./public/screenshot.png)

---

## Example card

> **The AI Coding Tool Backlash Has Begun**
>
> **Signal strength:** 8/10 &ensp; **Category:** ai-tools &ensp; **Signals:** 23
>
> People are getting fed up with AI coding tools that suggest outdated code and make stuff up. Hacker News and Reddit are full of developers saying they'd pay for a tool that actually knows the latest version of the framework they're using, instead of trying to do everything and doing it all badly.
>
> **Opportunity:** Everyone's complaining that Cursor hallucinates old APIs — but nobody's made a plug-in that just auto-updates the docs Cursor reads. First person to ship that owns the frustrated-developer market, and you could build it in a weekend with a scraper and a vector database.

Each card comes with evidence linking back to original posts, source attribution, and signal counts.

---

## How it works

```
  Hacker News ─┐
  Reddit ───────┤   Cluster     Generate        Deploy
  GitHub ───────┼─▶ & score ──▶ cards via ──▶ auto-deploy
  Product Hunt ─┘   signals     Gemini Flash    on Vercel
```

| Step | What happens |
|------|-------------|
| **1. Fetch** | Pulls posts from HN, Reddit, GitHub, and Product Hunt (last 48 hours) |
| **2. Cluster & score** | Groups signals by keyword overlap, ranks by engagement × source diversity |
| **3. Generate** | Gemini Flash writes each card in plain English with evidence and opportunities |
| **4. Deploy** | GitHub Actions commits the new data, Vercel auto-deploys the static site |

The pipeline runs daily at 8 AM UTC via GitHub Actions. It typically produces 3–10 cards per day depending on signal quality.

---

## Tech stack

| What | Tech |
|------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | Gemini 2.5 Flash (via `@google/generative-ai`) |
| Validation | Zod 4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Data | JSON files committed to the repo |
| Hosting | Vercel (free tier) |
| CI/CD | GitHub Actions |

No database. No auth. No payments. Total cost: **$0/month**.

---

## Quickstart

### Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fleonardomjq%2Foverheard&env=GEMINI_API_KEY&envDescription=Google%20AI%20Studio%20API%20key%20for%20card%20generation&envLink=https%3A%2F%2Faistudio.google.com%2Fapikey&project-name=overheard&repository-name=overheard)

### Local development

```bash
# Clone and install
git clone https://github.com/leonardomjq/overheard.git
cd overheard
pnpm install

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The site renders from the JSON data already in the `data/` directory — no API keys needed just to run it locally.

### Running the pipeline

To fetch fresh signals and generate new cards:

```bash
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

pnpm daily    # Runs fetch → generate in one command
```

Or run each step separately:

```bash
pnpm fetch      # Fetch signals → data/signals-raw.json
pnpm generate   # Generate cards → data/YYYY-MM-DD.json
```

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI Studio API key for card generation |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | No | Plausible Analytics domain |
| `NEXT_PUBLIC_APP_URL` | No | Site URL (defaults to Vercel URL) |

---

## Project structure

```
overheard/
├── app/                    # Next.js App Router pages
│   ├── about/              # About page
│   ├── api/subscribe/      # Email capture endpoint (only API route)
│   ├── card/[date]/[slug]/ # Card detail page
│   ├── edition/[date]/     # Past edition pages
│   ├── legal/              # Legal page
│   ├── globals.css         # Design tokens (OKLCH, dark theme)
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home (latest edition)
├── components/             # React components
│   ├── ui/                 # Design system primitives (Badge, Button, Card, Input)
│   ├── alpha-card.tsx      # Card component
│   ├── card-detail.tsx     # Full card view with evidence
│   ├── card-grid.tsx       # Animated card list
│   ├── sidebar.tsx         # Dashboard sidebar
│   └── ...                 # Header, footer, date nav, countdown, email signup
├── data/                   # Daily card JSON (committed to repo)
│   ├── YYYY-MM-DD.json     # One file per edition
│   └── signals-raw.json    # Raw signals (overwritten each run)
├── lib/                    # Utilities
│   ├── data.ts             # Data access layer
│   ├── motion.ts           # Framer Motion presets
│   └── utils.ts            # cn() for Tailwind class merging
├── schemas/                # Zod schemas (single source of truth)
│   └── card.ts
├── scripts/                # Daily pipeline
│   ├── daily.ts            # Orchestrator (fetch → generate)
│   ├── fetch-signals.ts    # Fetches HN, Reddit, GitHub, Product Hunt
│   └── generate-cards.ts   # Clusters signals, generates cards via Gemini
├── types/                  # TypeScript types (re-exported from schemas)
│   └── index.ts
└── .github/workflows/
    ├── ci.yml              # CI checks
    └── daily.yml           # Daily cron (8 AM UTC)
```

---

## Daily pipeline

Every day at 8 AM UTC, a GitHub Actions workflow:

1. Runs `pnpm fetch` — pulls signals from HN (Algolia API), Reddit (JSON endpoints), GitHub (Search API), and Product Hunt (Atom feed)
2. Runs `pnpm generate` — clusters signals by keyword overlap, scores by engagement × source diversity, generates up to 12 cards via Gemini Flash
3. Commits the new `data/YYYY-MM-DD.json` to the repo
4. Vercel auto-deploys the updated site

The pipeline is designed to run unattended. If any step fails, previous data is preserved — the site always has something to show.

---

## Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm typecheck    # TypeScript type checking
pnpm fetch        # Fetch signals from all 4 sources
pnpm generate     # Generate Alpha Cards from signals
pnpm daily        # Run full pipeline (fetch → generate)
```

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions and guidelines.

## Support

If Overheard is useful to you, **[star this repo](https://github.com/leonardomjq/overheard)** — it helps others find it.

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-ff5e5b?logo=ko-fi&logoColor=white)](https://ko-fi.com/leonardomjq)

## Security

Found a vulnerability? See [SECURITY.md](./SECURITY.md) for how to report it.

## License

[MIT](./LICENSE) — Copyright (c) 2025-present Leonardo Jaques
