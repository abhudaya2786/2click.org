/**
 * Icon System — registry integrity + key page smoke tests
 * Run: node --import tsx server/tests/iconSystemTests.ts
 */
import {
  ICON_COMPONENTS,
  ICON_LABELS,
  ICON_SIZES,
  ICON_STROKE,
  IconToken,
  iconTokenFromGoalId,
  iconTokenFromLucideName,
  iconTokenFromServiceId,
  DEV_ROLE_ICON,
} from '../../src/lib/iconSystem';
import { SERVICE_PHOTO_PROMPTS } from '../../src/lib/mediaAssets';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

const REQUIRED_TOKENS: IconToken[] = [
  'construction', 'land', 'property', 'gis', 'solar', 'interior', 'renovation',
  'material', 'boq', 'consultant', 'vendor', 'caseId', 'tracking', 'messages',
  'documents', 'notification', 'profile', 'dashboard', 'location', 'budget',
  'timeline', 'compare', 'approval', 'verified', 'security', 'help', 'copilot',
  'search', 'upload', 'download',
];

const KEY_PAGES = ['/', '/services', '/consultants', '/login', '/initiate-project', '/track'];

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

async function main() {
  console.log('\n=== Icon System — Registry Integrity ===\n');

  assert(ICON_STROKE === 1.75, `ICON_STROKE is ${ICON_STROKE}`);
  assert(ICON_SIZES.md === 20, 'ICON_SIZES.md is 20px');

  for (const token of REQUIRED_TOKENS) {
    assert(Boolean(ICON_COMPONENTS[token]), `ICON_COMPONENTS has ${token}`);
    assert(Boolean(ICON_LABELS[token]?.en), `ICON_LABELS en for ${token}`);
    assert(Boolean(ICON_LABELS[token]?.hi), `ICON_LABELS hi for ${token}`);
  }

  assert(iconTokenFromServiceId('construction') === 'construction', 'serviceId construction');
  assert(iconTokenFromServiceId('solar') === 'solar', 'serviceId solar');
  assert(iconTokenFromGoalId('build') === 'construction', 'goalId build → construction');
  assert(iconTokenFromGoalId('track') === 'tracking', 'goalId track → tracking');
  assert(iconTokenFromLucideName('HardHat') === 'construction', 'Lucide HardHat → construction');
  assert(iconTokenFromLucideName('Unknown') === 'construction', 'unknown Lucide falls back');

  for (const role of Object.keys(DEV_ROLE_ICON)) {
    const token = DEV_ROLE_ICON[role];
    assert(Boolean(ICON_COMPONENTS[token]), `DEV_ROLE_ICON ${role} → ${token}`);
  }

  for (const prompt of Object.values(SERVICE_PHOTO_PROMPTS)) {
    for (const att of prompt.recommendedAttachments) {
      assert(Boolean(ICON_COMPONENTS[att.iconToken]), `photo prompt ${prompt.serviceKey}: ${att.label}`);
    }
  }

  console.log('\n=== Icon System — Page Smoke (desktop shell) ===\n');

  for (const path of KEY_PAGES) {
    try {
      const res = await fetch(`${BASE}${path}`);
      const html = await res.text();
      assert(res.ok, `${path} returns ${res.status}`);
      assert(html.includes('root') || html.includes('<!DOCTYPE'), `${path} serves HTML shell`);
    } catch (err) {
      assert(false, `${path} reachable (${(err as Error).message})`);
    }
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) process.exit(1);
}

main();
