# Contributing to ScoutAgent

Thanks for your interest in contributing! This guide will help you get started.

## Development Setup

```bash
# Prerequisites: Node.js >= 22, pnpm >= 10

# Clone and install
git clone https://github.com/leonardomjq/scout-agent.git
cd scout-agent
pnpm install

# Set up environment
cp .env.example .env.local
# Fill in your keys (see .env.example for details)

# Set up Appwrite database (collections, attributes, indexes)
npx tsx scripts/setup-appwrite.ts

# Start dev server
pnpm dev
```

## Branch Naming

Use prefixed branch names:

- `feat/description` — new features
- `fix/description` — bug fixes
- `docs/description` — documentation changes
- `refactor/description` — code refactoring
- `test/description` — test additions or fixes
- `chore/description` — maintenance tasks

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add demand signals to alpha cards
fix: correct HMAC timestamp validation window
docs: update env variable table in README
test: add pattern matcher edge case coverage
```

## Pull Request Process

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Ensure all checks pass:
   ```bash
   pnpm typecheck
   pnpm test
   pnpm build
   ```
4. Open a PR against `main` using the PR template
5. Wait for review — maintainers aim to review within 72 hours

## Testing Requirements

- New features should include unit tests
- Bug fixes should include a regression test
- Run the full suite before submitting:
  ```bash
  pnpm test          # Unit tests (Vitest)
  pnpm test:e2e      # E2E tests (Playwright)
  ```

## Code Style

- TypeScript strict mode is enabled
- Zod schemas in `schemas/` are the single source of truth for types
- Types in `types/index.ts` are re-exported via `z.infer<>`
- Use `@/*` path aliases for imports

## Architecture Notes

- **Anthropic client** must be lazy-initialized (not top-level) to support test environments
- **Appwrite JSON fields** are stored as strings — use `toJsonString()`/`fromJsonString()` helpers from `lib/appwrite/helpers.ts`
- **Tier gating** uses `gateAlphaCard()` from `lib/refinery/gate.ts` — keep it DRY across API routes and server components
- The pipeline persists state after each layer — partial success is expected

## Questions?

Open a [discussion](https://github.com/leonardomjq/scout-agent/discussions) or reach out in an issue.
