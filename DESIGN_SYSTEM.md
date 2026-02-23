# Scout Daily Design System

Cool dark aesthetic with slate-blue accent. OKLCH color space, flat card system, sidebar layout. Content-first reading experience for builders.

---

## 1. Color Palette

All colors are OKLCH values defined as CSS custom properties in `app/globals.css` via `@theme`.

### Backgrounds — warm-shifted dark neutrals
| Token | OKLCH | Usage |
|-------|-------|-------|
| `bg` | `oklch(0.13 0.006 270)` | Page background |
| `surface` | `oklch(0.18 0.006 270)` | Cards, panels |
| `surface-elevated` | `oklch(0.22 0.008 270)` | Raised elements (badges) |
| `surface-inset` | `oklch(0.11 0.005 270)` | Recessed areas (signal bar tracks, opportunity panel) |

### Borders
| Token | OKLCH | Usage |
|-------|-------|-------|
| `border` | `oklch(0.28 0.006 270)` | Default borders |
| `border-strong` | `oklch(0.38 0.008 270)` | Hover state borders |

### Text — neutral white
| Token | OKLCH | Usage |
|-------|-------|-------|
| `text` | `oklch(0.95 0.005 270)` | Primary text |
| `text-muted` | `oklch(0.65 0.01 270)` | Secondary text |
| `text-dim` | `oklch(0.48 0.008 270)` | Labels, timestamps, attributions |

### Primary accent: Slate blue
| Token | OKLCH | Usage |
|-------|-------|-------|
| `accent` | `oklch(0.65 0.08 240)` | Primary accent — CTAs, logo underscore, step numbers |
| `accent-hover` | `oklch(0.72 0.07 240)` | Button hover state |
| `accent-subtle` | `oklch(0.25 0.04 240)` | Tinted backgrounds |
| `accent-muted` | `oklch(0.50 0.06 240)` | Subdued accent text (header date) |

### Signal confidence — single-hue luminance ramp
| Token | OKLCH | Usage |
|-------|-------|-------|
| `signal-high` | `oklch(0.72 0.08 240)` | Strength 7-10 — bright slate |
| `signal-medium` | `oklch(0.52 0.06 240)` | Strength 4-6 — muted slate |
| `signal-low` | `oklch(0.35 0.03 240)` | Strength 1-3 — dim slate |

All three signal levels are the SAME slate-blue hue at different brightness. This encodes magnitude, not categories.

### Source brand colors
| Token | OKLCH | Usage |
|-------|-------|-------|
| `source-hn` | `oklch(0.70 0.18 55)` | Hacker News |
| `source-reddit` | `oklch(0.65 0.22 30)` | Reddit |
| `source-github` | `oklch(0.93 0.005 270)` | GitHub (near-white on dark) |
| `source-ph` | `oklch(0.62 0.17 38)` | Product Hunt |

### Backward-compat accent names
`accent-green`, `accent-blue` map to the primary `accent` token. `accent-red`, `accent-amber`, `accent-orange` have their own OKLCH values.

Usage: `text-accent`, `bg-signal-high`, `border-l-source-reddit`, `bg-accent-subtle`, etc.

---

## 2. Typography

Four-font hierarchy loaded via `next/font` in the root layout:

| Role | Font | CSS variable | Usage |
|------|------|-------------|-------|
| Display | Space Grotesk | `--font-display` | Headlines, section titles |
| Body | IBM Plex Serif | `--font-serif` | Thesis, evidence, descriptions |
| Data | JetBrains Mono | system `font-mono` | Labels, badges, stats, logo |
| UI | Inter | system default | Buttons, navigation, body text |

### Size scale
- Section label: `text-[10px] font-mono uppercase tracking-widest`
- Body: `text-sm` (14px)
- Card title: `text-lg font-semibold` (display font)
- Page heading: `text-2xl sm:text-3xl font-bold`
- Detail heading: `text-3xl sm:text-4xl font-bold`

---

## 3. Spacing

| Context | Value |
|---------|-------|
| Page max-width | `max-w-5xl` (grid layout with sidebar) |
| Page padding | `px-6 py-8` |
| Card padding | `p-5` |
| Card gap | `gap-4` |
| Grid gap | `gap-8` (between cards column and sidebar) |
| Section spacing | `space-y-12` |
| Element spacing | `mb-2` (tight), `mb-4` (normal), `mb-8` (section) |

---

## 4. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 6px | Badges, tags |
| `rounded` | 8px | Buttons, inputs |
| `rounded-lg` | 8px | Cards, panels |
| `rounded-full` | 9999px | Pills |

---

## 5. Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-subtle` | `0 1px 2px rgba(0,0,0,0.3)` | Card hover |
| `shadow-elevated` | `0 4px 12px rgba(0,0,0,0.4)` | Toasts, floating elements |

No glow shadows. No glass morphism. No textures.

---

## 6. Flat Card System

All cards render identically regardless of signal strength. The data speaks — the reader decides what matters.

### Card treatment (all cards)
- `bg-surface border border-border p-5 rounded-lg`
- Signal bar: 1px tall, static width, amber luminance ramp
- Title: `text-lg` display font
- Thesis: `text-sm` serif, `line-clamp-3`
- Evidence teaser: first evidence shown as blockquote on all cards
- Hover: CSS-only `hover:border-border-strong transition-colors`
- No gradients, no ambient effects, no visual hierarchy between cards

### Signal bar
Static `<div>` with inline `width` style (strength * 10%). Color from single-hue luminance ramp (`signal-high`, `signal-medium`, `signal-low`). No animation.

### Feed order
Cards render in data/pipeline order. No sorting by strength, no separators.

---

## 7. Layout

### Home page — grid with sidebar
```
max-w-5xl grid-cols-1 lg:grid-cols-[1fr_280px] gap-8
```
- Hero (title + divider) spans full width above grid
- Left column: CardGrid (stagger-animated list)
- Right column: Sidebar (sticky on desktop, stacks below on mobile)

### Sidebar sections
1. Edition — formatted display date
2. Next Edition (only on latest) — countdown to 8 AM UTC (`next-edition-countdown.tsx`, client component)
3. Sources — 4 rows with source icon, label, evidence count
4. Stats — briefs count, evidence count
5. Get Briefs by Email — email signup form (`email-signup.tsx`, client component)
6. About blurb + "Learn more" link
7. Links — GitHub + Ko-fi

### Edition route
Past editions are accessible at `/edition/[date]` with prev/next navigation (`date-nav.tsx`). Home page (`/`) always shows the latest edition.

Sticky positioning: `lg:sticky lg:top-14 lg:self-start` (applied by parent, not sidebar)

### Card detail
`max-w-5xl` outer, `max-w-3xl` inner for readability.

---

## 8. Motion

All presets in `lib/motion.ts`. Never inline raw Framer Motion objects.

| Preset | Usage |
|--------|-------|
| `fadeInUp` | Header/hero fade + slide |
| `staggerContainer` / `staggerItem` | Generic list animation |
| `cardRevealStagger` / `cardRevealItem` | Card list clip-path reveal |

### Constants
- `DURATION`: `{ fast: 0.15, normal: 0.2, slow: 0.4 }`
- `EASE`: `{ out: [0.16, 1, 0.3, 1], inOut: [0.4, 0, 0.2, 1] }`

No scroll-triggered animations. No animated signal bars. Content loads immediately.

---

## 9. Component API

All components in `components/ui/`. Use `cn()` from `@/lib/utils` for class merging.

### Button
```tsx
<Button variant="primary|secondary|ghost" size="sm|md|lg" />
<ButtonLink variant="primary|secondary|ghost" size="sm|md|lg" href="..." />
```
Primary = slate-blue button (`bg-accent text-bg`).

### Card
```tsx
<Card padding="compact|default|spacious" />
```
`bg-surface border border-border rounded-lg`

### Badge
```tsx
<Badge variant="default|success|warning|danger|info" shape="pill|tag" />
```

### Input
```tsx
<Input icon={<SearchIcon />} />
```
Focus: `border-accent/40`

---

## 10. Patterns

### Logo
Lowercase `scout_daily` — underscore in `text-accent`, "daily" in `text-text-dim`. Font: mono.

### Sticky header
```
bg-bg z-sticky border-b border-border
```
Solid background (no blur/opacity). Logo left, date in `text-accent-muted` beside logo, nav right.

### Card detail
- Thesis rendered as primary text (no box wrapper)
- Evidence as `<blockquote>` with `border-l-3 border-l-source-*` left borders
- Opportunity in inset panel (`bg-surface-inset rounded-lg p-6`)
- Signal bar: full-width, 3px, static, at top below header

### Z-index layers
| Token | Value | Usage |
|-------|-------|-------|
| `z-sticky` | 30 | Sticky header |
| `z-overlay` | 40 | Floating CTAs |
| `z-modal` | 50 | Modals |
| `z-toast` | 60 | Toast notifications |
