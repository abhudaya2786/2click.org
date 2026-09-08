/**
 * SEO + Performance production audit tests
 * Run: node --import tsx server/tests/seoPerformanceTests.ts
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  ROUTE_SEO,
  SITEMAP_PATHS,
  SITE_URL,
  isPrivateRoute,
  resolveSeoMeta,
} from '../../src/lib/seoConfig';
import { ROUTES } from '../../src/lib/routes';

const ROOT = join(import.meta.dirname, '..', '..');
const DIST = join(ROOT, 'dist');
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

let passed = 0;
let failed = 0;
const issues: string[] = [];

function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    issues.push(msg);
    console.error(`  ✗ FAIL: ${msg}`);
  }
}

function readSrc(rel: string): string {
  const full = join(ROOT, rel);
  return existsSync(full) ? readFileSync(full, 'utf8') : '';
}

function distJsSizeKb(): { total: number; main: number; chunks: number } {
  const assets = join(DIST, 'assets');
  if (!existsSync(assets)) return { total: 0, main: 0, chunks: 0 };
  const files = readdirSync(assets).filter((f) => f.endsWith('.js'));
  let total = 0;
  let main = 0;
  for (const f of files) {
    const kb = statSync(join(assets, f)).size / 1024;
    total += kb;
    if (f.startsWith('index-')) main = kb;
  }
  return { total, main, chunks: files.length };
}

async function main() {
  console.log('\n=== SEO Audit — Meta & Config ===\n');

  assert(Object.keys(ROUTE_SEO).length >= 25, `ROUTE_SEO has ${Object.keys(ROUTE_SEO).length} entries`);
  for (const [path, meta] of Object.entries(ROUTE_SEO)) {
    assert(meta.title.length > 10, `${path} has title`);
    assert(meta.description.length > 40, `${path} has description`);
    assert(Boolean(meta.canonicalPath), `${path} has canonicalPath`);
  }

  assert(isPrivateRoute('/dashboard'), 'dashboard is private');
  assert(isPrivateRoute('/dashboard/admin'), 'admin dashboard is private');
  assert(isPrivateRoute('/dashboard/consultant'), 'consultant dashboard is private');
  assert(isPrivateRoute('/dashboard/super-admin'), 'super-admin is private');
  assert(isPrivateRoute('/marketplace'), 'marketplace is private');
  assert(isPrivateRoute('/login'), 'login is private');
  assert(resolveSeoMeta('/dashboard').robots === 'noindex, nofollow', 'dashboard noindex meta');
  assert(resolveSeoMeta('/dashboard/admin').robots === 'noindex, nofollow', 'admin noindex');
  assert(resolveSeoMeta('/unknown-page-xyz').robots === 'noindex, nofollow', '404 noindex');
  assert(resolveSeoMeta('/track/BEG-123').robots === 'noindex, nofollow', 'case track noindex');

  console.log('\n=== SEO Audit — robots.txt & sitemap ===\n');

  const robots = readSrc('public/robots.txt');
  assert(robots.includes('Disallow: /dashboard'), 'robots blocks dashboard');
  assert(robots.includes('Disallow: /marketplace'), 'robots blocks marketplace');
  assert(robots.includes('Disallow: /login'), 'robots blocks login');
  assert(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`), 'robots sitemap uses www');

  const sitemap = readSrc('public/sitemap.xml');
  assert(sitemap.includes(SITE_URL), 'sitemap uses canonical domain');
  for (const path of SITEMAP_PATHS.slice(0, 5)) {
    const loc = path === '/' ? SITE_URL : `${SITE_URL}${path}`;
    assert(sitemap.includes(loc), `sitemap contains ${path}`);
  }
  assert(!sitemap.includes('/dashboard'), 'sitemap excludes dashboard');
  assert(!sitemap.includes('/login'), 'sitemap excludes login');

  console.log('\n=== SEO Audit — index.html & PageSeo ===\n');

  const indexHtml = readSrc('index.html');
  assert(indexHtml.includes('viewport'), 'viewport meta');
  assert(indexHtml.includes('og:title'), 'Open Graph tags');
  assert(indexHtml.includes('application/ld+json'), 'JSON-LD present');
  assert(indexHtml.includes('WebSite'), 'WebSite schema');
  assert(indexHtml.includes('www.buildecogroup.com'), 'canonical domain www');

  const pageSeo = readSrc('src/components/seo/PageSeo.tsx');
  assert(pageSeo.includes('applySeoMeta'), 'PageSeo updates head');
  const app = readSrc('src/App.tsx');
  assert(app.includes('PageSeo'), 'App mounts PageSeo');

  console.log('\n=== Performance Audit — Build Artifacts ===\n');

  const sizes = distJsSizeKb();
  if (sizes.chunks > 0) {
    assert(sizes.main < 900, `main chunk ${sizes.main.toFixed(0)} KB < 900 KB`);
    assert(sizes.chunks >= 10, `code-split into ${sizes.chunks} JS chunks`);
    console.log(`  ℹ main chunk: ${sizes.main.toFixed(1)} KB | total JS: ${sizes.total.toFixed(1)} KB | chunks: ${sizes.chunks}`);
  } else {
    console.log('  ⚠ dist/ not found — run npm run build first for size metrics');
  }

  const vite = readSrc('vite.config.ts');
  assert(vite.includes('manualChunks'), 'vite manualChunks configured');

  const analytics = readSrc('src/lib/analytics.ts');
  assert(analytics.includes("import('posthog-js')"), 'PostHog dynamically imported');

  const publicLayout = readSrc('src/layouts/PublicLayout.tsx');
  assert(publicLayout.includes('lazy('), 'BuildEcoAssistant lazy loaded');

  const security = readSrc('server/middleware/securityHeaders.ts');
  assert(security.includes('fonts.googleapis.com'), 'CSP allows Google Fonts CSS');
  assert(security.includes('fonts.gstatic.com'), 'CSP allows Google Fonts files');

  const homeHero = readSrc('src/components/home/HomeHero.tsx');
  assert(homeHero.includes('fetchPriority="high"'), 'LCP hero fetchPriority');
  assert(homeHero.includes('loading="lazy"'), 'secondary hero lazy');

  console.log('\n=== HTTP Smoke — robots & sitemap ===\n');

  const robotsRes = await fetch(`${BASE}/robots.txt`);
  assert(robotsRes.ok, '/robots.txt → 200');
  const robotsLive = await robotsRes.text();
  assert(robotsLive.includes('Disallow: /dashboard'), 'live robots blocks dashboard');

  const sitemapRes = await fetch(`${BASE}/sitemap.xml`);
  assert(sitemapRes.ok, '/sitemap.xml → 200');

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (issues.length) issues.forEach((i) => console.log(`  - ${i}`));
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
