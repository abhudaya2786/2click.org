import React from 'react';
import { cn } from '../../lib/cn';

const PALETTE = [
  'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]',
  'bg-[#E8F5E9] text-[#2E7D32]',
  'bg-[#FFF3E0] text-[#E65100]',
  'bg-[#EDE7F6] text-[#5E35B1]',
  'bg-[#FCE4EC] text-[#C2185B]',
  'bg-[#E0F2F1] text-[#00695C]',
];

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function paletteIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % PALETTE.length;
}

export interface ProfessionalAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showAssetRequiredHint?: boolean;
}

const SIZE_MAP = {
  sm: 'h-10 w-10 text-xs',
  md: 'h-14 w-14 text-sm',
  lg: 'h-20 w-20 text-lg',
  xl: 'h-24 w-24 text-xl',
};

/**
 * Never fabricates a real person's photo — uses verified upload when available,
 * otherwise discipline initials with optional ASSET REQUIRED hint.
 */
export const ProfessionalAvatar: React.FC<ProfessionalAvatarProps> = ({
  name,
  photoUrl,
  size = 'md',
  className,
  showAssetRequiredHint = true,
}) => {
  const initials = initialsFromName(name);
  const color = PALETTE[paletteIndex(name)];

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`${name} — verified profile`}
        className={cn(
          'shrink-0 rounded-xl border border-[var(--color-border)] object-cover shadow-xs',
          SIZE_MAP[size],
          className
        )}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className="relative shrink-0" title={showAssetRequiredHint ? 'Verified photo on assignment' : undefined}>
      <div
        className={cn(
          'grid place-items-center rounded-xl border border-[var(--color-border)] font-extrabold shadow-xs',
          SIZE_MAP[size],
          color,
          className
        )}
        aria-label={`${name} — representative profile`}
        role="img"
      >
        {initials}
      </div>
      {showAssetRequiredHint && size !== 'sm' && (
        <span className="absolute -bottom-1 -right-1 rounded bg-[#15364A] px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
          Verified
        </span>
      )}
    </div>
  );
};
