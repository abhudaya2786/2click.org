import type { SeoMeta } from './seoConfig';
import { canonicalUrl } from './seoConfig';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string) {
  const existing = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!href) {
    existing?.remove();
    return;
  }
  let el = existing;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function applySeoMeta(pathname: string, meta: SeoMeta): void {
  document.title = meta.title;

  upsertMeta('name', 'description', meta.description);
  upsertMeta('name', 'robots', meta.robots ?? 'index, follow');

  const url = canonicalUrl(pathname, meta);
  upsertLink('canonical', meta.robots === 'noindex, nofollow' ? '' : url);

  upsertMeta('property', 'og:title', meta.title);
  upsertMeta('property', 'og:description', meta.description);
  upsertMeta('property', 'og:url', url);
  upsertMeta('property', 'og:type', meta.ogType ?? 'website');
  upsertMeta('property', 'og:site_name', 'BuildEcoGroup');

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', meta.title);
  upsertMeta('name', 'twitter:description', meta.description);
}
