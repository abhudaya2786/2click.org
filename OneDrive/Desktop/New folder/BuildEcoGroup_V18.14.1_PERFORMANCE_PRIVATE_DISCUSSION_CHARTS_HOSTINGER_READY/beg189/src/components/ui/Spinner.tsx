import React from 'react';
import { cn } from '../../lib/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div
      role="status"
      aria-label="loading"
      className={cn(
        'inline-block animate-spin rounded-full border-solid border-current border-t-transparent',
        sizes[size],
        className
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
