import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import Select from '~components/Select';
import SegmentedControl from '~components/SegmentedControl';
import { useI18n } from '@/lib/i18n';
import { sortMatchups } from '../analysis';
import { tierLabelKeys } from '../metrics';
import { TIERS, type FormationMatchup, type SortMode, type Tier } from '../types';
import type { MatchupConfig } from '../StratApp';
import FormationChip from './FormationChip';

interface SetupSectionProps {
  opponentFormations: string[];
  oppLoading: boolean;
  config: MatchupConfig;
  onConfigChange: (config: MatchupConfig) => void;
  available: FormationMatchup[];
  selected: ReadonlySet<string>;
  onToggle: (formation: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  sortBy: SortMode;
  onSortChange: (sort: SortMode) => void;
  minMatches: number;
  onMinMatchesChange: (value: number) => void;
  onAnalyze: () => void;
}

const SetupSection: React.FC<SetupSectionProps> = ({
  opponentFormations,
  oppLoading,
  config,
  onConfigChange,
  available,
  selected,
  onToggle,
  onSelectAll,
  onDeselectAll,
  sortBy,
  onSortChange,
  minMatches,
  onMinMatchesChange,
  onAnalyze,
}) => {
  const { t } = useI18n();

  const opponentOptions = useMemo(
    () => opponentFormations.map((f) => ({ value: f, label: f })),
    [opponentFormations],
  );

  const tierOptions = TIERS.map((tier) => ({ value: tier, label: t(tierLabelKeys[tier]) }));

  const sorted = useMemo(() => sortMatchups(available, sortBy), [available, sortBy]);

  const configReady = config.oppFormation !== '';
  const selectedCount = selected.size;

  return (
    <div className="rise-in flex flex-col gap-4 md:gap-6">
      <section>
        <h1 className="display-caps text-2xl font-extrabold text-ink md:text-[2rem]">
          {t('setup.title')}
        </h1>
        <p className="mt-1 text-ink-muted">{t('setup.description')}</p>
      </section>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-12">
        {/* Opponent + context panel */}
        <section className="flex flex-col gap-4 rounded-lg border border-edge bg-surface p-4 shadow-card md:p-5 lg:col-span-4">
          <div>
            <h2 className="display-caps text-sm font-bold text-accent">
              {t('setup.fixedOpponent')}
            </h2>
            <div className="mt-3 flex flex-col gap-4">
              <Select
                id="opp-formation"
                label={t('setup.opponentFormation')}
                value={config.oppFormation}
                placeholder={t('setup.selectFormation')}
                options={opponentOptions}
                onChange={(v) => onConfigChange({ ...config, oppFormation: v })}
              />
              <Select
                id="opp-tier"
                label={t('setup.opponentTier')}
                value={config.oppTier}
                options={tierOptions}
                onChange={(v) => onConfigChange({ ...config, oppTier: v as Tier })}
              />
            </div>
          </div>
          <div className="border-t border-edge pt-4">
            <h2 className="display-caps text-sm font-bold text-accent">{t('setup.yourContext')}</h2>
            <div className="mt-3">
              <Select
                id="your-tier"
                label={t('setup.yourTier')}
                value={config.yourTier}
                options={tierOptions}
                onChange={(v) => onConfigChange({ ...config, yourTier: v as Tier })}
              />
            </div>
          </div>
        </section>

        {/* Formation picker */}
        <section className="rounded-lg border border-edge bg-surface p-4 shadow-card md:p-5 lg:col-span-8">
          {!configReady ? (
            <p className="py-12 text-center text-ink-muted">{t('setup.selectFormation')}</p>
          ) : oppLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <span className="size-6 animate-spin rounded-full border-2 border-edge border-t-accent" />
              <p className="text-sm text-ink-muted">{t('loading.text')}</p>
            </div>
          ) : available.length === 0 ? (
            <p className="py-12 text-center text-ink-muted">{t('errors.noFormations')}</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="display-caps text-sm font-bold text-ink">
                  {t('setup.yourFormationsVs')}{' '}
                  <span className="text-accent">{config.oppFormation}</span>
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onSelectAll}
                    className="min-h-10 rounded-md border border-edge px-3 font-stat text-xs font-semibold uppercase tracking-[0.05em] text-ink-muted transition-colors duration-150 hover:border-accent hover:text-accent"
                  >
                    {t('setup.selectAll')}
                  </button>
                  <button
                    type="button"
                    onClick={onDeselectAll}
                    className="min-h-10 rounded-md border border-edge px-3 font-stat text-xs font-semibold uppercase tracking-[0.05em] text-ink-muted transition-colors duration-150 hover:border-accent hover:text-accent"
                  >
                    {t('setup.deselectAll')}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="sm:max-w-[260px]">
                  <span className="mb-1.5 block font-stat text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    {t('setup.sort')}
                  </span>
                  <SegmentedControl
                    label={t('setup.sort')}
                    value={sortBy}
                    options={[
                      { value: 'winRate', label: t('setup.winRate') },
                      { value: 'matches', label: t('setup.sampleSize') },
                      { value: 'name', label: t('setup.name') },
                    ]}
                    onChange={onSortChange}
                  />
                </div>
                <div className="sm:w-56">
                  <label
                    htmlFor="min-matches"
                    className="mb-1.5 flex justify-between font-stat text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted"
                  >
                    {t('setup.minMatches')}
                    <span className="text-ink">{minMatches}</span>
                  </label>
                  <input
                    id="min-matches"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={minMatches}
                    onChange={(e) => onMinMatchesChange(Number(e.target.value))}
                    className="h-11 w-full accent-(--accent)"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-3">
                {sorted.map((matchup) => (
                  <FormationChip
                    key={matchup.formation}
                    matchup={matchup}
                    selected={selected.has(matchup.formation)}
                    filteredOut={matchup.battle.battle_summary.total_matches < minMatches}
                    onToggle={onToggle}
                  />
                ))}
              </div>

              {/* Desktop CTA */}
              <div className="mt-5 hidden justify-end lg:flex">
                <button
                  type="button"
                  onClick={onAnalyze}
                  disabled={selectedCount === 0}
                  className="flex min-h-12 items-center gap-2 rounded-md bg-accent px-6 font-display text-sm font-bold uppercase tracking-[0.04em] text-on-accent transition-colors duration-200 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t('setup.analyzeBtn')}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Mobile sticky CTA */}
      {configReady && selectedCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-edge bg-canvas/95 p-3 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            onClick={onAnalyze}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-accent font-display text-sm font-bold uppercase tracking-[0.04em] text-on-accent transition-colors duration-200 hover:bg-accent-hover"
          >
            {t('setup.analyzeBtn')} ({selectedCount})
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SetupSection;
