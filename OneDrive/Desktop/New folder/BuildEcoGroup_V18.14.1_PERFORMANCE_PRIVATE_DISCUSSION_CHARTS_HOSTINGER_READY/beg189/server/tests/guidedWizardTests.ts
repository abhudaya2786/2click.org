/**
 * Guided Requirement Wizard — runtime API tests for all major services
 * Run: node --import tsx server/tests/guidedWizardTests.ts
 */
import { buildCaseIntakeFromGuidedWizard } from '../../src/lib/guidedWizardSubmit';
import { getServiceById } from '../../src/lib/servicesRegistry';
import { WIZARD_PRIMARY_SERVICE_IDS } from '../../src/lib/guidedWizardConfig';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

const SERVICE_SAMPLE_DETAILS: Record<string, Record<string, string>> = {
  construction: { projectType: 'villa', builtUpArea: '2500', briefNote: 'QA wizard test' },
  land: { landPurpose: 'feasibility', landArea: '1 acre' },
  solar: { installationType: 'rooftop-home', monthlyBill: '3k-10k' },
  interior: { spaceType: 'home', areaSqFt: '1800' },
  boq: { projectStage: 'planning', estimateNeed: 'full-boq' },
  material: { materialCategory: 'steel', quantityEstimate: '50 MT' },
};

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
  console.log('\n=== Guided Wizard — Case Creation (all major services) ===\n');

  for (const serviceId of WIZARD_PRIMARY_SERVICE_IDS) {
    const service = getServiceById(serviceId);
    if (!service) {
      assert(false, `Service ${serviceId} not found in catalog`);
      continue;
    }

    const details = SERVICE_SAMPLE_DETAILS[serviceId] || { briefDescription: 'QA generic test' };
    const includeOptionalSiteEvidence = serviceId === 'construction';
    const intake = buildCaseIntakeFromGuidedWizard({
      selectedService: service,
      details,
      locationCity: 'Lucknow',
      pincode: '226010',
      siteAddress: 'QA Test Landmark, Sultanpur Road',
      sitePhotos: includeOptionalSiteEvidence ? [{
        id: 'qa-site-photo-1',
        name: 'qa-site-photo.jpg',
        type: 'image/jpeg',
        sizeBytes: 67,
        sizeLabel: '67 B',
        dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2Q==',
        shotType: 'site-overview',
        shotLabel: 'Site / building overview',
        captureMethod: 'LIVE_CAMERA',
        capturedAt: '2026-09-08T00:00:00.000Z',
      }] : undefined,
      siteCoordinates: includeOptionalSiteEvidence ? {
        latitude: 26.8467,
        longitude: 80.9462,
        accuracyMeters: 15,
        capturedAt: '2026-09-08T00:00:00.000Z',
      } : undefined,
      siteMeasurements: includeOptionalSiteEvidence ? [{
        key: 'workLength',
        label: 'Work area length',
        value: '50',
        unit: 'ft',
      }] : undefined,
      budgetRange: '25L-1Cr',
      targetTimeline: '1-3m',
      clientName: 'QA Wizard Tester',
      clientEmail: `qa.wizard.${serviceId}@test.example.com`,
      clientPhone: '+919876543210',
      preferredContact: 'WHATSAPP',
    });

    assert(intake.clientEmail.includes('@'), `${serviceId} — intake has email`);
    assert(intake.projectTitle.length >= 3, `${serviceId} — project title`);
    assert(intake.scopeDescription.length >= 10, `${serviceId} — scope description`);
    assert(intake.consentAccepted === true, `${serviceId} — consent`);
    if (includeOptionalSiteEvidence) {
      assert(intake.scopeDetails.sitePhotos?.length === 1, 'construction — optional site photo mapped');
      assert(intake.scopeDetails.siteCoordinates?.latitude === 26.8467, 'construction — optional GPS location mapped');
      assert(intake.scopeDetails.siteMeasurements?.[0]?.value === '50', 'construction — service measurement mapped');
      assert(intake.scopeDetails.sitePhotos?.[0]?.captureMethod === 'LIVE_CAMERA', 'construction — capture method mapped');
    }

    const res = await fetch(`${BASE}/api/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intake),
    });

    const json = await res.json();
    assert(res.status === 201, `${serviceId} — POST /api/cases → 201`);
    assert(/^BEG-2026-[A-F0-9]{6}$/.test(json.caseReference), `${serviceId} — real Case ID ${json.caseReference}`);
    if (includeOptionalSiteEvidence) {
      assert(json.case?.scopeDetails?.sitePhotos?.length === 1, 'construction — site photo persisted in private case');
      assert(json.case?.scopeDetails?.siteCoordinates?.longitude === 80.9462, 'construction — GPS location persisted in private case');
      assert(json.case?.scopeDetails?.siteMeasurements?.[0]?.unit === 'ft', 'construction — service measurement persisted');
    }

    const trackRes = await fetch(`${BASE}/api/track/${json.caseReference}`);
    assert(trackRes.status === 200, `${serviceId} — track API for ${json.caseReference}`);
  }

  // Extended catalog service (water) — generic fields
  const water = getServiceById('water');
  if (water) {
    const intake = buildCaseIntakeFromGuidedWizard({
      selectedService: water,
      details: { briefDescription: 'Need STP for 50 KLD commercial building' },
      locationCity: 'Gorakhpur',
      pincode: '273001',
      siteAddress: 'Medical college road',
      budgetRange: 'discuss',
      targetTimeline: '3-6m',
      clientName: 'QA Water Tester',
      clientEmail: 'qa.wizard.water@test.example.com',
      clientPhone: '+919876543211',
      preferredContact: 'EMAIL',
    });
    const res = await fetch(`${BASE}/api/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intake),
    });
    const json = await res.json();
    assert(res.status === 201, `water — POST /api/cases → 201 (${json.caseReference})`);
  }

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
