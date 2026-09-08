import { SITEMAP_PATHS, SITE_URL } from '../../src/lib/seoConfig';

const LASTMOD = '2026-09-05';

const priorityFor = (path: string): string => {
  if (path === '/') return '1.0';
  if (['/land-development', '/construction-management', '/boq-estimation', '/initiate-project'].includes(path)) return '0.9';
  if (['/consultants', '/property', '/services', '/solar'].includes(path)) return '0.85';
  return '0.7';
};

const changefreqFor = (path: string): string => (path === '/' ? 'weekly' : 'monthly');

const urls = SITEMAP_PATHS.map(
  (path) => `  <url>
    <loc>${SITE_URL}${path === '/' ? '' : path}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${changefreqFor(path)}</changefreq>
    <priority>${priorityFor(path)}</priority>
  </url>`,
);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

process.stdout.write(xml);
