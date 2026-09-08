/**
 * Privacy-safe product analytics tests
 * Run: node --import tsx server/tests/productAnalyticsTests.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  PRODUCT_EVENTS,
  sanitizeProductProperties,
} from '../../src/lib/analytics';
import { REQUIRED_FUNNEL_EVENTS, PRODUCT_FUNNEL, funnelStepForEvent } from '../../src/lib/productFunnel';

const ROOT = join(import.meta.dirname, '..', '..');

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

function readSrc(rel: string): string {
  const full = join(ROOT, rel);
  return existsSync(full) ? readFileSync(full, 'utf8') : '';
}

function main() {
  console.log('\n=== Product Analytics — Funnel Events ===\n');

  for (const event of REQUIRED_FUNNEL_EVENTS) {
    assert(Object.values(PRODUCT_EVENTS).includes(event), `PRODUCT_EVENTS includes ${event}`);
    assert(typeof funnelStepForEvent(event) === 'number', `${event} has funnel_step`);
  }

  assert(PRODUCT_FUNNEL.length >= 12, 'funnel has all steps');

  console.log('\n=== Product Analytics — PII Sanitizer ===\n');

  const stripped = sanitizeProductProperties({
    service_id: 'construction',
    email: 'user@example.com',
    client_phone: '+91 9876543210',
    password: 'secret123',
    message_body: 'private chat text',
    city: 'Lucknow',
    status: 'active',
  });
  assert(stripped.service_id === 'construction', 'allows safe service_id');
  assert(stripped.city === 'Lucknow', 'allows city');
  assert(stripped.status === 'active', 'allows status');
  assert(!('email' in stripped), 'blocks email key');
  assert(!('client_phone' in stripped), 'blocks phone key');
  assert(!('password' in stripped), 'blocks password key');
  assert(!('message_body' in stripped), 'blocks message key');

  const longText = sanitizeProductProperties({ city: 'x'.repeat(100) });
  assert(!('city' in longText), 'blocks long free-text values');

  console.log('\n=== Product Analytics — Wiring (source contracts) ===\n');

  const wiring: { file: string; needle: string; label: string }[] = [
    { file: 'src/components/home/GoalHomeHero.tsx', needle: 'HOMEPAGE_GOAL_SELECTED', label: 'homepage goal' },
    { file: 'src/pages/CustomerRegisterPage.tsx', needle: 'REGISTRATION_STARTED', label: 'registration started' },
    { file: 'src/pages/CustomerRegisterPage.tsx', needle: 'REGISTRATION_COMPLETED', label: 'registration completed' },
    { file: 'src/components/forms/GuidedRequirementWizard.tsx', needle: 'REQUIREMENT_STARTED', label: 'requirement started' },
    { file: 'src/components/forms/GuidedRequirementWizard.tsx', needle: 'REQUIREMENT_COMPLETED', label: 'requirement completed' },
    { file: 'src/components/forms/GuidedRequirementWizard.tsx', needle: 'CASE_CREATED', label: 'case created' },
    { file: 'src/pages/TrackRequestPage.tsx', needle: 'CASE_TRACKED', label: 'case tracked' },
    { file: 'src/pages/ProjectDetailPage.tsx', needle: 'BOQ_VIEWED', label: 'boq viewed' },
    { file: 'src/pages/ProjectDetailPage.tsx', needle: 'BOQ_APPROVED', label: 'boq approved' },
    { file: 'src/pages/ProjectDetailPage.tsx', needle: 'QUOTATION_COMPARED', label: 'quotation compared' },
    { file: 'src/components/assistant/BuildEcoAssistant.tsx', needle: 'COPILOT_OPENED', label: 'copilot opened' },
    { file: 'src/components/assistant/BuildEcoAssistant.tsx', needle: 'COPILOT_CONVERSION', label: 'copilot conversion' },
    { file: 'src/components/dashboard/CustomerProjectInsights.tsx', needle: 'DASHBOARD_INSIGHTS_VIEWED', label: 'dashboard insights viewed' },
    { file: 'src/components/forms/GuidedRequirementWizard.tsx', needle: 'PRIVATE_CONSULTATION_STARTED', label: 'private consultant discussion' },
    { file: 'src/components/navigation/Header.tsx', needle: 'REGISTRATION_NAV_CLICKED', label: 'desktop registration discovery' },
  ];

  for (const w of wiring) {
    const src = readSrc(w.file);
    assert(src.includes(w.needle), `${w.label} wired in ${w.file}`);
  }

  const analytics = readSrc('src/lib/analytics.ts');
  assert(analytics.includes('autocapture: false'), 'autocapture disabled');
  assert(analytics.includes('disable_session_recording: true'), 'session recording disabled');
  assert(analytics.includes("import('posthog-js')"), 'PostHog dynamic import');

  const consent = readSrc('src/components/analytics/AnalyticsConsent.tsx');
  assert(consent.includes('setAnalyticsConsent'), 'consent gate present');

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

main();
