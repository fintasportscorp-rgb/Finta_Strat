import React from 'react';
import {
  Crosshair,
  Hand,
  LayoutDashboard,
  Layers,
  Route,
  Shield,
  SlidersHorizontal,
  ArrowRightLeft,
  CircleDot,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import type { CategoryKey } from '../types';

export type NavKey = 'setup' | CategoryKey;

interface NavItem {
  key: NavKey;
  labelKey: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'setup', labelKey: 'nav.setup', icon: SlidersHorizontal },
  { key: 'summary', labelKey: 'nav.overview', icon: LayoutDashboard },
  { key: 'shooting', labelKey: 'tabs.shooting', icon: Crosshair },
  { key: 'creation', labelKey: 'tabs.creation', icon: Zap },
  { key: 'passing', labelKey: 'tabs.passing', icon: ArrowRightLeft },
  { key: 'pass_types', labelKey: 'tabs.passTypes', icon: Route },
  { key: 'possession', labelKey: 'tabs.possession', icon: CircleDot },
  { key: 'defensive', labelKey: 'tabs.defensive', icon: Shield },
  { key: 'goalkeeping', labelKey: 'tabs.goalkeeping', icon: Hand },
  { key: 'miscellaneous', labelKey: 'tabs.miscellaneous', icon: Layers },
];

interface NavRailProps {
  active: NavKey;
  /** Category items stay disabled until an analysis has been run. */
  analysisReady: boolean;
  onSelect: (key: NavKey) => void;
}

/**
 * Desktop (≥1024px): fixed left rail.
 * Mobile: horizontal scroll-snap pill bar under the header — all 10 tabs
 * stay one swipe away (no hamburger drawer).
 */
const NavRail: React.FC<NavRailProps> = ({ active, analysisReady, onSelect }) => {
  const { t } = useI18n();

  const renderButton = (item: NavItem, variant: 'rail' | 'pill'): React.ReactElement => {
    const disabled = item.key !== 'setup' && !analysisReady;
    const isActive = active === item.key;
    const Icon = item.icon;
    const base =
      variant === 'rail'
        ? `relative flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition-colors duration-200 ${
            isActive
              ? 'bg-raised text-ink before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-accent'
              : 'text-ink-muted hover:bg-raised hover:text-ink'
          }`
        : `flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-4 font-stat text-xs font-semibold uppercase tracking-[0.05em] transition-colors duration-200 ${
            isActive
              ? 'border-accent bg-accent text-on-accent'
              : 'border-edge bg-surface text-ink-muted hover:text-ink'
          }`;

    return (
      <button
        key={item.key}
        type="button"
        onClick={() => onSelect(item.key)}
        disabled={disabled}
        aria-current={isActive ? 'page' : undefined}
        className={`${base} disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <Icon
          className={`size-5 shrink-0 ${isActive && variant === 'rail' ? 'text-accent' : ''}`}
          aria-hidden="true"
        />
        {t(item.labelKey)}
      </button>
    );
  };

  return (
    <>
      {/* Desktop rail */}
      <nav
        aria-label={t('nav.navigation')}
        className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col gap-1 border-r border-edge bg-surface px-3 pb-4 pt-4 lg:flex"
      >
        <a href="/" className="mb-3 flex shrink-0 items-center px-3">
          <img src="/logo.png" alt="Finta Strat" className="h-12 w-auto" />
        </a>
        <p className="display-caps mb-1 px-3 text-[11px] font-bold text-ink-muted">
          {t('nav.navigation')}
        </p>
        {NAV_ITEMS.map((item) => renderButton(item, 'rail'))}
        <p className="mt-auto px-3 font-stat text-[11px] text-ink-muted">{t('app.version')}</p>
      </nav>

      {/* Mobile pill bar */}
      <nav
        aria-label={t('nav.navigation')}
        className="no-scrollbar sticky top-14 z-30 flex snap-x gap-2 overflow-x-auto border-b border-edge bg-canvas/90 px-4 py-2 backdrop-blur-sm lg:hidden"
      >
        {NAV_ITEMS.map((item) => renderButton(item, 'pill'))}
      </nav>
    </>
  );
};

export default NavRail;
