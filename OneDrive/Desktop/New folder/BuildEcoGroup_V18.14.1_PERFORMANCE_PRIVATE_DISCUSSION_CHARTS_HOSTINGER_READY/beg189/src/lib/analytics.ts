import { funnelStepForEvent } from './productFunnel';

const CONSENT_KEY = 'buildeco-analytics-consent';
let initialized = false;
type PostHogClient = typeof import('posthog-js').default;
let posthogPromise: Promise<PostHogClient> | null = null;

/** Keys that must never be sent to analytics */
const BLOCKED_KEY_PATTERN =
  /email|e-mail|phone|mobile|whatsapp|address|street|pincode|password|passwd|token|secret|apikey|document|message|content|fullname|full_name|first_name|last_name|gstin|license|attachment|file_|filename|note|body|raw|case_ref|case_reference|case_id|enrollment/i;

const EMAIL_PATTERN = /\S+@\S+\.\S+/;
const PHONE_PATTERN = /^\+?[\d\s\-()]{10,}$/;

export type AnalyticsConsent = 'accepted' | 'declined' | null;

export type ProductEventProps = Record<string, string | number | boolean>;

/** Strip PII and oversized strings before sending to PostHog */
export function sanitizeProductProperties(properties: ProductEventProps): ProductEventProps {
  const safe: ProductEventProps = {};
  for (const [key, value] of Object.entries(properties)) {
    if (BLOCKED_KEY_PATTERN.test(key)) continue;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed || EMAIL_PATTERN.test(trimmed) || PHONE_PATTERN.test(trimmed)) continue;
      if (trimmed.length > 80) continue;
    }
    safe[key] = value;
  }
  return safe;
}

async function getPosthog(): Promise<PostHogClient | null> {
  if (getAnalyticsConsent() !== 'accepted') return null;
  if (!posthogPromise) {
    posthogPromise = import('posthog-js').then((mod) => mod.default);
  }
  return posthogPromise;
}

export function getAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(CONSENT_KEY);
  return value === 'accepted' || value === 'declined' ? value : null;
}

export async function initializeAnalytics(): Promise<boolean> {
  if (initialized || typeof window === 'undefined') return initialized;

  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  if (!apiKey || getAnalyticsConsent() !== 'accepted') return false;

  const posthog = await getPosthog();
  if (!posthog) return false;

  posthog.init(apiKey, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    defaults: '2026-05-30',
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: false,
    capture_exceptions: true,
    capture_performance: true,
    disable_session_recording: true,
    person_profiles: 'identified_only',
    mask_all_text: true,
    mask_all_element_attributes: true,
  });

  initialized = true;
  return true;
}

export async function setAnalyticsConsent(consent: Exclude<AnalyticsConsent, null>): Promise<void> {
  window.localStorage.setItem(CONSENT_KEY, consent);

  if (consent === 'accepted') {
    await initializeAnalytics();
    const posthog = await getPosthog();
    posthog?.opt_in_capturing();
    posthog?.capture('analytics_consent_accepted');
  } else if (initialized) {
    const posthog = await getPosthog();
    posthog?.opt_out_capturing();
  }
}

export function capturePageView(path: string): void {
  void initializeAnalytics().then(async (ready) => {
    if (!ready) return;
    const posthog = await getPosthog();
    posthog?.capture('$pageview', { path });
  });
}

export function captureAnalyticsEvent(event: string, properties: ProductEventProps = {}): void {
  void initializeAnalytics().then(async (ready) => {
    if (!ready) return;
    const posthog = await getPosthog();
    posthog?.capture(event, sanitizeProductProperties(properties));
  });
}

export const PRODUCT_EVENTS = {
  HOMEPAGE_GOAL_SELECTED: 'homepage_goal_selected',
  REGISTRATION_STARTED: 'registration_started',
  REGISTRATION_COMPLETED: 'registration_completed',
  REGISTRATION_SUCCEEDED: 'registration_succeeded',
  REGISTRATION_FAILED: 'registration_failed',
  LOGIN_COMPLETED: 'login_completed',
  LOGIN_SUCCEEDED: 'login_succeeded',
  LOGIN_FAILED: 'login_failed',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  DASHBOARD_OPENED: 'dashboard_opened',
  ADMIN_ROLE_CHANGED: 'admin_role_changed',
  REQUIREMENT_STARTED: 'requirement_started',
  REQUIREMENT_COMPLETED: 'requirement_completed',
  CASE_CREATED: 'case_created',
  CASE_TRACKED: 'case_tracked',
  EXPERT_ASSIGNED: 'expert_assigned',
  BOQ_VIEWED: 'boq_viewed',
  BOQ_CREATED: 'boq_created',
  BOQ_APPROVED: 'boq_approved',
  QUOTATION_COMPARED: 'quotation_compared',
  PROVIDER_SELECTED: 'provider_selected',
  PROJECT_STARTED: 'project_started',
  MILESTONE_APPROVED: 'milestone_approved',
  PROJECT_COMPLETED: 'project_completed',
  COPILOT_OPENED: 'copilot_opened',
  COPILOT_CONVERSION: 'copilot_conversion',
  EXPERT_PROFILE_VIEWED: 'expert_profile_viewed',
  EXPERT_MATCH_STARTED: 'expert_match_started',
  CONSULTANT_DISCIPLINE_FILTERED: 'consultant_discipline_filtered',
  DASHBOARD_INSIGHTS_VIEWED: 'dashboard_insights_viewed',
  PRIVATE_CONSULTATION_STARTED: 'private_consultation_started',
  REGISTRATION_NAV_CLICKED: 'registration_nav_clicked',
} as const;

/** Privacy-safe product funnel event — never pass passwords, messages, documents or PII */
export function captureProductEvent(event: string, properties: ProductEventProps = {}): void {
  const funnelStep = funnelStepForEvent(event);
  const payload: ProductEventProps = {
    ...properties,
    ...(funnelStep ? { funnel_step: funnelStep } : {}),
    event_category: 'product_funnel',
  };
  captureAnalyticsEvent(event, payload);
}
