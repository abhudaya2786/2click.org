import React from 'react';
import { cn } from '../../lib/cn';
import { PageHeroMedia } from '../ui/ResponsiveMedia';
import { getPageHeroAssetKey } from '../../lib/mediaAssets';

export interface PageVisualHeroProps {
  pageKey: string;
  badge?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}

/**
 * Architectural split hero — editorial white panel, navy accent, contextual photo.
 */
export const PageVisualHero: React.FC<PageVisualHeroProps> = ({
  pageKey,
  badge,
  title,
  subtitle,
  actions,
  aside,
  className,
}) => {
  const assetKey = getPageHeroAssetKey(pageKey);

  return (
    <section className={cn('arch-hero-engineering pt-10 pb-14', className)}>
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8 pl-6 sm:pl-8">
        {badge && <div className="mb-4">{badge}</div>}

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[var(--color-text)] sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {subtitle && (
              <p className="max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)]">{subtitle}</p>
            )}
            {actions && <div className="flex flex-wrap items-center gap-3 pt-1">{actions}</div>}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <PageHeroMedia assetKey={assetKey} className="rounded-2xl border border-[var(--color-border)] shadow-lg" />
            {aside}
          </div>
        </div>
      </div>
    </section>
  );
};
