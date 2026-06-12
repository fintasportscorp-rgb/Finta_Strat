import React, { Suspense, useCallback, useMemo, useState } from 'react';
import AppLoader from '~components/AppLoader';
import ScrollTopButton from '~components/ScrollTopButton';
import { useI18n } from '@/lib/i18n';
import { useFormationData } from './api';
import { getAvailableFormations, sortMatchups } from './analysis';
import { tierLabelKeys } from './metrics';
import type { CategoryKey, FormationMatchup, SortMode, Tier } from './types';
import AppHeader from './components/AppHeader';
import NavRail, { type NavKey } from './components/NavRail';
import SetupSection from './components/SetupSection';
import GuideModal from './components/GuideModal';
import PercentileModal from './components/PercentileModal';

const AnalysisView = React.lazy(() => import('./components/AnalysisView'));

export interface MatchupConfig {
  oppFormation: string;
  oppTier: Tier;
  yourTier: Tier;
}

const StratApp: React.FC = () => {
  const data = useFormationData();
  const { t } = useI18n();

  const [config, setConfig] = useState<MatchupConfig>({
    oppFormation: '',
    oppTier: 'Mid_Tier',
    yourTier: 'Mid_Tier',
  });
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortMode>('winRate');
  const [minMatches, setMinMatches] = useState(10);
  const [comparison, setComparison] = useState<FormationMatchup[] | null>(null);
  const [section, setSection] = useState<NavKey>('setup');
  const [guideOpen, setGuideOpen] = useState(false);
  const [percentileOpen, setPercentileOpen] = useState(false);

  const available = useMemo(() => {
    if (!config.oppFormation) return [];
    return getAvailableFormations(data, config.yourTier, config.oppFormation, config.oppTier);
  }, [data, config]);

  const updateConfig = useCallback((next: MatchupConfig) => {
    setConfig(next);
    setSelected(new Set());
    setComparison(null);
    setSection('setup');
  }, []);

  const toggleFormation = useCallback((formation: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(formation)) next.delete(formation);
      else next.add(formation);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(
      new Set(
        available
          .filter((m) => m.battle.battle_summary.total_matches >= minMatches)
          .map((m) => m.formation),
      ),
    );
  }, [available, minMatches]);

  const deselectAll = useCallback(() => setSelected(new Set()), []);

  const analyze = useCallback(() => {
    const chosen = available.filter((m) => selected.has(m.formation));
    if (chosen.length === 0) return;
    setComparison(sortMatchups(chosen, 'winRate'));
    setSection('summary');
    window.scrollTo({ top: 0 });
  }, [available, selected]);

  const goTo = useCallback((key: NavKey) => {
    setSection(key);
    window.scrollTo({ top: 0 });
  }, []);

  const matchupLabel = config.oppFormation
    ? `${config.oppFormation} · ${t(tierLabelKeys[config.oppTier])}`
    : null;

  return (
    <div className="min-h-dvh lg:pl-60">
      <AppHeader
        matchupLabel={comparison ? matchupLabel : null}
        sampleCount={comparison?.length ?? 0}
        onEditMatchup={() => goTo('setup')}
        onOpenGuide={() => setGuideOpen(true)}
        onOpenPercentiles={() => setPercentileOpen(true)}
      />

      <NavRail active={section} analysisReady={comparison !== null} onSelect={goTo} />

      <main className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-4 md:px-6 lg:px-8 lg:pb-12">
        {section === 'setup' ? (
          <SetupSection
            data={data}
            config={config}
            onConfigChange={updateConfig}
            available={available}
            selected={selected}
            onToggle={toggleFormation}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
            sortBy={sortBy}
            onSortChange={setSortBy}
            minMatches={minMatches}
            onMinMatchesChange={setMinMatches}
            onAnalyze={analyze}
          />
        ) : comparison ? (
          <Suspense fallback={<AppLoader label={t('loading.text')} />}>
            <AnalysisView
              comparison={comparison}
              category={section as CategoryKey}
              config={config}
              onOpenPercentiles={() => setPercentileOpen(true)}
            />
          </Suspense>
        ) : null}
      </main>

      <ScrollTopButton />
      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
      <PercentileModal open={percentileOpen} onClose={() => setPercentileOpen(false)} />
    </div>
  );
};

export default StratApp;
