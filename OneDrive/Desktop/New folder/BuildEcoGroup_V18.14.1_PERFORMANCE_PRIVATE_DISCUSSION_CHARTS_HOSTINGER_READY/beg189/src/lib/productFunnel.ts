/**
 * BuildEco product funnel — privacy-safe PostHog event names & step mapping.
 * Visitor → Registration → Requirement → Case ID → BOQ → Quote → Project
 */
export const PRODUCT_FUNNEL = [
  { step: 1, key: 'visitor', event: 'homepage_goal_selected', labelEn: 'Visitor / Goal', labelHi: 'विज़िटर / लक्ष्य' },
  { step: 2, key: 'registration', event: 'registration_started', labelEn: 'Registration', labelHi: 'पंजीकरण' },
  { step: 2, key: 'registration_done', event: 'registration_succeeded', labelEn: 'Registration complete', labelHi: 'पंजीकरण पूर्ण' },
  { step: 2, key: 'registration_done_legacy', event: 'registration_completed', labelEn: 'Registration complete', labelHi: 'पंजीकरण पूर्ण' },
  { step: 3, key: 'requirement', event: 'requirement_started', labelEn: 'Requirement', labelHi: 'आवश्यकता' },
  { step: 3, key: 'requirement_done', event: 'requirement_completed', labelEn: 'Requirement complete', labelHi: 'आवश्यकता पूर्ण' },
  { step: 4, key: 'case', event: 'case_created', labelEn: 'Case ID', labelHi: 'केस ID' },
  { step: 4, key: 'case_track', event: 'case_tracked', labelEn: 'Case tracked', labelHi: 'केस ट्रैक' },
  { step: 5, key: 'boq', event: 'boq_viewed', labelEn: 'BOQ', labelHi: 'BOQ' },
  { step: 5, key: 'boq_done', event: 'boq_approved', labelEn: 'BOQ approved', labelHi: 'BOQ अनुमोदित' },
  { step: 6, key: 'quote', event: 'quotation_compared', labelEn: 'Quote comparison', labelHi: 'कोट तुलना' },
  { step: 7, key: 'assist', event: 'copilot_opened', labelEn: 'Copilot opened', labelHi: 'Copilot खोला' },
  { step: 7, key: 'assist_convert', event: 'copilot_conversion', labelEn: 'Copilot conversion', labelHi: 'Copilot रूपांतरण' },
] as const;

/** Required funnel events — must match PostHog dashboards */
export const REQUIRED_FUNNEL_EVENTS = [
  'homepage_goal_selected',
  'registration_started',
  'registration_completed',
  'registration_succeeded',
  'requirement_started',
  'requirement_completed',
  'case_created',
  'case_tracked',
  'boq_viewed',
  'boq_approved',
  'quotation_compared',
  'copilot_opened',
  'copilot_conversion',
] as const;

export type FunnelEventName = (typeof REQUIRED_FUNNEL_EVENTS)[number];

export function funnelStepForEvent(event: string): number | undefined {
  return PRODUCT_FUNNEL.find((s) => s.event === event)?.step;
}
