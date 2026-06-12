import React from 'react';
import Tooltip from '~components/Tooltip';
import { useI18n } from '@/lib/i18n';
import {
  formatValue,
  getSource,
  goodness,
  metricDefinitions,
  metricExplanations,
  metricPercentile,
  metricValue,
  percentileBand,
  type Band,
} from '../metrics';
import type { CategoryKey, FormationMatchup } from '../types';
import PercentilePill from './PercentilePill';

interface HeatmapTableProps {
  comparison: FormationMatchup[];
  category: CategoryKey;
  availableMetrics: string[];
  onOpenPercentiles: () => void;
}

const BAND_TINT: Record<Band, string> = {
  'major-weakness': 'color-mix(in oklch, var(--loss) 14%, transparent)',
  'below-avg': 'color-mix(in oklch, var(--band-below) 14%, transparent)',
  average: 'transparent',
  'above-avg': 'color-mix(in oklch, var(--band-above) 14%, transparent)',
  'major-strength': 'color-mix(in oklch, var(--win) 14%, transparent)',
};

/**
 * Per-metric values + percentile pills, tinted by goodness band.
 * First column sticky; horizontal scroll on narrow screens.
 */
const HeatmapTable: React.FC<HeatmapTableProps> = ({
  comparison,
  category,
  availableMetrics,
  onOpenPercentiles,
}) => {
  const { t } = useI18n();
  const def = metricDefinitions[category];

  return (
    <section className="rounded-lg border border-edge bg-surface shadow-card">
      <div className="flex items-center justify-between gap-2 p-4 pb-0 md:px-5">
        <h3 className="display-caps text-sm font-bold text-ink">{t('analysis.battleResults')}</h3>
        <button
          type="button"
          onClick={onOpenPercentiles}
          className="min-h-10 rounded-md px-2 font-stat text-xs font-semibold uppercase tracking-[0.05em] text-accent transition-colors duration-150 hover:text-accent-hover"
        >
          {t('header.percentiles')} ?
        </button>
      </div>
      <div className="scroll-thin overflow-x-auto p-4 md:p-5">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-24 bg-surface p-2 text-left font-stat text-xs font-semibold uppercase tracking-[0.05em] text-ink-muted">
                {t('percentileModal.tableFormation')}
              </th>
              {availableMetrics.map((m) => (
                <th
                  key={m}
                  className="min-w-[5.5rem] p-2 text-left align-bottom font-stat text-xs font-semibold text-ink-muted"
                >
                  <span className="inline-flex items-center gap-0.5">
                    {def.labels[m] ?? m}
                    {metricExplanations[m] && <Tooltip text={metricExplanations[m]} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.map((item) => {
              const source = getSource(item.battle, category);
              return (
                <tr key={item.formation} className="border-t border-edge">
                  <td className="sticky left-0 z-10 bg-surface p-2">
                    <span className="font-stat text-sm font-bold text-ink">{item.formation}</span>
                    <span className="block font-stat text-[11px] text-ink-muted">
                      n={item.battle.battle_summary.total_matches}
                    </span>
                  </td>
                  {availableMetrics.map((m) => {
                    const value = metricValue(source, m);
                    const percentile = metricPercentile(source, m);
                    if (value === undefined) {
                      return (
                        <td key={m} className="p-2 text-ink-muted">
                          -
                        </td>
                      );
                    }
                    const band =
                      percentile !== undefined ? percentileBand(goodness(percentile, m)) : 'average';
                    return (
                      <td
                        key={m}
                        className="h-11 p-2"
                        style={{ backgroundColor: BAND_TINT[band] }}
                      >
                        <span className="flex items-center justify-between gap-1.5">
                          <span className="font-stat font-semibold text-ink">
                            {formatValue(value)}
                          </span>
                          {percentile !== undefined && (
                            <PercentilePill percentile={percentile} metric={m} />
                          )}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default HeatmapTable;
