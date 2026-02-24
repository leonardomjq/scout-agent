# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-22

### Changed

- Complete pivot from SaaS to free, open-source static site
- Replaced Anthropic Claude with Gemini 2.5 Flash for card generation
- Replaced Appwrite database with JSON files committed to the repo
- Rewrote all components for new flat card design (cool-dark + slate-blue palette)
- New voice targeting vibe coders and aspiring founders

### Added

- Daily cron pipeline via GitHub Actions (fetch → generate → commit → deploy)
- Signal fetching from 4 sources: Hacker News, Reddit, GitHub, Product Hunt
- Keyword-overlap clustering with engagement × source diversity scoring
- Edition pages with date navigation
- Sidebar with countdown, source attribution, and email signup
- SEO infrastructure (meta tags, Open Graph, sitemap)
- About and legal pages

### Removed

- Appwrite Cloud (database, auth, server clients)
- Stripe billing (checkout, webhooks, pro/free tiers)
- Anthropic Claude (Haiku + Sonnet)
- Three-layer refinery pipeline (Scrubber, Pattern Matcher, Strategist)
- HMAC-SHA256 webhook authentication
- Tier-gated card access
- Dashboard, settings, and auth pages
- SWR data fetching
- Playwright E2E tests

## [1.0.0] - 2025-02-18

### Added

- Three-layer AI refinery pipeline (Scrubber, Pattern Matcher, Strategist)
- Alpha Card generation with 72-hour TTL
- Tier-gated access (free / pro) with Stripe billing
- HMAC-SHA256 authenticated ingest webhook
- Dashboard with signal feed, detail views, and settings
- Appwrite Cloud persistence and auth
- Playwright E2E and Vitest unit test suites
