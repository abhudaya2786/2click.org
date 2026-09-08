import React from 'react';
import { cn } from '../../lib/cn';
import type { MediaAsset } from '../../lib/mediaAssets';
import { getMediaAsset } from '../../lib/mediaAssets';
import {
  aspectRatioClass,
  buildOptimizedUrl,
  buildSrcSet,
  CARD_SIZES,
  HERO_SIZES,
} from '../../lib/mediaUrl';
import { AppIcon } from './AppIcon';
import type { IconToken } from '../../lib/iconSystem';

export interface ResponsiveMediaProps {
  assetKey?: string;
  asset?: MediaAsset;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  aspectRatio?: MediaAsset['aspectRatio'];
  sizes?: string;
  overlay?: React.ReactNode;
  caption?: React.ReactNode;
  showBadge?: boolean;
}

export const ResponsiveMedia: React.FC<ResponsiveMediaProps> = ({
  assetKey,
  asset: assetProp,
  priority = false,
  className,
  imageClassName,
  aspectRatio,
  sizes = CARD_SIZES,
  overlay,
  caption,
  showBadge = true,
}) => {
  const asset = assetProp ?? (assetKey ? getMediaAsset(assetKey) : undefined);

  if (!asset || asset.status === 'asset_required' || !asset.url) {
    return (
      <AssetRequiredPanel
        title={asset?.title ?? 'Visual asset pending'}
        className={className}
        iconToken={(asset?.fallbackIcon as IconToken) ?? 'documents'}
      />
    );
  }

  const desktopUrl = asset.url;
  const mobileUrl = asset.mobileUrl ?? buildOptimizedUrl(desktopUrl, 768, 576);
  const aspect = aspectRatioClass(aspectRatio ?? asset.aspectRatio);

  return (
    <figure className={cn('beg-media-frame overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]', className)}>
      <div className={cn('relative w-full overflow-hidden', aspect)}>
        <picture>
          <source media="(max-width: 768px)" srcSet={buildSrcSet(mobileUrl, [480, 768])} sizes={sizes} />
          <img
            src={buildOptimizedUrl(desktopUrl, 1200)}
            srcSet={buildSrcSet(desktopUrl)}
            sizes={sizes}
            alt={asset.altText}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            className={cn(
              'beg-context-photo beg-photo-motion h-full w-full object-cover',
              imageClassName
            )}
            style={{ objectPosition: asset.objectPosition ?? 'center' }}
            referrerPolicy="no-referrer"
            onError={(event) => {
              const image = event.currentTarget;
              if (!image.src.endsWith('/assets/marketing/buildeco-eco-villa-hero-v1812.png')) {
                image.removeAttribute('srcset');
                image.src = '/assets/marketing/buildeco-eco-villa-hero-v1812.png';
              }
            }}
          />
        </picture>
        {showBadge && asset.badge && (
          <div className="absolute top-3 left-3 rounded-full border border-white/20 bg-[#191C1A]/80 px-3 py-1 text-[11px] font-mono font-bold text-white backdrop-blur-sm">
            {asset.badge}
          </div>
        )}
        {overlay}
      </div>
      {caption && (
        <figcaption className="px-3 py-2 text-[11px] text-[var(--color-text-muted)]">{caption}</figcaption>
      )}
    </figure>
  );
};

export const AssetRequiredPanel: React.FC<{
  title: string;
  className?: string;
  iconToken?: IconToken;
}> = ({ title, className, iconToken = 'documents' }) => (
  <div
    className={cn(
      'flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[var(--color-primary-border)] bg-[var(--color-background)] p-6 text-center',
      className
    )}
    role="img"
    aria-label={`${title} — asset required`}
  >
    <AppIcon name={iconToken} size="lg" decorative className="text-[var(--color-primary)]" />
    <div>
      <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-brand-brown)]">ASSET REQUIRED</p>
      <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{title}</p>
    </div>
  </div>
);

export const PageHeroMedia: React.FC<{
  assetKey: string;
  className?: string;
}> = ({ assetKey, className }) => (
  <ResponsiveMedia
    assetKey={assetKey}
    priority
    sizes={HERO_SIZES}
    className={cn('shadow-lg', className)}
    imageClassName="object-cover"
  />
);
