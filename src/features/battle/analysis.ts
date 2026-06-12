import {
  ANALYSIS_CATEGORIES,
  getSource,
  invertedMetrics,
  metricDefinitions,
  metricPercentile,
} from './metrics';
import type {
  Battle,
  CategoryKey,
  FormationMatchup,
  OpponentData,
  SortMode,
  Tier,
} from './types';

/** Your formations that have battle data for the chosen matchup (uses per-opponent slice). */
export function getAvailableFormations(
  data: OpponentData,
  yourTier: Tier,
  oppTier: Tier,
): FormationMatchup[] {
  const result: FormationMatchup[] = [];
  for (const [formation, byTier] of Object.entries(data)) {
    const battle = byTier[yourTier]?.[oppTier];
    if (battle?.battle_summary) result.push({ formation, battle });
  }
  return result;
}

export function sortMatchups(matchups: FormationMatchup[], sortBy: SortMode): FormationMatchup[] {
  const sorted = [...matchups];
  if (sortBy === 'winRate') {
    sorted.sort((a, b) => b.battle.battle_summary.win_rate - a.battle.battle_summary.win_rate);
  } else if (sortBy === 'matches') {
    sorted.sort(
      (a, b) => b.battle.battle_summary.total_matches - a.battle.battle_summary.total_matches,
    );
  } else {
    sorted.sort((a, b) => a.formation.localeCompare(b.formation));
  }
  return sorted;
}

export interface MetricHighlight {
  metric: string;
  label: string;
  percentile: number;
  value: number | undefined;
}

export interface StrengthsWeaknesses {
  strengths: MetricHighlight[];
  weaknesses: MetricHighlight[];
}

/**
 * Strengths: percentile >= 50 (after inversion semantics).
 * Weaknesses: percentile in the 20-40 band (matching the original heuristics).
 */
export function categoryHighlights(battle: Battle, category: CategoryKey): StrengthsWeaknesses {
  const def = metricDefinitions[category];
  const source = getSource(battle, category);
  const strengths: MetricHighlight[] = [];
  const weaknesses: MetricHighlight[] = [];
  if (!source) return { strengths, weaknesses };

  for (const metric of def.metrics) {
    const perc = metricPercentile(source, metric);
    if (perc === undefined || perc === null) continue;
    const entry: MetricHighlight = {
      metric,
      label: def.labels[metric] ?? metric,
      percentile: perc,
      value: source[metric],
    };
    if (invertedMetrics.has(metric)) {
      if (perc >= 50) weaknesses.push(entry);
      if (perc <= 40 && perc >= 20) strengths.push(entry);
    } else {
      if (perc >= 50) strengths.push(entry);
      if (perc <= 40 && perc >= 20) weaknesses.push(entry);
    }
  }

  strengths.sort((a, b) => b.percentile - a.percentile);
  weaknesses.sort((a, b) => a.percentile - b.percentile);
  return { strengths, weaknesses };
}

/** Strengths/weaknesses across all 8 categories for one formation (donut cards). */
export function allCategoryHighlights(
  battle: Battle,
): Partial<Record<CategoryKey, StrengthsWeaknesses>> {
  const result: Partial<Record<CategoryKey, StrengthsWeaknesses>> = {};
  for (const category of ANALYSIS_CATEGORIES) {
    const highlights = categoryHighlights(battle, category);
    if (highlights.strengths.length > 0 || highlights.weaknesses.length > 0) {
      result[category] = highlights;
    }
  }
  return result;
}

export interface FormationHighlight extends MetricHighlight {
  formation: string;
}

export interface CategoryInsights {
  best: { formation: string; avgPercentile: number } | null;
  worst: { formation: string; avgPercentile: number } | null;
  strengths: FormationHighlight[];
  weaknesses: FormationHighlight[];
}

/** Cross-formation insights for one category tab. */
export function categoryInsights(
  comparison: FormationMatchup[],
  category: CategoryKey,
): CategoryInsights {
  const strengths: FormationHighlight[] = [];
  const weaknesses: FormationHighlight[] = [];
  const scores: Array<{ formation: string; avgPercentile: number }> = [];

  for (const { formation, battle } of comparison) {
    const highlights = categoryHighlights(battle, category);
    strengths.push(...highlights.strengths.map((h) => ({ ...h, formation })));
    weaknesses.push(...highlights.weaknesses.map((h) => ({ ...h, formation })));

    const def = metricDefinitions[category];
    const source = getSource(battle, category);
    if (!source) continue;
    let total = 0;
    let count = 0;
    for (const metric of def.metrics) {
      const perc = metricPercentile(source, metric);
      if (perc === undefined) continue;
      total += invertedMetrics.has(metric) ? 100 - perc : perc;
      count++;
    }
    if (count > 0) scores.push({ formation, avgPercentile: total / count });
  }

  strengths.sort((a, b) => b.percentile - a.percentile);
  weaknesses.sort((a, b) => b.percentile - a.percentile);
  scores.sort((a, b) => b.avgPercentile - a.avgPercentile);

  return {
    best: scores[0] ?? null,
    worst: scores.length > 1 ? scores[scores.length - 1] : null,
    strengths,
    weaknesses,
  };
}

export interface GlobalReport {
  bestReliable: FormationMatchup;
  bestByWinRate: FormationMatchup;
  lowSample: FormationMatchup[];
  avgPossession: number;
  avgXg: number;
}

export function buildGlobalReport(comparison: FormationMatchup[]): GlobalReport | null {
  if (comparison.length === 0) return null;

  const byWinRate = [...comparison].sort(
    (a, b) => b.battle.battle_summary.win_rate - a.battle.battle_summary.win_rate,
  );
  const bestByWinRate = byWinRate[0];
  const reliable = byWinRate.filter((m) => m.battle.battle_summary.total_matches >= 30);
  const bestReliable = reliable[0] ?? bestByWinRate;
  const lowSample = comparison.filter((m) => m.battle.battle_summary.total_matches < 20);

  const avgPossession =
    comparison.reduce((sum, m) => sum + (m.battle.possession?.avg_possession ?? 50), 0) /
    comparison.length;
  const avgXg =
    comparison.reduce((sum, m) => sum + (m.battle.shooting?.avg_xg ?? 0), 0) / comparison.length;

  return { bestReliable, bestByWinRate, lowSample, avgPossession, avgXg };
}
