import React from 'react';
import { TriangleAlert } from 'lucide-react';

interface ConfidenceBadgeProps {
  matches: number;
}

/**
 * Sample-size warning pill. Hidden when n >= 30; amber below 30, red below 10.
 * Text carries the meaning — color is never the only signal.
 */
const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ matches }) => {
  if (matches >= 30) return null;
  const severe = matches < 10;
  const tone = severe ? 'border-loss text-loss bg-loss/10' : 'border-draw text-draw bg-draw/10';

  return (
    <span
      className={`inline-flex h-6 items-center gap-1 rounded-full border px-2.5 font-stat text-[11px] font-semibold uppercase ${tone}`}
      title={`Only ${matches} matches in the sample — interpret with caution (30+ recommended).`}
    >
      <TriangleAlert className="size-3" aria-hidden="true" />
      {severe ? `very low · n=${matches}` : `low sample · n=${matches}`}
    </span>
  );
};

export default ConfidenceBadge;
