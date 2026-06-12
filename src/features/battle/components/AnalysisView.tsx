import React from 'react';
import { useI18n } from '@/lib/i18n';
import { tierLabelKeys } from '../metrics';
import type { CategoryKey, FormationMatchup } from '../types';
import type { MatchupConfig } from '../StratApp';
import OverviewTab from './OverviewTab';
import CategoryTab from './CategoryTab';

interface AnalysisViewProps {
  comparison: FormationMatchup[];
  category: CategoryKey;
  config: MatchupConfig;
  onOpenPercentiles: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({
  comparison,
  category,
  config,
  onOpenPercentiles,
}) => {
  const { t } = useI18n();

  return (
    <div className="rise-in flex flex-col gap-4 md:gap-6">
      <header>
        <h1 className="display-caps text-2xl font-extrabold text-ink md:text-[2rem]">
          {t('analysis.title')}{' '}
          <span className="text-accent">
            vs {config.oppFormation} · {t(tierLabelKeys[config.oppTier])}
          </span>
        </h1>
        <p className="mt-1 font-stat text-sm text-ink-muted">
          ×{comparison.length} · {t(tierLabelKeys[config.yourTier])}
        </p>
      </header>

      {category === 'summary' ? (
        <OverviewTab comparison={comparison} />
      ) : (
        <CategoryTab
          comparison={comparison}
          category={category}
          onOpenPercentiles={onOpenPercentiles}
        />
      )}
    </div>
  );
};

export default AnalysisView;
