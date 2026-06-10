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
| **Confidence filter** | Minimum match threshold — hides formations with insufficient sample size |
| **Sort controls** | Order by win rate, sample size, or alphabetically |

### Visualizations

| Chart | What It Shows |
|-------|--------------|
| **Donut** | Win / draw / loss breakdown per formation with color-coded segments |
| **Heatmap table** | Per-metric values + percentile rankings, color-intensity coded |
| **Gauge** | Side-by-side metric comparison across formations |
| **Scatter** | Win rate plotted against sample size — reveals reliability vs performance trade-offs |

### Statistical Depth

8 metric categories with full percentile ranking:

- **Shooting** — shot volume, xG, conversion, shot placement
- **Passing** — accuracy, range, key passes, progressive passes
- **Possession** — share, progression, defensive recovery
- **Defensive** — press intensity, duels, interceptions, blocks
- **Goalkeeping** — save percentage, distribution, sweeping
- **Chance creation** — open play, set piece, counter-attack
- **Pass types** — ground, aerial, switches, crosses
- **Miscellaneous** — discipline, transitions, set piece efficiency

Each metric flags **strengths** (top percentile) and **weaknesses** (bottom percentile) automatically. Inverted metrics (where lower is better) are handled correctly throughout.

### UX

- Internationalization (i18n) with language selection
- Dark / light theme toggle with persistence
- Mobile-responsive layout with hamburger navigation
- Scroll-to-top on long analyses
- Tooltips and metric explanations inline

---

## Data

The application loads from a single structured JSON:

```
formation_battles_with_individual_stat_percentiles.json
```

It contains, per formation matchup and tier:
- Match outcomes: wins, draws, losses, sample size
- 8-category metric values per formation
- Percentile rankings relative to all formations in the dataset

Covers European Big 5 leagues. Confidence warnings appear for formations with n < 30 matches.

---

## Project Structure

```
.
├── index.html          # Main application entry
├── app.js              # Formation selection, filtering, chart rendering, i18n
├── server.js           # Static file server (Node.js, port 5000)
├── styles.css          # Full stylesheet — light/dark themes, responsive layout
└── formation_battles_with_individual_stat_percentiles.json   # Core dataset
```

---

## Tech Stack

JavaScript · CSS · HTML · Node.js

---

## Running Locally

```bash
node server.js
```

Then open `http://localhost:5000` in your browser. No build step required.

---

## Links

| Resource | URL |
|----------|-----|
| Live app | [strat.fintalab.com](https://strat.fintalab.com) |
| Sports platform | [fintalab.com](https://fintalab.com) |
| GitHub | [fintasportscorp-rgb/Finta_Strat](https://github.com/fintasportscorp-rgb/Finta_Strat) |
