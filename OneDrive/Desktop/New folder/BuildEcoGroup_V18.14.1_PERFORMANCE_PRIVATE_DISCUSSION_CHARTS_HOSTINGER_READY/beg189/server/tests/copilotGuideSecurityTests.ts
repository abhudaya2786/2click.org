/**
 * Copilot context guide — security & privacy tests
 * Run: node --import tsx server/tests/copilotGuideSecurityTests.ts
 */
import {
  buildCopilotGuide,
  detectGuideIntent,
  getVisibleCasesForUser,
} from '../copilotGuide';
import { store } from '../store';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

const SEED = {
  caseOwner: 'aditya.vardhan@ecoventures.in',
  otherCustomer: 'customer.test@example.com',
  caseId: 'BEG-4092',
};

function devMockToken(email: string): string {
  const payload = JSON.stringify({
    email,
    uid: `uid-dev-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
    ts: Date.now(),
  });
  return `dev-mock-token:${Buffer.from(payload).toString('base64')}`;
}

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

async function sessionLogin(email: string) {
  const res = await fetch(`${BASE}/api/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, idToken: devMockToken(email) }),
  });
  const cookie = res.headers.get('set-cookie') || '';
  return { ok: res.ok, cookie };
}

async function guideApi(message: string, cookie?: string, activeCaseRef?: string) {
  const res = await fetch(`${BASE}/api/assistant/guide`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify({ message, activeCaseRef }),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function main() {
  console.log('\n=== Copilot Guide Security Tests ===\n');

  const visitor = await guideApi('mera case kaha tak pahucha');
  assert(visitor.status === 401, 'Visitor → POST /assistant/guide → 401');

  const ownerLogin = await sessionLogin(SEED.caseOwner);
  assert(ownerLogin.ok, 'Case owner session login');

  const ownerGuide = await guideApi('mera case kaha tak pahucha', ownerLogin.cookie);
  assert(ownerGuide.status === 200, 'Owner → guide → 200');
  assert(ownerGuide.data.mode === 'context', 'Owner → mode=context');
  assert(typeof ownerGuide.data.reply === 'string' && ownerGuide.data.reply.length > 10, 'Owner → reply from server');
  assert(
    ownerGuide.data.reply.includes(SEED.caseId) || ownerGuide.data.intent === 'pick_case',
    'Owner guide references real case or asks to pick',
  );
  assert(Array.isArray(ownerGuide.data.actions), 'Owner → suggested actions array');

  const boqGuide = await guideApi('mera BOQ ready hai?', ownerLogin.cookie, ownerGuide.data.activeCaseRef);
  assert(boqGuide.status === 200, 'Owner → BOQ question → 200');
  assert(
    /BOQ|boq|नहीं|not/i.test(boqGuide.data.reply),
    'BOQ answer mentions BOQ or states unavailable (no hallucination)',
  );

  const nextGuide = await guideApi('agla step kya hai', ownerLogin.cookie, ownerGuide.data.activeCaseRef);
  assert(nextGuide.status === 200, 'Owner → next step → 200');
  assert(/Next|अगला|status|स्थिति/i.test(nextGuide.data.reply), 'Next step guidance present');

  const solarGuide = await guideApi('mujhe solar lagwana hai', ownerLogin.cookie);
  assert(solarGuide.status === 200, 'Owner → solar intent → 200');
  assert(solarGuide.data.intent === 'start_service', 'Solar maps to start_service');

  const architectGuide = await guideApi('architect chahiye', ownerLogin.cookie);
  assert(architectGuide.status === 200, 'Owner → architect → 200');
  assert(
    architectGuide.data.intent === 'start_service' || architectGuide.data.intent === 'assigned_expert',
    'Architect intent resolved without inventing consultant',
  );

  const otherLogin = await sessionLogin(SEED.otherCustomer);
  const otherGuide = await guideApi(SEED.caseId, otherLogin.cookie);
  assert(otherGuide.status === 200, 'Other customer → guide with foreign case ID → 200');
  assert(
    otherGuide.data.intent === 'forbidden',
    'Other customer cannot read private case via copilot guide',
  );
  assert(
    !otherGuide.data.reply?.includes('clientEmail') && !otherGuide.data.reply?.includes('@'),
    'Forbidden reply does not leak PII',
  );

  const ownerUser = store.findUserByEmail(SEED.caseOwner);
  const otherUser = store.findUserByEmail(SEED.otherCustomer);
  assert(Boolean(ownerUser && otherUser), 'Seed users exist in store');

  if (ownerUser && otherUser) {
    const ownerCases = getVisibleCasesForUser(ownerUser);
    const otherCases = getVisibleCasesForUser(otherUser);
    const ownerHasSeed = ownerCases.some((c) => c.caseReference === SEED.caseId);
    const otherHasSeed = otherCases.some((c) => c.caseReference === SEED.caseId);
    assert(ownerHasSeed, 'Owner RBAC includes seed case');
    assert(!otherHasSeed, 'Other customer RBAC excludes seed case');
  }

  assert(detectGuideIntent('mera case kaha tak pahucha') === 'case_status', 'Hindi case status intent');
  assert(detectGuideIntent('mera BOQ ready hai?') === 'boq_status', 'Hindi BOQ intent');
  assert(detectGuideIntent('agla step kya hai') === 'next_step', 'Hindi next step intent');

  const localOwner = store.findUserByEmail(SEED.caseOwner);
  if (localOwner) {
    const local = buildCopilotGuide(localOwner, 'mera BOQ ready hai?', { activeCaseRef: SEED.caseId });
    assert(local.success && local.mode === 'context', 'Local buildCopilotGuide succeeds');
    assert(!local.reply.includes('BEG-FAKE'), 'Guide never returns invented case IDs');
  }

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
