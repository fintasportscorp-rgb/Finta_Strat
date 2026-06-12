import React from 'react';
import { useI18n } from '@/lib/i18n';
import type { CategoryInsights } from '../analysis';
import { categoryLabelKeys } from '../metrics';
import type { CategoryKey } from '../types';

interface InsightsPanelProps {
  insights: CategoryInsights;
  category: CategoryKey;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights, category }) => {
  const { t } = useI18n();
  const categoryName = t(categoryLabelKeys[category]);
  const { best, worst, strengths, weaknesses } = insights;

  return (
    <section className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {best && (
          <article className="rounded-lg border border-edge border-l-4 border-l-win bg-surface p-4 shadow-card">
            <h3 className="font-stat text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
              {t('insights.bestIn', { category: categoryName })}
            </h3>
            <p className="mt-1 font-stat text-xl font-bold text-ink">{best.formation}</p>
            <p className="text-sm text-ink-muted">
              {t('insights.avgPercentile')}{' '}
              <strong className="font-stat text-win">P{best.avgPercentile.toFixed(0)}</strong>
            </p>
          </article>
        )}
        {worst && (
          <article className="rounded-lg border border-edge border-l-4 border-l-loss bg-surface p-4 shadow-card">
            <h3 className="font-stat text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
              {t('insights.weakestIn', { category: categoryName })}
            </h3>
            <p className="mt-1 font-stat text-xl font-bold text-ink">{worst.formation}</p>
            <p className="text-sm text-ink-muted">
              {t('insights.avgPercentile')}{' '}
              <strong className="font-stat text-loss">P{worst.avgPercentile.toFixed(0)}</strong>
            </p>
          </article>
        )}
      </div>

      {strengths.length === 0 && weaknesses.length === 0 ? (
        <p className="text-sm text-ink-muted">{t('insights.noExtremes')}</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {strengths.length > 0 && (
            <section className="rounded-lg border border-edge bg-surface p-4 shadow-card">
              <h4 className="display-caps text-xs font-bold text-win">
                {t('insights.notableStrengths')}
              </h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {strengths.slice(0, 8).map((s) => (
                  <span
                    key={`${s.formation}-${s.metric}`}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-[color-mix(in_oklch,var(--win)_12%,transparent)] px-2 py-1 font-stat text-xs font-semibold text-win"
                  >
                    <span className="text-ink">{s.formation}</span>
                    {s.label}
                    <span>P{s.percentile.toFixed(0)}</span>
                  </span>
                ))}
              </div>
            </section>
          )}
          {weaknesses.length > 0 && (
            <section className="rounded-lg border border-edge bg-surface p-4 shadow-card">
              <h4 className="display-caps text-xs font-bold text-loss">
                {t('insights.notableWeaknesses')}
              </h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {weaknesses.slice(0, 8).map((w) => (
                  <span
                    key={`${w.formation}-${w.metric}`}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-[color-mix(in_oklch,var(--loss)_12%,transparent)] px-2 py-1 font-stat text-xs font-semibold text-loss"
                  >
                    <span className="text-ink">{w.formation}</span>
                    {w.label}
                    <span>P{w.percentile.toFixed(0)}</span>
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  );
};

export default InsightsPanel;
