/**
 * BuildEco journey section smoke tests
 * Run: node --import tsx server/tests/buildEcoJourneyTests.ts
 */
import { BUILD_ECO_JOURNEY_STEPS } from '../../src/lib/buildEcoJourney';
import { ICON_COMPONENTS } from '../../src/lib/iconSystem';
import { PRIMARY_CTA_ROUTE } from '../../src/lib/homeGoals';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${msg}`);
  }
}

async function fetchRoute(path: string) {
  const res = await fetch(`${BASE}${path}`);
  const html = await res.text();
  return { status: res.status, html };
}

async function main() {
  console.log('\n=== BuildEco Journey Tests ===\n');

  assert(BUILD_ECO_JOURNEY_STEPS.length === 9, 'Journey has 9 steps');

  const ids = BUILD_ECO_JOURNEY_STEPS.map((s) => s.id);
  assert(new Set(ids).size === 9, 'All step ids are unique');

  for (const step of BUILD_ECO_JOURNEY_STEPS) {
    assert(Boolean(step.titleEn && step.titleHi), `${step.id} has EN/HI titles`);
    assert(Boolean(step.descEn && step.descHi), `${step.id} has EN/HI descriptions`);
    assert(Boolean(step.ctaEn && step.ctaHi), `${step.id} has EN/HI CTAs`);
    assert(step.route.startsWith('/'), `${step.id} route is app path`);
    assert(Boolean(ICON_COMPONENTS[step.icon]), `${step.id} icon token "${step.icon}" resolves`);
  }

  const needStep = BUILD_ECO_JOURNEY_STEPS[0];
  assert(needStep.route === PRIMARY_CTA_ROUTE, 'Step 1 links to primary CTA route');

  const routes = [...new Set(BUILD_ECO_JOURNEY_STEPS.map((s) => s.route))];
  for (const route of routes) {
    const { status } = await fetchRoute(route);
    assert(status === 200, `Journey route ${route} → 200`);
  }

  const { status, html } = await fetchRoute('/');
  assert(status === 200, 'Homepage HTTP 200');
  assert(html.includes('root'), 'Homepage SPA shell');

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
