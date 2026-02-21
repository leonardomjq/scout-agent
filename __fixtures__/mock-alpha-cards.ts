/**
 * Dev-only mock Alpha Cards with varied ages to showcase:
 * - Recency indicators (all cards show detection time)
 * - Progressive banner copy (8+ cards triggers strongest copy)
 * - Banner CTA button (free tier)
 *
 * Usage: imported by /api/alphas in development when DB returns no cards.
 */

import type { AlphaCard } from "@/types";

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

export const MOCK_ALPHA_CARDS: AlphaCard[] = [
  // ── FRESH (6h ago) ──
  {
    id: "mock-001",
    created_at: hoursAgo(6),
    cluster_id: "cluster-mock-001",
    title: "Solo founders mass-migrating from Stripe Billing to Lemon Squeezy — 63% spike in complaints about tax compliance",
    category: "friction_cluster",
    entities: ["Stripe Billing", "Lemon Squeezy", "Merchant of Record", "Tax Compliance"],
    signal_strength: 0.89,
    direction: "accelerating",
    signal_count: 47,
    thesis:
      "A rapidly growing cluster of solo founders across HN and Twitter are voicing frustration with Stripe's tax compliance burden — especially around EU VAT, state sales tax, and 1099 reporting. Lemon Squeezy is absorbing demand, but founders report feature gaps in analytics and webhook reliability. There's a clear window for a merchant-of-record tool that combines Stripe's power with hands-off tax compliance.",
    status: "fresh",
    freshness_score: 0.96,
    friction_detail: null,
    gap_analysis: null,
    timing_signal: null,
    risk_factors: null,
    evidence: [
      {
        tweet_id: "mock-ev-001a",
        author: "marcosemail",
        snippet: "Just spent 3 hours configuring Stripe Tax for my SaaS. Still not sure it covers all EU countries. Seriously considering switching to LemonSqueezy just for the tax peace of mind.",
        relevance: 0.94,
      },
      {
        tweet_id: "mock-ev-001b",
        author: "indiehacker_kat",
        snippet: "Anyone else getting wrecked by state sales tax nexus rules? I have customers in 12 states and Stripe basically said 'figure it out yourself'. This is a full-time job.",
        relevance: 0.91,
      },
    ],
    competitive_landscape: null,
    opportunity_type: null,
    mvp_scope: null,
    monetization_angle: null,
    target_buyer: null,
    distribution_channels: null,
  },

  // ── WARM (28h ago) ──
  {
    id: "mock-002",
    created_at: hoursAgo(28),
    cluster_id: "cluster-mock-002",
    title: "AI-native CRM for solo founders — new emergence across Reddit, HN, and Indie Hackers",
    category: "new_emergence",
    entities: ["CRM", "AI Agents", "Solo Founders", "Follow-up Automation"],
    signal_strength: 0.81,
    direction: "new",
    signal_count: 34,
    thesis:
      "Multiple threads across builder communities point to unmet demand for a CRM built from the ground up with AI — not bolted on. Solo founders want something that does the follow-up work, not just tracks it. Current AI CRM tools (Clay, Attio) target sales teams, leaving a gap for one-person businesses who need automated relationship nurturing without the enterprise complexity.",
    status: "warm",
    freshness_score: 0.72,
    friction_detail: null,
    gap_analysis: null,
    timing_signal: null,
    risk_factors: null,
    evidence: [
      {
        tweet_id: "mock-ev-002a",
        author: "shipfast_dan",
        snippet: "I don't need a CRM with 50 pipeline stages. I need something that reads my emails, reminds me who to follow up with, and drafts the message. That's it. Why doesn't this exist?",
        relevance: 0.93,
      },
    ],
    competitive_landscape: null,
    opportunity_type: null,
    mvp_scope: null,
    monetization_angle: null,
    target_buyer: null,
    distribution_channels: null,
  },

  // ── COLD (56h ago) ──
  {
    id: "mock-003",
    created_at: hoursAgo(56),
    cluster_id: "cluster-mock-003",
    title: "Notion API users frustrated with 3-second rate limits — 41% demand spike for real-time alternatives",
    category: "friction_cluster",
    entities: ["Notion API", "Real-time Sync", "Productivity Tools", "Coda"],
    signal_strength: 0.77,
    direction: "accelerating",
    signal_count: 29,
    thesis:
      "Builders using Notion as a backend are hitting a wall with rate limits and sync latency. The 3-request-per-second API cap makes real-time dashboards impossible. GitHub issues and HN threads show growing frustration, with some migrating to Coda or building custom sync layers. A lightweight Notion-compatible database with real-time capabilities could capture this demand.",
    status: "cold",
    freshness_score: 0.31,
    friction_detail: null,
    gap_analysis: null,
    timing_signal: null,
    risk_factors: null,
    evidence: [
      {
        tweet_id: "mock-ev-003a",
        author: "api_frustrated",
        snippet: "My Notion integration just got rate limited AGAIN. I'm syncing 200 records and it takes 4 minutes. This is unusable for anything real-time. Thinking about building my own sync layer.",
        relevance: 0.89,
      },
    ],
    competitive_landscape: null,
    opportunity_type: null,
    mvp_scope: null,
    monetization_angle: null,
    target_buyer: null,
    distribution_channels: null,
  },

  // ── WARM (36h ago) ──
  {
    id: "mock-004",
    created_at: hoursAgo(36),
    cluster_id: "cluster-mock-004",
    title: "Massive sentiment flip on Vercel pricing — founders seeking self-hosted Next.js deployment",
    category: "sentiment_flip",
    entities: ["Vercel", "Next.js", "Coolify", "Self-hosting", "Docker"],
    signal_strength: 0.85,
    direction: "accelerating",
    signal_count: 52,
    thesis:
      "A sentiment shift is underway: builders who previously championed Vercel are publicly criticizing bandwidth costs and vendor lock-in after hitting scale. Coolify and SST are gaining mindshare as alternatives, but neither offers a one-click Next.js deployment experience comparable to Vercel. The gap is a turnkey self-hosted platform that makes deploying Next.js as easy as git push — without the $20/seat/month price tag.",
    status: "warm",
    freshness_score: 0.58,
    friction_detail: null,
    gap_analysis: null,
    timing_signal: null,
    risk_factors: null,
    evidence: [
      {
        tweet_id: "mock-ev-004a",
        author: "fullstack_mike",
        snippet: "My Vercel bill went from $20 to $340 this month because of bandwidth. For a blog. With moderate traffic. Something is seriously wrong with this pricing model.",
        relevance: 0.95,
      },
      {
        tweet_id: "mock-ev-004b",
        author: "cloudnative_sara",
        snippet: "Just moved my Next.js app to Coolify. Took 6 hours of Docker debugging. Vercel deploys in 30 seconds. We need a middle ground.",
        relevance: 0.88,
      },
    ],
    competitive_landscape: null,
    opportunity_type: null,
    mvp_scope: null,
    monetization_angle: null,
    target_buyer: null,
    distribution_channels: null,
  },

  // ── FRESH (3h ago) ──
  {
    id: "mock-005",
    created_at: hoursAgo(3),
    cluster_id: "cluster-mock-005",
    title: "Exploding demand for AI-powered invoice processing — freelancers drowning in receipt management",
    category: "velocity_spike",
    entities: ["Invoice OCR", "Freelancer Tools", "Bookkeeping", "QuickBooks"],
    signal_strength: 0.73,
    direction: "accelerating",
    signal_count: 23,
    thesis:
      "Freelancers and micro-agencies are posting with increasing frequency about the pain of manual invoice entry. QuickBooks' OCR is described as 'barely functional' and Wave is being sunset for some regions. There's a window for an AI-first tool that photographs receipts, auto-categorizes expenses, and pushes clean data to accounting software — aimed at the solo operator, not the enterprise.",
    status: "fresh",
    freshness_score: 0.98,
    friction_detail: null,
    gap_analysis: null,
    timing_signal: null,
    risk_factors: null,
    evidence: [
      {
        tweet_id: "mock-ev-005a",
        author: "freelance_jenny",
        snippet: "I just spent my entire Sunday entering 47 receipts into QuickBooks. The OCR got maybe 10 right. It's 2026, why is this still manual?",
        relevance: 0.92,
      },
    ],
    competitive_landscape: null,
    opportunity_type: null,
    mvp_scope: null,
    monetization_angle: null,
    target_buyer: null,
    distribution_channels: null,
  },

  // ── WARM (26h ago) ──
  {
    id: "mock-006",
    created_at: hoursAgo(26),
    cluster_id: "cluster-mock-006",
    title: "GitHub Copilot users switching to Cursor in droves — 58% increase in 'Copilot alternative' searches",
    category: "velocity_spike",
    entities: ["GitHub Copilot", "Cursor", "AI Code Editor", "VS Code"],
    signal_strength: 0.91,
    direction: "accelerating",
    signal_count: 68,
    thesis:
      "A significant velocity spike in conversations about switching from GitHub Copilot to Cursor, driven by Cursor's multi-file editing and codebase-aware context. However, both tools struggle with non-mainstream languages and framework-specific patterns. Builders are asking for AI coding tools that deeply understand their specific stack — not general-purpose autocomplete. The opportunity is vertical AI dev tools for specific frameworks (Rails, Laravel, Next.js).",
    status: "warm",
    freshness_score: 0.68,
    friction_detail: null,
    gap_analysis: null,
    timing_signal: null,
    risk_factors: null,
    evidence: [
      {
        tweet_id: "mock-ev-006a",
        author: "devtools_nerd",
        snippet: "Switched from Copilot to Cursor last week. The multi-file context is genuinely better. But both still hallucinate Rails conventions. Wish someone would build an AI tool that actually understands my framework.",
        relevance: 0.90,
      },
      {
        tweet_id: "mock-ev-006b",
        author: "ruby_builder",
        snippet: "Just asked Cursor to write a Rails service object and it generated a class that inherits from ApplicationController. We need framework-aware AI, not generic LLM wrappers.",
        relevance: 0.87,
      },
    ],
    competitive_landscape: null,
    opportunity_type: null,
    mvp_scope: null,
    monetization_angle: null,
    target_buyer: null,
    distribution_channels: null,
  },

  // ── WARM (40h ago) ──
  {
    id: "mock-007",
    created_at: hoursAgo(40),
    cluster_id: "cluster-mock-007",
    title: "Zapier pricing revolt — no-code founders seeking open-source automation alternatives",
    category: "sentiment_flip",
    entities: ["Zapier", "n8n", "Make.com", "Workflow Automation", "No-Code"],
    signal_strength: 0.78,
    direction: "accelerating",
    signal_count: 41,
    thesis:
      "Zapier's latest pricing changes — cutting free tier tasks from 100 to 50 and raising paid tiers — have triggered a vocal backlash. No-code founders are exploring n8n (self-hosted) and Make.com but report steep learning curves. The gap: a hosted automation platform with Zapier-level simplicity but transparent, usage-based pricing that doesn't punish growth. Founders specifically want better error handling and the ability to debug failed runs without a CS degree.",
    status: "warm",
    freshness_score: 0.45,
    friction_detail: null,
    gap_analysis: null,
    timing_signal: null,
    risk_factors: null,
    evidence: [
      {
        tweet_id: "mock-ev-007a",
        author: "nocode_founder",
        snippet: "Zapier just raised my bill from $49 to $129/mo for the same workflows. Make.com is cheaper but the UI makes me want to cry. Where's the middle ground?",
        relevance: 0.93,
      },
    ],
    competitive_landscape: null,
    opportunity_type: null,
    mvp_scope: null,
    monetization_angle: null,
    target_buyer: null,
    distribution_channels: null,
  },

  // ── COLD (60h ago) ──
  {
    id: "mock-008",
    created_at: hoursAgo(60),
    cluster_id: "cluster-mock-008",
    title: "Indie SaaS founders begging for usage-based billing infrastructure — Stripe metering described as 'nightmare'",
    category: "friction_cluster",
    entities: ["Usage-Based Billing", "Stripe Metering", "Orb", "Lago", "SaaS Pricing"],
    signal_strength: 0.84,
    direction: "accelerating",
    signal_count: 37,
    thesis:
      "Founders building AI-powered SaaS products need usage-based billing (per API call, per token, per generation) but find Stripe's metering API overly complex for small teams. Enterprise solutions like Orb ($500/mo+) and Lago (self-hosted, complex) leave indie builders underserved. Multiple threads show founders building custom billing code that takes weeks. A lightweight usage-based billing layer that sits on top of Stripe — with a simple SDK and dashboard — could capture significant demand in the AI SaaS space.",
    status: "cold",
    freshness_score: 0.18,
    friction_detail: null,
    gap_analysis: null,
    timing_signal: null,
    risk_factors: null,
    evidence: [
      {
        tweet_id: "mock-ev-008a",
        author: "ai_saas_builder",
        snippet: "I've spent 3 weeks building usage-based billing with Stripe metering. It's still broken. Why is billing for AI products this hard? All I want is 'charge $0.01 per API call' and a nice dashboard.",
        relevance: 0.96,
      },
      {
        tweet_id: "mock-ev-008b",
        author: "stripe_dev_pain",
        snippet: "Looked at Orb for usage billing. $500/mo minimum. I have 12 customers. Guess I'm writing custom code again.",
        relevance: 0.91,
      },
    ],
    competitive_landscape: null,
    opportunity_type: null,
    mvp_scope: null,
    monetization_angle: null,
    target_buyer: null,
    distribution_channels: null,
  },
];
