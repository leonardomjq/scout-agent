# Scout Daily — Roadmap

Ideas for making the daily cards more useful. Roughly ordered by impact and effort.

---

## 1. Weekly Digest Email ← NEXT
**Impact: High | Effort: Low**

Monday morning email with the strongest cards from the past week. Short, scannable, links back to the site. Good for retention and sharing.

Needs: email service integration (Resend or Postmark), cron job, unsubscribe handling.

---

## 2. More Signal Sources
**Impact: High | Effort: Medium**

Add sources beyond the current four:
- **Indie Hackers** — revenue milestones, product launches
- **Twitter/X** — "I wish there was...", "just launched...", developer chatter
- **App stores** — trending apps, new categories
- **Stack Overflow** — questions spiking in volume (signals emerging tooling needs)

Each new source improves cluster quality and cross-platform scoring.

---

## 3. Demand Signals — "Someone is literally asking for this"
**Impact: High | Effort: Medium**

Surface posts where people explicitly ask for a tool:
- "Is there a tool that...", "I wish there was...", "I'd pay for..."
- Attach as evidence to relevant cards
- Quantify: "47 people publicly asked for this in the last 48 hours"

Needs: new keyword patterns in the fetch step, new `demand_signals` field on cards.

---

## 4. Competitor Quick-Scan
**Impact: Medium | Effort: Medium**

Auto-answer "who's already doing this?" for each card:
- Scan Product Hunt launches, GitHub trending, app store listings
- Show: name, launch date, traction, pricing
- Flag gaps: "3 tools exist but none handle X"

---

## 5. RSS Feed
**Impact: Medium | Effort: Low**

Publish an RSS/Atom feed of daily editions so people can follow via their reader of choice. Straightforward to generate from the existing JSON data at build time.

---

## 6. Card Categories & Filtering
**Impact: Medium | Effort: Low**

Let visitors filter cards by category (ai-tools, making-money, side-projects, etc.) on the home page. Categories already exist in the data — just needs a UI filter.

---

## 7. "I'm Building This" Social Proof
**Impact: Medium | Effort: Hard**

Long-term flywheel:
- Visitors flag "I'm pursuing this opportunity"
- Track cards that lead to real launches
- Surface success stories on the site

Needs: some form of lightweight user identity (GitHub OAuth?) and moderation.

---

## Priority Order

`1 → 5 → 6 → 2 → 3 → 4 → 7`

Digest email and RSS are shippable in days. Category filtering is low-hanging fruit. New sources and demand signals follow as the pipeline stabilizes. Competitor scanning and social proof are the longer play.
