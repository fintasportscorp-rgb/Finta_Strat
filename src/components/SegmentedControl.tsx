import React from 'react';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: Array<SegmentOption<T>>;
  onChange: (value: T) => void;
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedControlProps<T>): React.ReactElement {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-md border border-edge bg-canvas p-0.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`min-h-10 flex-1 whitespace-nowrap rounded-[6px] px-3 font-stat text-xs font-semibold uppercase tracking-[0.05em] transition-colors duration-200 ${
              active ? 'bg-accent text-on-accent' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
