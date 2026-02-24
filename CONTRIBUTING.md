# Contributing to Scout Daily

Thanks for your interest in contributing! Here's everything you need to get started.

## Development setup

```bash
# Prerequisites: Node.js >= 22, pnpm >= 10

# Clone and install
git clone https://github.com/leonardomjq/scout-agent.git
cd scout-agent
pnpm install

# Start the dev server
pnpm dev
```

That's it — no database setup, no API keys needed for local development. The site renders from JSON files already in the `data/` directory.

### Running the pipeline locally

If you want to fetch fresh signals and generate new cards:

```bash
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

pnpm fetch        # Fetch signals → data/signals-raw.json
pnpm generate     # Generate cards → data/YYYY-MM-DD.json
pnpm daily        # Or run both steps at once
```

## Commands

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript type checking (`tsc --noEmit`) |
| `pnpm fetch` | Fetch signals from HN, Reddit, GitHub, Product Hunt |
| `pnpm generate` | Generate Alpha Cards from signals via Gemini Flash |
| `pnpm daily` | Run full pipeline (fetch → generate) |

## Branch naming

Use prefixed branch names:

- `feat/description` — new features
- `fix/description` — bug fixes
- `docs/description` — documentation changes
- `refactor/description` — code refactoring
- `test/description` — test additions or fixes
- `chore/description` — maintenance tasks

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add source badges to card grid
fix: handle empty signals array in clustering
docs: update quickstart instructions
refactor: extract countdown logic into hook
```

## Pull request process

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Make sure things still work:
   ```bash
   pnpm typecheck
   pnpm build
   ```
4. Open a PR against `main`
5. Maintainers aim to review within 72 hours

## Code style

- **File names:** `kebab-case.ts` — components are `PascalCase`, functions/variables are `camelCase`
- **Imports:** Use `@/` path alias exclusively (maps to project root). Use `import type` for type-only imports.
- **Components:** Server components by default. Add `"use client"` only when you need browser APIs or interactivity.
- **Types:** Import from `@/types`, not directly from schema files.
- **Styling:** Use design tokens from `globals.css` — never hardcode hex colors. Use `cn()` from `@/lib/utils` for class merging.
- **Animation:** Use presets from `lib/motion.ts` — don't inline raw Framer Motion objects.
- **Icons:** `lucide-react` only.

## Architecture notes

A few things to know before diving in:

- **Data lives in JSON files** — the `data/` directory contains daily card files (`YYYY-MM-DD.json`) and raw signals (`signals-raw.json`). No database.
- **Zod schemas are the source of truth** — defined in `schemas/card.ts`, types re-exported from `types/index.ts` via `z.infer<>`.
- **Everything is statically generated** except the `/api/subscribe` endpoint (email capture, writes to `data/subscribers.json` which is gitignored).
- **Dark theme is always on** — `class="dark"` on `<html>`. Colors use OKLCH color space, not hex.
- **Flat card system** — all cards render identically. Signal strength is displayed as data, not as visual hierarchy. No featured tier.
- **Card count is dynamic** — the pipeline publishes 1–12 cards per day depending on signal quality. Don't hardcode count assumptions in UI.

## Questions?

Open an [issue](https://github.com/leonardomjq/scout-agent/issues) or start a [discussion](https://github.com/leonardomjq/scout-agent/discussions).
