/**
 * Responsive media URL helpers — Unsplash auto=format (WebP/AVIF) + width srcset.
 */

const DEFAULT_WIDTHS = [480, 768, 1200, 1600] as const;

export function isOptimizableUrl(url: string): boolean {
  return url.includes('images.unsplash.com');
}

export function buildOptimizedUrl(url: string, width: number, height?: number): string {
  if (!isOptimizableUrl(url)) return url;
  const u = new URL(url.split('?')[0]);
  u.searchParams.set('auto', 'format');
  u.searchParams.set('fit', 'crop');
  u.searchParams.set('w', String(width));
  u.searchParams.set('q', '80');
  if (height) u.searchParams.set('h', String(height));
  return u.toString();
}

export function buildSrcSet(url: string, widths: readonly number[] = DEFAULT_WIDTHS): string {
  return widths.map((w) => `${buildOptimizedUrl(url, w)} ${w}w`).join(', ');
}

export const HERO_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px';
export const CARD_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px';
export const THUMB_SIZES = '(max-width: 640px) 25vw, 120px';

export function aspectRatioClass(ratio?: string): string {
  switch (ratio) {
    case '16:9':
      return 'aspect-video';
    case '4:3':
      return 'aspect-[4/3]';
    case '1:1':
      return 'aspect-square';
    case '3:2':
      return 'aspect-[3/2]';
    default:
      return 'aspect-[4/3]';
  }
}
