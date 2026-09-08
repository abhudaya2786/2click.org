import React from 'react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'text-center py-12 px-6 rounded-2xl border border-dashed border-[#D4D7CF] bg-[var(--color-background)]',
        className
      )}
    >
      {icon && (
        <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] mb-4">
          {icon}
        </div>
      )}
      <h4 className="text-lg font-bold text-[var(--color-text)]">{title}</h4>
      <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto mt-1.5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
