/**
 * BuildEco Copilot smoke tests — quick actions, intents, authoritative track API
 * Run: node --import tsx server/tests/buildEcoCopilotTests.ts
 */
import {
  COPILOT_QUICK_ACTIONS,
  getCopilotQuickAction,
  CopilotQuickActionId,
} from '../../src/lib/copilotConfig';
import {
  detectCopilotIntent,
  explainNextAction,
  extractCaseId,
  CASE_ID_PATTERN,
} from '../../src/lib/copilotEngine';

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
  const html = await res.text().catch(() => '');
  return { status: res.status, html };
}

async function main() {
  console.log('\n=== BuildEco Copilot Tests ===\n');

  assert(COPILOT_QUICK_ACTIONS.length === 7, 'Copilot has 7 quick actions');

  const expectedIds: CopilotQuickActionId[] = ['build', 'land', 'solar', 'interior', 'boq', 'expert', 'track'];
  for (const id of expectedIds) {
    const action = getCopilotQuickAction(id);
    assert(Boolean(action.labelEn && action.labelHi), `${id} has EN/HI labels`);
    assert(action.route.startsWith('/'), `${id} route is valid path`);
    const { status } = await fetchRoute(action.route.split('?')[0]);
    assert(status === 200, `Quick action "${id}" base route → 200`);
  }

  const intentCases: Array<{ text: string; expect: string; actionId?: string }> = [
    { text: 'I want to build a villa', expect: 'start_service', actionId: 'build' },
    { text: 'find land in lucknow', expect: 'start_service', actionId: 'land' },
    { text: 'solar rooftop chahiye', expect: 'start_service', actionId: 'solar' },
    { text: 'interior renovation', expect: 'start_service', actionId: 'interior' },
    { text: 'BOQ estimate material', expect: 'start_service', actionId: 'boq' },
    { text: 'find structural expert', expect: 'start_service', actionId: 'expert' },
    { text: 'track my case status', expect: 'start_service', actionId: 'track' },
    { text: 'मेरा केस ट्रैक करना है', expect: 'start_service', actionId: 'track' },
    { text: 'मुझे सोलर लगाना है', expect: 'start_service', actionId: 'solar' },
    { text: 'talk to human coordinator', expect: 'human_handoff' },
    { text: 'BEG-2026-ABCDEF12', expect: 'track' },
  ];

  for (const c of intentCases) {
    const intent = detectCopilotIntent(c.text);
    assert(intent.type === c.expect, `Intent "${c.text.slice(0, 30)}…" → ${c.expect}`);
    if (c.actionId) assert(intent.actionId === c.actionId, `  actionId → ${c.actionId}`);
  }

  assert(CASE_ID_PATTERN.test('BEG-2026-TEST1234'), 'Case ID pattern matches BEG format');
  assert(extractCaseId('status BEG-2026-TEST1234 please') === 'BEG-2026-TEST1234', 'extractCaseId works');

  const fakeTrack = await fetch(`${BASE}/api/track/BEG-FAKE-COPILOT-99999`);
  assert(fakeTrack.status === 404, 'Fake Case ID → 404 (no invented status)');

  const nextEn = explainNextAction(
    {
      id: 'x',
      reference: 'BEG-2026-TEST0001',
      type: 'CASE',
      title: 'Test',
      status: 'NEW',
      displayStatus: 'New',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [],
      milestones: [],
      isFullAccess: false,
    },
    'en'
  );
  assert(nextEn.includes('Next'), 'explainNextAction returns next-step guidance (EN)');

  const assistRes = await fetch(`${BASE}/api/assistant/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'What is BuildEco Copilot?', page: '/', history: [] }),
  });
  assert(assistRes.status === 200, 'POST /api/assistant/message → 200');
  const assistJson = await assistRes.json();
  assert(typeof assistJson.reply === 'string' && assistJson.reply.length > 10, 'Assistant returns reply text');

  const home = await fetchRoute('/');
  assert(home.status === 200, 'Homepage HTTP 200 with Copilot shell');

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
