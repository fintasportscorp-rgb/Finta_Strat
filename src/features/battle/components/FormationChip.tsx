import React from 'react';
import { Check, TriangleAlert } from 'lucide-react';
import PitchGlyph from './PitchGlyph';
import type { FormationMatchup } from '../types';

interface FormationChipProps {
  matchup: FormationMatchup;
  selected: boolean;
  /** Below the confidence threshold: visible but not selectable. */
  filteredOut: boolean;
  onToggle: (formation: string) => void;
}

const FormationChip: React.FC<FormationChipProps> = ({
  matchup,
  selected,
  filteredOut,
  onToggle,
}) => {
  const { formation, battle } = matchup;
  const { win_rate: winRate, total_matches: matches } = battle.battle_summary;
  const winTone = winRate >= 50 ? 'text-win' : winRate < 45 ? 'text-loss' : 'text-ink-muted';

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-disabled={filteredOut}
      disabled={filteredOut}
      onClick={() => onToggle(formation)}
      className={`relative flex min-h-[72px] items-center gap-3 rounded-md border p-3 text-left transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? 'border-[1.5px] border-accent bg-[color-mix(in_oklch,var(--accent)_8%,var(--surface))]'
          : 'border-edge bg-surface hover:border-edge-strong'
      }`}
    >
      <PitchGlyph formation={formation} className="shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block font-stat text-base font-bold text-ink">{formation}</span>
        <span className={`block font-stat text-[13px] font-semibold ${winTone}`}>
          W {winRate.toFixed(1)}%
        </span>
        <span className="flex items-center gap-1 font-stat text-xs uppercase tracking-[0.05em] text-ink-muted">
          n={matches}
          {matches < 30 && (
            <TriangleAlert className="size-3 text-draw" aria-label="Low sample size" />
          )}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
          selected ? 'border-accent bg-accent text-on-accent' : 'border-edge-strong'
        }`}
      >
        {selected && <Check className="size-3" strokeWidth={3} />}
      </span>
    </button>
  );
};

export default React.memo(FormationChip);
