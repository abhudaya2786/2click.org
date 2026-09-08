import React, { forwardRef } from 'react';
import { cn } from '../../lib/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 4, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-[var(--color-text)]">
            {label}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          <textarea
            id={textareaId}
            ref={ref}
            rows={rows}
            className={cn(
              'block w-full rounded-lg border bg-[var(--color-surface)] px-3.5 py-2.5 text-base sm:text-sm text-[var(--color-text)] placeholder-[#838B84] transition-colors',
              'border-[var(--color-border)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--color-border-focus)]',
              'disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-subtle)] disabled:cursor-not-allowed',
              error && 'border-[#C53030] focus:border-[#C53030] focus:ring-[#C53030]',
              className
            )}
            {...props}
          />
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

Textarea.displayName = 'Textarea';
