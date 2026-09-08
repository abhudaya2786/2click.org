import React, { forwardRef } from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'brown' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none';

    const variants = {
      primary:
        'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-sm focus-visible:ring-[var(--color-primary)] active:bg-[var(--color-primary-active)]',
      secondary:
        'bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-text)] border border-[var(--color-border)] focus-visible:ring-[var(--color-primary)]',
      brown:
        'bg-[var(--color-brand-brown)] hover:bg-[var(--color-brand-brown-hover)] text-white shadow-sm focus-visible:ring-[var(--color-brand-brown)] active:bg-[var(--color-brand-brown-dark)]',
      outline:
        'border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)] bg-transparent focus-visible:ring-[var(--color-primary)]',
      ghost:
        'bg-transparent hover:bg-[var(--color-surface-muted)] text-[var(--color-text)] focus-visible:ring-[var(--color-primary)]',
      danger:
        'bg-[var(--color-danger)] hover:bg-[#A82525] text-white shadow-sm focus-visible:ring-[var(--color-danger)]',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
      md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2',
      lg: 'text-base px-6 py-3 min-h-[48px] gap-2.5 font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" className={variant === 'primary' || variant === 'brown' || variant === 'danger' ? 'text-white' : 'text-[var(--color-primary)]'} />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
