/**
 * Service evidence configuration + source contract tests
 * Run: node --import tsx server/tests/serviceEvidenceCaptureTests.ts
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildMeasurementEntries, getServiceEvidenceGuide } from '../../src/lib/serviceEvidenceConfig';
import { MAX_SITE_PHOTOS } from '../../src/lib/siteMedia';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${message}`);
  } else {
    failed += 1;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function main() {
  console.log('\n=== Service Evidence & Live Capture QA ===\n');

  const interior = getServiceEvidenceGuide('interior');
  const solar = getServiceEvidenceGuide('solar');
  const land = getServiceEvidenceGuide('land');
  const generic = getServiceEvidenceGuide('water');

  assert(interior.shots.some((shot) => shot.id === 'ceiling'), 'Interior includes ceiling angle');
  assert(interior.measurements.some((field) => field.key === 'roomLength'), 'Interior includes room measurements');
  assert(solar.shots.some((shot) => shot.id === 'shade'), 'Solar includes shade / obstruction photo');
  assert(solar.shots.some((shot) => shot.id === 'meter'), 'Solar includes meter / panel photo');
  assert(land.shots.some((shot) => shot.id === 'approach-road'), 'Land includes approach road photo');
  assert(land.measurements.some((field) => field.key === 'roadWidth'), 'Land includes road width measurement');
  assert(generic.shots.length >= 4, 'Extended services receive generic evidence guidance');
  assert(MAX_SITE_PHOTOS === 8, 'Evidence set supports up to eight compressed photos');

  const measurements = buildMeasurementEntries(interior, { roomLength: '14', roomWidth: ' 11 ' }, 'en');
  assert(measurements.length === 2, 'Only entered measurements are persisted');
  assert(measurements[1].value === '11', 'Measurement values are trimmed');

  const wizardSource = readFileSync(resolve('src/components/forms/GuidedRequirementWizard.tsx'), 'utf8');
  const cameraSource = readFileSync(resolve('src/components/forms/LiveSiteCameraModal.tsx'), 'utf8');
  const dashboardSource = readFileSync(resolve('src/components/dashboard/CategorySelectionPanel.tsx'), 'utf8');

  assert(wizardSource.includes('capture="environment"'), 'Mobile rear-camera hint is present');
  assert(wizardSource.includes("'LIVE_CAMERA'"), 'Live capture metadata is persisted');
  assert(wizardSource.includes('Use current location'), 'Permission-based GPS action remains available');
  assert(cameraSource.includes('navigator.mediaDevices.getUserMedia'), 'Live camera uses the browser media API');
  assert(cameraSource.includes('getTracks().forEach'), 'Camera tracks stop on close / unmount');
  assert(cameraSource.includes('window.isSecureContext'), 'Live camera checks secure context');
  assert(dashboardSource.includes('source=dashboard'), 'Dashboard cards deep-link into service forms');

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

main();
