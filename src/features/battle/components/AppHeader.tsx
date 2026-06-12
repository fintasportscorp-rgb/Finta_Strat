import React from 'react';
import { CircleHelp, Percent, Pencil } from 'lucide-react';
import ThemeToggle from '~components/ThemeToggle';
import LangSelect from '~components/LangSelect';
import { useI18n } from '@/lib/i18n';

interface AppHeaderProps {
  /** Matchup ribbon text, shown once an analysis exists. */
  matchupLabel: string | null;
  sampleCount: number;
  onEditMatchup: () => void;
  onOpenGuide: () => void;
  onOpenPercentiles: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  matchupLabel,
  sampleCount,
  onEditMatchup,
  onOpenGuide,
  onOpenPercentiles,
}) => {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-edge bg-canvas/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-2 px-4 md:px-6 lg:px-8">
        <a href="/" className="flex shrink-0 items-center">
          <img src="/logo.png" alt="Finta Strat" className="h-12 w-auto" />
        </a>

        {matchupLabel && (
          <button
            type="button"
            onClick={onEditMatchup}
            className="mx-auto hidden min-h-11 items-center gap-2 rounded-md border border-edge bg-surface px-3 font-stat text-xs font-semibold uppercase tracking-[0.05em] text-ink-muted transition-colors duration-200 hover:border-accent hover:text-ink sm:flex"
          >
            <span className="text-ink">vs {matchupLabel}</span>
            <span aria-hidden="true">·</span>
            <span>×{sampleCount}</span>
            <Pencil className="size-3.5 text-accent" aria-hidden="true" />
          </button>
        )}

        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={onOpenGuide}
            aria-label={t('header.howToUse')}
            title={t('header.howToUse')}
            className="flex size-11 items-center justify-center rounded-md text-ink-muted transition-colors duration-200 hover:bg-raised hover:text-ink"
          >
            <CircleHelp className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onOpenPercentiles}
            aria-label={t('header.percentiles')}
            title={t('header.percentiles')}
            className="flex size-11 items-center justify-center rounded-md text-ink-muted transition-colors duration-200 hover:bg-raised hover:text-ink"
          >
            <Percent className="size-5" aria-hidden="true" />
          </button>
          <LangSelect />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
