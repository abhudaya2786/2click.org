import React from 'react';
import { cn } from '../../lib/cn';

export interface BuildEcoGroupLogoProps {
  /**
   * 'full': Full logo with tagline
   * 'compact': Same asset, slightly shorter height (nav headers)
   * 'mark' | 'symbol': Compact mark for tight spaces
   */
  variant?: 'full' | 'compact' | 'mark' | 'symbol';
  theme?: 'light' | 'dark';
  className?: string;
  showTagline?: boolean;
  alt?: string;
}

const LOGO_SRC = '/logo.png';

export const BuildEcoGroupLogo: React.FC<BuildEcoGroupLogoProps> = ({
  variant = 'full',
  theme = 'light',
  className,
  showTagline = true,
  alt = 'BuildEcoGroup — Plan · Build · Sustain',
}) => {
  const isMark = variant === 'mark' || variant === 'symbol';
  const isCompact = variant === 'compact' || !showTagline;

  if (isMark) {
    return (
      <img
        src={LOGO_SRC}
        alt={alt}
        className={cn(
          'h-10 w-auto max-w-[3rem] shrink-0 select-none object-contain object-left contrast-[1.08] saturate-[1.05]',
          className
        )}
        loading="eager"
        decoding="async"
      />
    );
  }

  return (
    <span
      className={cn(
        'relative inline-block shrink-0 overflow-hidden align-middle',
        isCompact ? 'h-9 sm:h-11' : 'h-11 sm:h-14',
        className
      )}
      style={{ aspectRatio: '4.84 / 1' }}
    >
      <img
        src={LOGO_SRC}
        alt={alt}
        className="absolute left-[-35%] top-[-51%] h-[205%] w-auto max-w-none select-none object-contain contrast-[1.1] saturate-[1.06]"
        loading="eager"
        decoding="async"
      />
    </span>
  );
};
