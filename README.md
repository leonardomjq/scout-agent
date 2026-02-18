# ScoutAgent

[![CI](https://github.com/leonardomjq/scout-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/leonardomjq/scout-agent/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D10-orange)](https://pnpm.io/)

**Your AI venture analyst.** ScoutAgent reads thousands of developer conversations so you don't have to — and tells you exactly what to build next.

---

## The Problem

Every day, developers publicly share what they built that got users, what side projects are making money, and what tools are blowing up. These signals reveal exactly where real demand exists — but they're scattered across the internet, buried in noise, and gone within hours.

By the time you spot the pattern, someone else already shipped it.

## What ScoutAgent Does

ScoutAgent monitors developer conversations, filters out the noise, and spots when multiple builders are finding traction in the same space. It delivers **Alpha Cards** — actionable opportunity briefs that tell you where real demand is emerging and how to act on it within a 72-hour window.

Think of it as an always-on venture analyst that watches what developers are actually building and shipping, not what surveys predict.

---

## See It In Action

Here's an example Alpha Card that ScoutAgent generates:

> **K8s Exodus: Simplification Wave Creates Deploy-Tool Opportunity**
>
> **Momentum:** 72/100 (Rising)&ensp;&ensp;**Category:** Friction Opportunity&ensp;&ensp;**Signals:** 5
>
> **What's happening:** Multiple developers are shipping simpler deployment tools and getting massive traction — K8s-to-Compose converters gaining thousands of stars, deploy CLIs hitting $5k MRR, one-click migration tools signing up hundreds of users in week one.
>
> **The opportunity:** The deployment simplification space is heating up but no dominant player has emerged. Mid-size teams (10-50 engineers) who adopted K8s prematurely are actively looking for alternatives.
>
> **Blueprint:** A CLI tool that auto-converts Kubernetes YAML manifests into Docker Compose + Kamal configurations — scan, generate, migrate in one command.
>
> **Window:** 6-12 months before the market consolidates.

Each card comes with evidence trails, risk factors, a week-by-week MVP plan, and monetization suggestions.

---

## How It Works

```
  What developers are saying       ScoutAgent Pipeline              You get
 ┌──────────────────────────┐                                  ┌──────────────────┐
 │ "Built a K8s-to-Compose  │     ┌─────────┐  ┌─────────┐    │  Alpha Card:     │
 │  tool, 2K stars in 3d"   │────▶│ Extract │─▶│ Cluster │──┐ │  "K8s Exodus"    │
 │                           │     │ signals │  │ patterns│  │ │                  │
 │ "My deploy CLI just hit  │     └─────────┘  └─────────┘  │ │  + what's hot    │
 │  $5k MRR — teams hate    │────▶  AI reads     spots the  │ │  + opportunity   │
 │  managing K8s"            │      each post    trend       │ │  + blueprint     │
 │                           │                               │ │  + evidence      │
 │ "Launched a migration     │                  ┌─────────┐  │ │  + risk factors  │
 │  helper, 500 signups in   │────▶             │Strategize│◀┘ │  + MVP plan      │
 │  the first week"          │                  │  & write │───▶│  + window        │
 └──────────────────────────┘                   └─────────┘    └──────────────────┘
```

**Three steps, each with a specific job:**

| Step | What happens | How |
|------|-------------|-----|
| **1. Extract** | Reads posts, identifies who built what and how it's performing | AI (Claude Haiku) |
| **2. Cluster** | Spots when multiple builders are finding traction in the same space | Heuristics |
| **3. Strategize** | Synthesizes the pattern into an Alpha Card with thesis, opportunity, and blueprint | AI (Claude Sonnet) |

The pipeline saves progress after each step — if one step fails, the work from previous steps isn't lost.

<details>
<summary><strong>Architecture details (for contributors)</strong></summary>

The system is a **three-layer refinery pipeline**:

- **L1 Scrubber** — Batch-processes raw captures through Claude Haiku for structured signal extraction
- **L2 Pattern Matcher** — Spots when multiple builders are finding traction in the same space via entity overlap and momentum scoring
- **L3 Strategist** — Feeds qualifying clusters to Claude Sonnet to generate full Alpha Cards with blueprints

Data flows through an HMAC-SHA256 authenticated webhook, persists to Supabase after each layer, and Alpha Cards expire after 72 hours. See [CONTRIBUTING.md](./CONTRIBUTING.md) for architecture gotchas.

</details>

---

## Features

- **Signal Detection** — AI reads developer posts and extracts who built what and how it performed
- **Pattern Recognition** — Spots when multiple builders are finding traction in the same space
- **Alpha Cards** — Actionable opportunity briefs, refreshed every 72 hours
- **MVP Blueprints** — Each card includes a product concept, week-by-week build plan, and monetization model
- **Free & Pro Tiers** — Core access is free; Pro unlocks full strategy, blueprints, and evidence trails
- **Secure Ingest** — Webhook data pipeline with cryptographic verification
- **Stripe Billing** — Pro plan at $19/mo with full subscription management

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
