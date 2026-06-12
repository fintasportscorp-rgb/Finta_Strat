import React, { useMemo } from 'react';
import { ClipboardList, TrendingDown, Trophy } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { buildGlobalReport } from '../analysis';
import { seriesColor } from '../metrics';
import type { FormationMatchup } from '../types';
import DonutCard from './DonutCard';
import ScatterCard from './ScatterCard';

interface OverviewTabProps {
  comparison: FormationMatchup[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ comparison }) => {
  const { t } = useI18n();
  const report = useMemo(() => buildGlobalReport(comparison), [comparison]);

  if (!report) return null;

  const best = report.bestReliable;
  const bestStats = best.battle.battle_summary;
  const runnerUp = report.bestByWinRate;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Decision report */}
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border border-edge border-l-4 border-l-win bg-surface p-4 shadow-card">
          <h3 className="display-caps flex items-center gap-2 text-sm font-bold text-win">
            <Trophy className="size-4" aria-hidden="true" />
            {t('report.recommendedFormation')}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {t('report.bestChoice', {
              formation: best.formation,
              winRate: bestStats.win_rate.toFixed(1),
              matches: bestStats.total_matches,
            })}
            {best !== runnerUp && (
              <>
                {' '}
                <strong className="text-draw">{t('report.noteHigherWinRate')}</strong>{' '}
                {t('report.higherWinRateText', {
                  formation: runnerUp.formation,
                  winRate: runnerUp.battle.battle_summary.win_rate.toFixed(1),
                  matches: runnerUp.battle.battle_summary.total_matches,
                })}
              </>
            )}
          </p>
        </article>

        {report.lowSample.length > 0 && (
          <article className="rounded-lg border border-edge border-l-4 border-l-draw bg-surface p-4 shadow-card">
            <h3 className="display-caps flex items-center gap-2 text-sm font-bold text-draw">
              <TrendingDown className="size-4" aria-hidden="true" />
              {t('report.statisticalWarning')}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {t('report.lowSampleWarning')}{' '}
              <strong className="font-stat text-draw">
                {report.lowSample
                  .map((f) => `${f.formation} (n=${f.battle.battle_summary.total_matches})`)
                  .join(', ')}
              </strong>
              . {t('report.resultsNotSignificant')}
            </p>
          </article>
        )}

        <article className="rounded-lg border border-edge border-l-4 border-l-accent bg-surface p-4 shadow-card">
          <h3 className="display-caps flex items-center gap-2 text-sm font-bold text-accent">
            <ClipboardList className="size-4" aria-hidden="true" />
            {t('report.tacticalOverview')}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {t('report.tacticalText', {
              possession: report.avgPossession.toFixed(1),
              xg: report.avgXg.toFixed(2),
            })}{' '}
            {report.avgPossession > 55
              ? t('report.dominatePossession')
              : report.avgPossession < 45
                ? t('report.counterAttack')
                : t('report.balancedPossession')}
          </p>
        </article>
      </section>

      {/* W/D/L donuts + per-formation strengths/weaknesses */}
      <section className="grid gap-4 xl:grid-cols-2">
        {comparison.map((matchup, i) => (
          <DonutCard key={matchup.formation} matchup={matchup} color={seriesColor(i)} index={i} />
        ))}
      </section>

      <ScatterCard comparison={comparison} />
    </div>
  );
};

export default OverviewTab;
