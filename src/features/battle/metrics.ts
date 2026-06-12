import definitionsJson from './config/metric-definitions.json';
import explanationsJson from './config/metric-explanations.json';
import invertedJson from './config/inverted-metrics.json';
import type { Battle, CategoryKey, MetricSource, ParentTabKey, Tier } from './types';

export interface CategoryDef {
  metrics: string[];
  labels: Record<string, string>;
  source: string;
}

export const metricDefinitions = definitionsJson as Record<CategoryKey, CategoryDef>;

export const metricExplanations = explanationsJson as Record<string, string>;

/** Metrics where higher values are WORSE (high percentile = weakness). */
export const invertedMetrics = new Set<string>(invertedJson as string[]);

export const tierLabelKeys: Record<Tier, string> = {
  Elite_Tier: 'tiers.elite',
  Strong_Tier: 'tiers.strong',
  Mid_Tier: 'tiers.mid',
  Struggling_Tier: 'tiers.struggling',
};

export const parentTabMapping: Record<ParentTabKey, CategoryKey[]> = {
  overview: ['summary', 'miscellaneous'],
  attack: ['shooting', 'creation'],
  buildup: ['passing', 'pass_types', 'possession'],
  defense: ['defensive', 'goalkeeping'],
};

export const categoryLabelKeys: Record<CategoryKey, string> = {
  summary: 'tabs.summary',
  shooting: 'tabs.shooting',
  passing: 'tabs.passing',
  possession: 'tabs.possession',
  defensive: 'tabs.defensive',
  goalkeeping: 'tabs.goalkeeping',
  creation: 'tabs.creation',
  pass_types: 'tabs.passTypes',
  miscellaneous: 'tabs.miscellaneous',
};

/** The 8 analysis categories (everything except the summary pseudo-category). */
export const ANALYSIS_CATEGORIES: CategoryKey[] = [
  'shooting',
  'passing',
  'possession',
  'defensive',
  'goalkeeping',
  'creation',
  'pass_types',
  'miscellaneous',
];

/** Per-formation series colors — resolved from theme CSS variables at render. */
export const SERIES_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
] as const;

export function seriesColor(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length];
}

export function formatValue(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  if (Number.isInteger(value)) return value.toString();
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

/**
 * "Goodness" of a percentile: inverted metrics flip so that higher is
 * always better. Color encodings must go through this, never raw percentile.
 */
export function goodness(percentile: number, metric: string): number {
  return invertedMetrics.has(metric) ? 100 - percentile : percentile;
}

export type Band = 'major-weakness' | 'below-avg' | 'average' | 'above-avg' | 'major-strength';

export function percentileBand(g: number): Band {
  if (g < 20) return 'major-weakness';
  if (g < 40) return 'below-avg';
  if (g < 60) return 'average';
  if (g < 80) return 'above-avg';
  return 'major-strength';
}

/** The metric-source block of a battle for a category (undefined for summary). */
export function getSource(battle: Battle, category: CategoryKey): MetricSource | undefined {
  const def = metricDefinitions[category];
  const src = (battle as unknown as Record<string, unknown>)[def.source];
  return typeof src === 'object' && src !== null ? (src as MetricSource) : undefined;
}

export function metricValue(source: MetricSource | undefined, metric: string): number | undefined {
  return source?.[metric];
}

export function metricPercentile(
  source: MetricSource | undefined,
  metric: string,
): number | undefined {
  return source?.[`${metric}_formation_percentile`];
}
