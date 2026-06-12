import React, { useId, useState } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  text: string;
  /** Optional accessible label for the trigger; defaults to the tooltip text. */
  label?: string;
}

/**
 * Info-icon tooltip that works for hover, keyboard focus AND tap
 * (click toggles it — required for touch devices).
 */
const Tooltip: React.FC<TooltipProps> = ({ text, label }) => {
  const id = useId();
  const [pinned, setPinned] = useState(false);

  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={label ?? text}
        aria-describedby={id}
        aria-expanded={pinned}
        onClick={(e) => {
          e.stopPropagation();
          setPinned((p) => !p);
        }}
        onBlur={() => setPinned(false)}
        className="inline-flex size-5 items-center justify-center rounded-full text-ink-muted transition-colors duration-150 hover:text-accent"
      >
        <Info className="size-3.5" aria-hidden="true" />
      </button>
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-md border border-edge bg-raised p-2.5 text-left text-xs font-normal normal-case tracking-normal text-ink shadow-raised transition-opacity duration-150 ${
          pinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
        }`}
      >
        {text}
      </span>
    </span>
  );
};

export default Tooltip;
