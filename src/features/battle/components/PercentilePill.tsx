import React from 'react';
import { goodness, percentileBand } from '../metrics';

interface PercentilePillProps {
  percentile: number;
  metric: string;
}

const BAND_CLASSES: Record<string, string> = {
  'major-weakness': 'text-loss bg-[color-mix(in_oklch,var(--loss)_14%,transparent)]',
  'below-avg': 'text-band-below bg-[color-mix(in_oklch,var(--band-below)_14%,transparent)]',
  average: 'text-ink-muted',
  'above-avg': 'text-band-above bg-[color-mix(in_oklch,var(--band-above)_14%,transparent)]',
  'major-strength': 'text-win bg-[color-mix(in_oklch,var(--win)_14%,transparent)]',
};

/**
 * Percentile badge colored by "goodness" (inverted metrics flipped) while
 * always displaying the raw percentile. ▲/▼ add shape redundancy at extremes.
 */
const PercentilePill: React.FC<PercentilePillProps> = ({ percentile, metric }) => {
  const g = goodness(percentile, metric);
  const band = percentileBand(g);

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-sm px-1 py-0.5 font-stat text-[11px] font-semibold ${BAND_CLASSES[band]}`}
    >
      {g >= 90 && <span aria-hidden="true">▲</span>}
      {g <= 10 && <span aria-hidden="true">▼</span>}
      P{percentile.toFixed(0)}
    </span>
  );
};

export default PercentilePill;
