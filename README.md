# ScoutAgent

[![CI](https://github.com/leonardomjq/scout-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/leonardomjq/scout-agent/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D10-orange)](https://pnpm.io/)

**Venture intelligence platform** — transforms developer discourse into structured market opportunities via a 3-layer AI refinery pipeline.

ScoutAgent monitors developer conversations, extracts emerging signals, clusters them into patterns, and synthesizes actionable **Alpha Cards** that highlight what to build next.

---

## How It Works

Raw developer discourse flows through a three-layer refinery:

```
  Ingest Webhook          L1 Scrubber           L2 Pattern Matcher       L3 Strategist
 ┌─────────────┐    ┌──────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
 │  Raw Capture │───▶│  Signal Extraction│───▶│  Pattern Clustering  │───▶│  Alpha Card     │
 │  (HMAC auth) │    │  (Claude Haiku)   │    │  (Heuristics)        │    │  (Claude Sonnet) │
 └─────────────┘    └──────────────────┘    └──────────────────────┘    └─────────────────┘
```

| Layer | Name | Model | What It Does |
|-------|------|-------|-------------|
| L1 | **Scrubber** | Claude Haiku | Extracts structured signals from raw developer posts |
| L2 | **Pattern Matcher** | Heuristics | Clusters related signals into emerging patterns |
| L3 | **Strategist** | Claude Sonnet | Synthesizes patterns into actionable Alpha Cards |

The pipeline persists state after each layer — partial success is by design.

---

## Features

- **Signal Detection** — AI-powered extraction of market signals from developer conversations
- **Pattern Clustering** — Automatic grouping of related signals into trends
- **Alpha Cards** — Actionable opportunity cards with 72-hour TTL
- **Blueprints** — Startup-in-a-box plans attached to each Alpha (roadmapped)
- **Tier Gating** — Free / Pro access with server-side field nullification
- **Webhook Ingest** — HMAC-SHA256 + timestamp + nonce verified data ingestion
- **Stripe Billing** — Pro plan subscription at $19/mo

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (Postgres + Auth) |
| AI | Anthropic Claude (Haiku + Sonnet) |
| Payments | Stripe |
| Validation | Zod 4 |
| Animation | Framer Motion |
| Data Fetching | SWR |
| Testing | Vitest + Testing Library + Playwright |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [pnpm](https://pnpm.io/) >= 10
- [Supabase](https://supabase.com/) project
- [Anthropic](https://console.anthropic.com/) API key
- [Stripe](https://stripe.com/) account (for billing features)

### Install

```bash
git clone https://github.com/leonardomjq/scout-agent.git
cd scout-agent
pnpm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

Fill in your keys — see the [Environment Variables](#environment-variables) table below.

### Database Migration

```bash
pnpm dlx supabase db push
```

### Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `STRIPE_PRO_PRICE_ID` | Yes | Stripe price ID for Pro plan |
| `INGEST_HMAC_SECRET` | Yes | HMAC-SHA256 secret for webhook verification |
| `PIPELINE_BEARER_TOKEN` | Yes | Bearer token for pipeline trigger |
| `NEXT_PUBLIC_APP_URL` | Yes | Application URL (e.g. `http://localhost:3000`) |

---

## Project Structure

```
scout-agent/
├── app/
│   ├── (auth)/              # Login / signup pages
│   ├── (dashboard)/         # Dashboard, alpha detail, settings
│   ├── api/
│   │   ├── alphas/          # Alpha card CRUD endpoints
│   │   ├── ingest/          # HMAC-authenticated webhook
│   │   ├── refine/          # Pipeline trigger endpoint
│   │   └── stripe/          # Checkout + webhook
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx             # Landing page
├── components/              # React components
├── lib/
│   ├── ai.ts                # Anthropic client + extractStructured<T>()
│   ├── ingest/              # Webhook verification
│   ├── refinery/            # Pipeline, scrubber, pattern matcher, strategist, gate
│   ├── stripe/              # Stripe client + helpers
│   └── supabase/            # Supabase clients (browser, server, admin)
├── schemas/                 # Zod schemas (single source of truth)
├── types/                   # TypeScript types (z.infer<> re-exports)
├── supabase/migrations/     # Database migrations
├── e2e/                     # Playwright E2E tests
└── __fixtures__/            # Test fixtures
```

---

## Testing

```bash
# Unit tests
pnpm test

# Unit tests in watch mode
pnpm test:watch

# Type checking
pnpm typecheck

# E2E tests
pnpm test:e2e

# Run everything (what CI runs)
pnpm typecheck && pnpm test && pnpm build
```

---

## Deployment

ScoutAgent is designed to deploy on [Vercel](https://vercel.com/):

1. Connect your GitHub repo to Vercel
2. Set all environment variables in the Vercel dashboard
3. Deploy — Vercel auto-detects Next.js

---

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for planned features including Blueprints, Demand Signals, Competitor Scanning, and more.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, branch naming, and PR guidelines.

## Security

See [SECURITY.md](./SECURITY.md) for reporting vulnerabilities.

## License

[MIT](./LICENSE) — Copyright (c) 2025-present Leonardo Jaques
