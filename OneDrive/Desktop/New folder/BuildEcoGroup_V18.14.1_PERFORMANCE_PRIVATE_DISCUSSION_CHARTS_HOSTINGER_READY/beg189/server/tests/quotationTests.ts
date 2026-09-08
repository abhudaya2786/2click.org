/**
 * Quotation submit + comparison matrix tests
 * Run: node --import tsx server/tests/quotationTests.ts
 * Requires dev server on localhost:3000 for HTTP tests
 */
import { store } from '../store';

const assert = (ok: boolean, msg: string) => {
  if (!ok) throw new Error(msg);
  console.log('✓', msg);
};

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function login(email: string): Promise<string> {
  const res = await fetch(`${BASE}/api/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const cookie = res.headers.get('set-cookie');
  if (!cookie) throw new Error(`Login failed for ${email}`);
  return cookie.split(';')[0];
}

function runStoreUnitTests() {
  const { caseRecord } = store.createCase({
    pillar: 'CONSTRUCTION_SERVICES',
    serviceSlug: 'structural-engineering',
    primaryDiscipline: 'Structural Engineering',
    subDisciplines: [],
    address: 'Quotation Test Site',
    city: 'Lucknow',
    stateRegion: 'Uttar Pradesh',
    pincode: '226010',
    plotSizeSqFt: '2400',
    terrainType: 'Urban',
    projectTitle: 'Quotation Test Villa',
    buildingType: 'Villa G+2',
    scopeDescription: 'Quotation workflow verification case.',
    scopeDetails: {},
    specialRequirements: [],
    budgetRange: '₹50 Lakhs',
    financingStatus: 'Self-Funded',
    startDateUrgency: 'Within 1-3 Months',
    expectedDuration: '6 - 9 Months',
    clientName: 'Quote Test User',
    clientEmail: 'quotetest@example.com',
    clientPhone: '+91 90000 00003',
    clientOrg: 'Individual',
    preferredCommunication: 'Email',
    consentAccepted: true,
  }, 'usr-client-01');

  const boq = store.createBOQRequest({
    caseId: caseRecord.id,
    title: 'Test BOQ for Quotations',
    estimateType: 'DETAILED_BOQ',
    scopeDescription: 'Starter template verification',
    createdBy: 'usr-coord-01',
  });

  assert((boq.currentRevision?.items?.length || 0) >= 3, 'New BOQ seeds starter line items');
  assert((boq.currentRevision?.grandTotal || 0) > 0, 'New BOQ has non-zero grand total');

  const items = boq.currentRevision!.items!;
  const quote1 = store.createQuotation({
    boqId: boq.id,
    providerId: 'usr-client-01',
    providerFirm: 'Apex Building Supplies',
    providerCity: 'Lucknow',
    leadTimeDays: 7,
    freight: 25000,
    discount: 0,
    items: items.map((it) => ({
      boqItemId: it.id,
      offeredBrand: it.brand || 'Standard',
      offeredSpecification: it.specification || it.description,
      quantity: it.quantity,
      unitRate: it.baseRate * 0.95,
      taxRate: it.taxRate,
      specCompliance: 'EXACT' as const,
    })),
  });

  const quote2 = store.createQuotation({
    boqId: boq.id,
    providerId: 'usr-consultant-01',
    providerFirm: 'GreenBuild Traders',
    providerCity: 'Kanpur',
    leadTimeDays: 5,
    freight: 18000,
    discount: 5000,
    items: items.map((it) => ({
      boqItemId: it.id,
      offeredBrand: it.brand || 'Standard',
      offeredSpecification: it.specification || it.description,
      quantity: it.quantity,
      unitRate: it.baseRate * 1.02,
      taxRate: it.taxRate,
      specCompliance: 'EXACT' as const,
    })),
  });

  assert(Boolean(quote1.quotationReference), 'Quotation 1 has server reference');
  assert(Boolean(quote2.quotationReference), 'Quotation 2 has server reference');

  const comparison = store.compareQuotations(boq.id);
  assert(comparison.quotations.length === 2, 'Comparison matrix includes 2 quotations');
  assert(comparison.comparisonItems.length === items.length, 'Comparison normalizes all BOQ line items');
  assert(Boolean(comparison.lowestCommercialQuoteId), 'Comparison identifies lowest commercial quote');
  assert(Boolean(comparison.summary?.lowestOverallQuotationId), 'Comparison summary exposes lowestOverallQuotationId for UI');
  assert(comparison.itemsComparison?.length === items.length, 'Comparison exposes itemsComparison rows for UI matrix');
}

async function runHttpTests() {
  const customerCookie = await login('aditya.vardhan@ecoventures.in');
  const coordinatorCookie = await login('coordinator@buildecogroup.in');

  const caseRes = await fetch(`${BASE}/api/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
    body: JSON.stringify({
      pillar: 'CONSTRUCTION_SERVICES',
      serviceSlug: 'structural-engineering',
      primaryDiscipline: 'Structural Engineering',
      subDisciplines: [],
      address: 'HTTP Quote Test',
      city: 'Lucknow',
      stateRegion: 'Uttar Pradesh',
      pincode: '226010',
      plotSizeSqFt: '1800',
      terrainType: 'Urban',
      projectTitle: 'HTTP Quotation Flow Test',
      buildingType: 'Villa',
      scopeDescription: 'End-to-end quotation HTTP test.',
      scopeDetails: {},
      specialRequirements: [],
      budgetRange: '₹40 Lakhs',
      financingStatus: 'Self-Funded',
      startDateUrgency: 'Within 30 Days',
      expectedDuration: '6 Months',
      clientName: 'Aditya Vardhan',
      clientEmail: 'aditya.vardhan@ecoventures.in',
      clientPhone: '+91 98450 12345',
      clientOrg: 'EcoVentures',
      preferredCommunication: 'Email',
      consentAccepted: true,
    }),
  });
  const caseJson = await caseRes.json();
  assert(caseRes.ok && caseJson.case?.id, 'HTTP case created for quotation test');
  const caseId = caseJson.case.id;

  const boqRes = await fetch(`${BASE}/api/cases/${caseId}/boqs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: coordinatorCookie },
    body: JSON.stringify({
      title: 'HTTP Quotation Test BOQ',
      estimateType: 'DETAILED_BOQ',
      scopeDescription: 'Automated quotation HTTP verification',
    }),
  });
  const boqJson = await boqRes.json();
  assert(boqRes.ok && boqJson.boq?.id, 'HTTP BOQ created');
  const boqId = boqJson.boq.id;
  const boqItems = boqJson.boq.currentRevision?.items || [];
  assert(boqItems.length >= 3, 'HTTP BOQ has starter line items');

  const quotePayload = {
    providerFirm: 'Test Supplier Ltd',
    providerCity: 'Lucknow',
    leadTimeDays: 10,
    freight: 20000,
    discount: 0,
    items: boqItems.map((it: any) => ({
      boqItemId: it.id,
      offeredBrand: it.brand || 'Standard',
      offeredSpecification: it.specification || it.description,
      quantity: it.quantity,
      unitRate: it.baseRate,
      taxRate: it.taxRate,
      specCompliance: 'EXACT',
    })),
  };

  const q1Res = await fetch(`${BASE}/api/boqs/${boqId}/quotations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
    body: JSON.stringify(quotePayload),
  });
  const q1Json = await q1Res.json();
  assert(q1Res.ok && q1Json.quotation?.id, `HTTP quotation submitted (${q1Json.quotation?.quotationReference || 'ref'})`);

  const compRes = await fetch(`${BASE}/api/boqs/${boqId}/compare`, {
    headers: { Cookie: customerCookie },
  });
  const compJson = await compRes.json();
  assert(compRes.ok && compJson.comparison?.quotations?.length === 1, 'HTTP comparison matrix returns 1 quotation');
  assert(compJson.comparison.comparisonItems.length === boqItems.length, 'HTTP comparison normalizes BOQ items');
  assert(Array.isArray(compJson.comparison.itemsComparison) && compJson.comparison.itemsComparison.length === boqItems.length, 'HTTP comparison exposes itemsComparison for UI');
}

async function main() {
  console.log('=== Quotation Tests (Store Unit) ===');
  runStoreUnitTests();

  console.log('\n=== Quotation Tests (HTTP) ===');
  try {
    await runHttpTests();
  } catch (err: any) {
    if (err.message?.includes('fetch failed') || err.cause?.code === 'ECONNREFUSED') {
      console.warn('⚠ HTTP tests skipped — dev server not running on', BASE);
      process.exit(0);
    }
    throw err;
  }

  console.log('\n✅ All quotation tests passed');
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
