import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  title?: string;
}

interface SelectProps {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  /** Hide the visible label (still announced to screen readers). */
  hideLabel?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  id,
  label,
  value,
  options,
  onChange,
  placeholder,
  hideLabel = false,
  className = '',
}) => (
  <div className={className}>
    <label
      htmlFor={id}
      className={
        hideLabel
          ? 'sr-only'
          : 'mb-1.5 block font-stat text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted'
      }
    >
      {label}
    </label>
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 w-full appearance-none rounded-md border border-edge bg-surface py-2 pl-3 pr-10 font-stat text-sm font-semibold text-ink transition-colors duration-150 hover:border-edge-strong"
      >
        {placeholder !== undefined && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} title={opt.title}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
        aria-hidden="true"
      />
    </div>
  </div>
);

export default Select;
