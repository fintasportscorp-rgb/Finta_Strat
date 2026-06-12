import React, { useMemo } from 'react';
import { Cell, Pie, PieChart, Tooltip as RechartsTooltip } from 'recharts';
import { useI18n } from '@/lib/i18n';
import { usePrefersReducedMotion } from '@/lib/theme';
import { allCategoryHighlights } from '../analysis';
import { ANALYSIS_CATEGORIES, categoryLabelKeys, metricExplanations } from '../metrics';
import type { CategoryKey, FormationMatchup } from '../types';
import ConfidenceBadge from './ConfidenceBadge';
import Tooltip from '~components/Tooltip';
import type { MetricHighlight } from '../analysis';

interface DonutCardProps {
  matchup: FormationMatchup;
  color: string;
  /** Stagger index for the entrance animation. */
  index: number;
}

const OUTCOME_COLORS = ['var(--win)', 'var(--draw)', 'var(--loss)'] as const;

const HighlightChips: React.FC<{
  items: MetricHighlight[];
  tone: 'strength' | 'weakness';
}> = ({ items, tone }) => (
  <span className="flex flex-wrap gap-1.5">
    {items.map((h) => (
      <span
        key={h.metric}
        className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-stat text-[11px] font-semibold ${
          tone === 'strength'
            ? 'bg-[color-mix(in_oklch,var(--win)_14%,transparent)] text-win'
            : 'bg-[color-mix(in_oklch,var(--loss)_14%,transparent)] text-loss'
        }`}
      >
        {h.label} P{h.percentile.toFixed(0)}
        {metricExplanations[h.metric] && <Tooltip text={metricExplanations[h.metric]} />}
      </span>
    ))}
  </span>
);

const DonutCard: React.FC<DonutCardProps> = ({ matchup, color, index }) => {
  const { t } = useI18n();
  const reducedMotion = usePrefersReducedMotion();
  const { formation, battle } = matchup;
  const stats = battle.battle_summary;

  const segments = useMemo(
    () => [
      { name: 'W', value: stats.win_rate },
      { name: 'D', value: stats.draw_rate },
      { name: 'L', value: stats.loss_rate },
    ],
    [stats],
  );

  const highlights = useMemo(() => allCategoryHighlights(battle), [battle]);
  const categoriesWithStrengths = ANALYSIS_CATEGORIES.filter(
    (c) => (highlights[c]?.strengths.length ?? 0) > 0,
  );
  const categoriesWithWeaknesses = ANALYSIS_CATEGORIES.filter(
    (c) => (highlights[c]?.weaknesses.length ?? 0) > 0,
  );

  return (
    <article
      className="rise-in rounded-lg border border-edge bg-surface p-4 shadow-card md:p-5"
      style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
    >
      <header className="flex flex-wrap items-center gap-2">
        <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
        <h3 className="font-stat text-lg font-bold text-ink">{formation}</h3>
        <ConfidenceBadge matches={stats.total_matches} />
        <span className="ml-auto font-stat text-xs uppercase tracking-[0.08em] text-ink-muted">
          n={stats.total_matches}
        </span>
      </header>

      <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="shrink-0">
          <div className="relative size-[150px]">
            <PieChart width={150} height={150}>
              <Pie
                data={segments}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={64}
                paddingAngle={2}
                cornerRadius={3}
                stroke="var(--surface)"
                strokeWidth={2}
                isAnimationActive={!reducedMotion}
                animationDuration={600}
              >
                {segments.map((seg, i) => (
                  <Cell key={seg.name} fill={OUTCOME_COLORS[i]} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                contentStyle={{
                  backgroundColor: 'var(--surface-raised)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-stat)',
                  fontSize: 12,
                }}
              />
            </PieChart>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-stat text-3xl font-bold text-ink">
                {stats.win_rate.toFixed(0)}%
              </span>
              <span className="font-stat text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                {t('donut.win')}
              </span>
            </div>
          </div>
          <div className="mt-1 flex justify-center gap-3 font-stat text-xs font-semibold">
            <span className="flex items-center gap-1 text-win">
              <span className="size-2.5 rounded-[2px] bg-win" aria-hidden="true" />W{' '}
              {stats.win_rate.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1 text-draw">
              <span className="size-2.5 rounded-[2px] bg-draw" aria-hidden="true" />D{' '}
              {stats.draw_rate.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1 text-loss">
              <span className="size-2.5 rounded-[2px] bg-loss" aria-hidden="true" />L{' '}
              {stats.loss_rate.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="grid w-full min-w-0 flex-1 gap-3 text-sm sm:grid-cols-2">
          <section>
            <h4 className="display-caps text-xs font-bold text-win">
              {t('donut.strengthsHeader')}
            </h4>
            {categoriesWithStrengths.length === 0 ? (
              <p className="mt-1.5 text-xs text-ink-muted">{t('donut.noStrengths')}</p>
            ) : (
              categoriesWithStrengths.map((cat: CategoryKey) => (
                <div key={cat} className="mt-1.5">
                  <p className="font-stat text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    {t(categoryLabelKeys[cat])}
                  </p>
                  <HighlightChips items={highlights[cat]?.strengths ?? []} tone="strength" />
                </div>
              ))
            )}
          </section>
          <section>
            <h4 className="display-caps text-xs font-bold text-loss">
              {t('donut.weaknessesHeader')}
            </h4>
            {categoriesWithWeaknesses.length === 0 ? (
              <p className="mt-1.5 text-xs text-ink-muted">{t('donut.noWeaknesses')}</p>
            ) : (
              categoriesWithWeaknesses.map((cat: CategoryKey) => (
                <div key={cat} className="mt-1.5">
                  <p className="font-stat text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    {t(categoryLabelKeys[cat])}
                  </p>
                  <HighlightChips items={highlights[cat]?.weaknesses ?? []} tone="weakness" />
                </div>
              ))
            )}
          </section>
        </div>
      </div>
    </article>
  );
};

export default React.memo(DonutCard);
