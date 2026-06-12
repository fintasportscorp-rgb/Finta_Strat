# Finta Strat — Formation Battles

**Tactical intelligence for football formation matchups. See how any shape performs against any opponent.**

> Live demo: [strat.fintalab.com](https://strat.fintalab.com)
> Sports ecosystem: [fintalab.com](https://fintalab.com)

---

## What Is Finta Strat?

Finta Strat is a formation battle analysis engine built on 50,000+ European Big 5 confrontations. Pick an opponent formation, choose your tier, and get a full statistical breakdown of how each of your shapes performs against it — from shooting efficiency and pressing intensity to pass types and goalkeeping output.

Conventional platforms show you results. Strat shows you *why* — across 8 metric categories, with percentile rankings, confidence indicators, and multi-formation visual comparisons in a single view.

---

## Core Features

### Formation Selection & Filtering

| Feature | Description |
|---------|-------------|
| **Opponent picker** | Select formation + competitive tier |
| **Multi-formation compare** | Analyze multiple of your shapes against the same opponent simultaneously |
| **Confidence filter** | Minimum match threshold — dims formations with insufficient sample size |
| **Sort controls** | Order by win rate, sample size, or alphabetically |
| **Pitch-glyph chips** | Each formation rendered as a mini tactics-board dot diagram |

### Visualizations

| Chart | What It Shows |
|-------|--------------|
| **Donut** | Win / draw / loss breakdown per formation with center win-rate numeral |
| **Heatmap table** | Per-metric values + percentile pills, tinted by 5-band goodness scale |
| **Gauge bars** | Side-by-side percentile comparison for any metric across formations |
| **Scatter** | Win rate vs sample size with n=30 confidence reference line |

### Statistical Depth

8 metric categories with full percentile ranking: **Shooting**, **Passing**, **Possession**, **Defensive**, **Goalkeeping**, **Chance creation**, **Pass types**, **Miscellaneous**.

Each metric flags strengths (top percentiles) and weaknesses (bottom band) automatically. Inverted metrics (where lower is better — fouls, errors, goals against) are mapped through a "goodness" transform so color encoding never lies.

### UX

- "Night Match Control Room" design system — blue token-based theming
- Dark / light mode with persistence and zero-flash pre-paint script
- Mobile-first responsive layout: scroll-snap pill nav on mobile, fixed rail on desktop
- WCAG-conscious: 4.5:1 contrast pairs, 44px touch targets, visible focus rings, reduced-motion support
- Internationalization (i18n) — drop a `lang/{code}.json` to add a language

---

## Data

The application loads a single structured JSON:

```
public/data/formation-battles.json
```

It contains, per formation matchup and tier: match outcomes (wins/draws/losses, sample size), 8-category metric values per formation, and percentile rankings relative to all matches of the same formation. Covers European Big 5 leagues. Confidence warnings appear for formations with n < 30 matches.

---

## Tech Stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · Recharts · TanStack Query (Suspense-first) · Lucide icons

## Project Structure

```
.
├── index.html                  # Vite entry (fonts, theme pre-paint script)
├── public/
│   ├── data/formation-battles.json   # Core dataset
│   └── lang/en.json                  # Translations
└── src/
    ├── App.tsx                 # Providers: Query, Theme, I18n, ErrorBoundary
    ├── styles/index.css        # Design tokens (light/dark) + Tailwind v4 theme
    ├── lib/                    # theme + i18n providers
    ├── components/             # Shared primitives (Modal, Select, Tooltip…)
    └── features/battle/        # Feature: types, api, metrics, analysis, UI
        ├── config/             # Metric definitions / explanations / inverted set
        └── components/         # Setup, NavRail, Donut, Heatmap, Gauge, Scatter…
```

---

## Running Locally

```bash
npm install
npm run dev      # http://localhost:5000
npm run build    # production bundle in dist/
```

---

## Links

| Resource | URL |
|----------|-----|
| Live app | [strat.fintalab.com](https://strat.fintalab.com) |
| Sports platform | [fintalab.com](https://fintalab.com) |
| GitHub | [fintasportscorp-rgb/Finta_Strat](https://github.com/fintasportscorp-rgb/Finta_Strat) |
