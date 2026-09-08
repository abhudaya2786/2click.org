/**
 * Mobile + Hindi/English + Accessibility QA — static source checks + HTTP shell
 * Run: node --import tsx server/tests/mobileA11yQaTests.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROUTES } from '../../src/lib/routes';
import { COPILOT_QUICK_ACTIONS } from '../../src/lib/copilotConfig';

const ROOT = join(import.meta.dirname, '..', '..');
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

const CRITICAL_ROUTES = [
  ROUTES.HOME,
  ROUTES.INITIATE_PROJECT,
  ROUTES.TRACK_REQUEST,
  ROUTES.CONSULTANTS,
  ROUTES.BOQ_ESTIMATION,
];

const SOURCE_CHECKS: { file: string; mustInclude: string[]; label: string }[] = [
  {
    file: 'src/components/ui/LanguageToggle.tsx',
    mustInclude: ['data-testid="language-toggle"', 'min-h-11', 'भाषा बदलें'],
    label: 'Language toggle a11y',
  },
  {
    file: 'src/components/navigation/MobileBottomNav.tsx',
    mustInclude: ['data-testid="mobile-bottom-nav"', 'min-h-12', 'useLanguage', 'safe-area-inset-bottom'],
    label: 'Mobile bottom nav',
  },
  {
    file: 'src/components/navigation/MobileNav.tsx',
    mustInclude: ['useLanguage', 'min-h-11', 'LanguageToggle', 'Create Customer Account', 'ROUTES.REGISTER'],
    label: 'Mobile drawer nav bilingual',
  },
  {
    file: 'src/components/navigation/Header.tsx',
    mustInclude: ['LanguageToggle', 'min-h-11'],
    label: 'Header language + touch targets',
  },
  {
    file: 'src/components/forms/GuidedRequirementWizard.tsx',
    mustInclude: ['role="progressbar"', 'role="alert"', 'bottom-16', 'aria-pressed', 'Case-only discussion'],
    label: 'Wizard mobile footer + a11y',
  },
  {
    file: 'src/components/dashboard/CustomerProjectInsights.tsx',
    mustInclude: ['aria-labelledby="project-insights-title"', 'role="img"', 'motion-reduce:transition-none'],
    label: 'Customer charts semantics + reduced motion',
  },
  {
    file: 'src/pages/TrackRequestPage.tsx',
    mustInclude: ['useLanguage', 'role="alert"', 'overflow-x-auto'],
    label: 'Case Tracker mobile + i18n',
  },
  {
    file: 'src/components/commercial/BOQItemTable.tsx',
    mustInclude: ['useLanguage', 'overflow-x-auto', 'scope="col"', 'sticky left-0', 'min-w-[640px]'],
    label: 'BOQ table scroll + semantics',
  },
  {
    file: 'src/components/commercial/QuotationComparisonView.tsx',
    mustInclude: ['useLanguage', 'overflow-x-auto', 'scope="col"', 'sticky left-0', 'min-w-[720px]'],
    label: 'Quotation comparison table',
  },
  {
    file: 'src/components/assistant/BuildEcoAssistant.tsx',
    mustInclude: ['bottom-[4.75rem]', 'min-h-11', 'data-testid="buildEco-copilot-panel"', 'aria-live="polite"'],
    label: 'Copilot mobile offset + a11y',
  },
  {
    file: 'src/components/ui/Drawer.tsx',
    mustInclude: ['role="dialog"', 'aria-modal="true"', 'ड्रॉअर बंद करें', 'min-h-11'],
    label: 'Drawer dialog semantics',
  },
  {
    file: 'src/layouts/PublicLayout.tsx',
    mustInclude: ['safe-area-inset-bottom', 'MobileBottomNav', 'BuildEcoAssistant'],
    label: 'Public layout safe area',
  },
  {
    file: 'src/contexts/LanguageContext.tsx',
    mustInclude: ['document.documentElement.lang', 'beg-language'],
    label: 'Language context html lang',
  },
];

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

function readSrc(relPath: string): string {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) return '';
  return readFileSync(full, 'utf8');
}

async function main() {
  console.log('\n=== Mobile + A11y QA — Source Contracts ===\n');

  for (const check of SOURCE_CHECKS) {
    const src = readSrc(check.file);
    assert(src.length > 0, `${check.label}: file exists (${check.file})`);
    for (const needle of check.mustInclude) {
      assert(src.includes(needle), `${check.label}: contains "${needle}"`);
    }
  }

  console.log('\n=== Mobile + A11y QA — Copilot EN/HI ===\n');
  for (const action of COPILOT_QUICK_ACTIONS) {
    assert(Boolean(action.labelEn && action.labelHi), `Copilot action ${action.id} has EN/HI labels`);
  }

  console.log('\n=== Mobile + A11y QA — Index & Routes ===\n');
  const indexHtml = readSrc('index.html');
  assert(indexHtml.includes('width=device-width'), 'index.html viewport meta');
  assert(indexHtml.includes('Noto+Sans+Devanagari'), 'Devanagari font for Hindi');

  for (const route of CRITICAL_ROUTES) {
    const res = await fetch(`${BASE}${route}`);
    const html = await res.text();
    assert(res.status === 200, `${route} → HTTP 200`);
    assert(html.includes('root'), `${route} → SPA shell`);
  }

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (issues.length) {
    console.log('\nIssues:');
    issues.forEach((i) => console.log(`  - ${i}`));
  }
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
