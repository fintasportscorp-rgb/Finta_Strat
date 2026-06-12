import React from 'react';
import { Info } from 'lucide-react';
import Select from '~components/Select';
import { useI18n } from '@/lib/i18n';
import {
  formatValue,
  getSource,
  goodness,
  invertedMetrics,
  metricDefinitions,
  metricExplanations,
  metricPercentile,
  metricValue,
  seriesColor,
} from '../metrics';
import type { CategoryKey, FormationMatchup } from '../types';
import PercentilePill from './PercentilePill';

interface GaugePanelProps {
  comparison: FormationMatchup[];
  category: CategoryKey;
  availableMetrics: string[];
  metric: string;
  onMetricChange: (metric: string) => void;
}

/**
 * Single-metric comparison: one horizontal percentile bar per formation,
 * bar length = "goodness" (inverted metrics flipped), tick at league median.
 */
const GaugePanel: React.FC<GaugePanelProps> = ({
  comparison,
  category,
  availableMetrics,
  metric,
  onMetricChange,
}) => {
  const { t } = useI18n();
  const def = metricDefinitions[category];
  const inverted = invertedMetrics.has(metric);
  const explanation = metricExplanations[metric];

  return (
    <section className="rounded-lg border border-edge bg-surface p-4 shadow-card md:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <Select
          id="gauge-metric"
          label={t('analysis.selectMetric')}
          value={metric}
          options={availableMetrics.map((m) => ({
            value: m,
            label: def.labels[m] ?? m,
            title: metricExplanations[m],
          }))}
          onChange={onMetricChange}
          className="sm:w-72"
        />
        {inverted && (
          <p className="font-stat text-xs font-semibold uppercase tracking-[0.05em] text-draw">
            ↓ {t('gauge.invertedNote')}
          </p>
        )}
      </div>

      {explanation && (
        <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-ink-muted">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {explanation}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {comparison.map((item, i) => {
          const source = getSource(item.battle, category);
          const percentile = metricPercentile(source, metric);
          const value = metricValue(source, metric);
          if (percentile === undefined) return null;
          const g = goodness(percentile, metric);

          return (
            <div key={item.formation} className="flex items-center gap-3">
              <span className="flex w-20 shrink-0 items-center gap-1.5 font-stat text-sm font-bold text-ink">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: seriesColor(i) }}
                  aria-hidden="true"
                />
                {item.formation}
              </span>
              <div className="relative h-2.5 flex-1 rounded-full bg-[color-mix(in_oklch,var(--text-primary)_8%,transparent)]">
                {/* League median tick */}
                <span
                  className="absolute inset-y-[-3px] left-1/2 w-[1.5px] bg-edge-strong"
                  aria-hidden="true"
                />
                <div
                  className="bar-sweep h-full rounded-full"
                  style={{
                    width: `${Math.min(Math.max(g, 2), 100)}%`,
                    backgroundColor: seriesColor(i),
                    animationDelay: `${i * 40}ms`,
                  }}
                  role="img"
                  aria-label={`${item.formation}: ${formatValue(value)}, percentile ${percentile.toFixed(0)}`}
                />
              </div>
              <span className="flex w-28 shrink-0 items-center justify-end gap-1.5 font-stat text-sm text-ink">
                {formatValue(value)}
                <PercentilePill percentile={percentile} metric={metric} />
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between font-stat text-[11px] uppercase tracking-[0.05em] text-ink-muted">
        <span>{t('gauge.worst')}</span>
        <span>50</span>
        <span>{t('gauge.best')}</span>
      </div>
    </section>
  );
};

export default GaugePanel;
