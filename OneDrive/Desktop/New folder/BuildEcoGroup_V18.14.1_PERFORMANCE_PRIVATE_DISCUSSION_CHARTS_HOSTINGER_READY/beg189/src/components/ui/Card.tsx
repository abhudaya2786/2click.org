import React from 'react';
import { cn } from '../../lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'surface' | 'outlined' | 'interactive';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  hoverEffect = false,
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm',
    surface: 'bg-[var(--color-surface-muted)] border border-[var(--color-border)]',
    outlined: 'bg-transparent border border-[var(--color-border-strong)]',
    interactive:
      'bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm hover:border-[var(--color-primary)]/40 hover:shadow-md transition-all duration-200 cursor-pointer',
  };

  return (
    <div
      className={cn(
        'rounded-xl p-5 sm:p-6 transition-all duration-200',
        variants[variant],
        hoverEffect && 'hover:translate-y-[-2px] hover:shadow-md hover:border-[var(--color-brand-brown)]/30',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
