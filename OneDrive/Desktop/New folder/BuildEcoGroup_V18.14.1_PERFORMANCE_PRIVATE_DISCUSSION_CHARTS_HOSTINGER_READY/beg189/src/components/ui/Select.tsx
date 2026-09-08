import React, { forwardRef } from 'react';
import { cn } from '../../lib/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, helperText, placeholder, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-[var(--color-text)]">
            {label}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'block w-full appearance-none rounded-lg border bg-[var(--color-surface)] px-3.5 py-2.5 pr-10 text-base sm:text-sm text-[var(--color-text)] transition-colors',
              'border-[var(--color-border)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--color-border-focus)]',
              'disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-subtle)] disabled:cursor-not-allowed',
              error && 'border-[#C53030] focus:border-[#C53030] focus:ring-[#C53030]',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="text-xs text-[#C53030] mt-1 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
