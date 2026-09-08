import React from 'react';
import { cn } from '../../lib/cn';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'compact' | 'narrow' | 'full';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  className,
  size = 'default',
  children,
  ...props
}) => {
  const sizeClasses = {
    default: 'max-w-[1340px]',
    compact: 'max-w-[1100px]',
    narrow: 'max-w-[860px]',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
