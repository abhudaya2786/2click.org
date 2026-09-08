import React from 'react';
import { cn } from '../../lib/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'brown' | 'neutral' | 'success' | 'warning' | 'outline' | 'danger';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  icon,
  children,
  ...props
}) => {
  const variants = {
    primary: 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border border-[var(--color-primary-border)]',
    brown: 'bg-[var(--color-brand-brown-subtle)] text-[var(--color-brand-brown)] border border-[var(--color-brand-brown-border)]',
    neutral: 'bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]',
    success: 'bg-[var(--color-success-subtle)] text-[var(--color-success)] border border-[#C2E7CE]',
    warning: 'bg-[var(--color-warning-subtle)] text-[#92400E] border border-[#FDE68A]',
    outline: 'bg-transparent text-[var(--color-text-muted)] border border-[var(--color-border-strong)]',
    danger: 'bg-[var(--color-danger-subtle)] text-[#991B1B] border border-[#FECACA]',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium tracking-wide',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-sans-main whitespace-nowrap transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
