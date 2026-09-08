/**
 * Homepage goal CTA smoke tests
 * Run: node --import tsx server/tests/homeGoalCtaTests.ts
 */
import { HOME_GOALS, PRIMARY_CTA_ROUTE } from '../../src/lib/homeGoals';

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
  console.log('\n=== Homepage Goal CTA Tests ===\n');

  const { status, html } = await fetchRoute('/');
  assert(status === 200, 'Homepage HTTP 200');
  assert(html.includes('root'), 'Homepage SPA shell');

  // Primary CTA route
  const primary = await fetchRoute(PRIMARY_CTA_ROUTE);
  assert(primary.status === 200, `${PRIMARY_CTA_ROUTE} (START MY REQUIREMENT) → 200`);

  // Each goal tile destination
  for (const goal of HOME_GOALS) {
    const path = goal.route.startsWith('http') ? goal.route.replace(BASE, '') : goal.route;
    const { status: s, html: h } = await fetchRoute(path);
    assert(s === 200, `Goal "${goal.label}" → ${path} → 200`);
    assert(h.includes('root'), `Goal "${goal.label}" → SPA shell`);
  }

  // Initiate-project with each service param pre-selects correctly (page loads)
  const services = ['construction', 'land', 'solar', 'interior', 'boq'];
  for (const svc of services) {
    const path = `/initiate-project?service=${svc}`;
    const { status: s } = await fetchRoute(path);
    assert(s === 200, `Initiate prefill service=${svc} → 200`);
  }

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
