import { CaseIntakeInput } from '../types/backend';
import { ServiceDefinition } from './servicesRegistry';
import { buildCaseIntakeFromDynamicForm } from './caseIntakeMapper';
import { buildWizardTitle } from './guidedWizardConfig';
import { FormAttachment } from '../types/forms';
import { SiteCoordinates, SitePhotoAttachment } from './siteMedia';
import { SiteMeasurementEntry } from './serviceEvidenceConfig';

export interface GuidedWizardFormState {
  selectedService: ServiceDefinition;
  details: Record<string, string>;
  locationCity: string;
  pincode: string;
  siteAddress: string;
  sitePhotos?: SitePhotoAttachment[];
  siteCoordinates?: SiteCoordinates | null;
  siteMeasurements?: SiteMeasurementEntry[];
  budgetRange: string;
  targetTimeline: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  preferredContact: 'CALL' | 'WHATSAPP' | 'EMAIL';
  specialistName?: string;
  privateDiscussion?: boolean;
}

const BUDGET_LABELS: Record<string, string> = {
  'under-25L': 'Under ₹25 Lakhs',
  '25L-1Cr': '₹25L – ₹1 Crore',
  '1-5Cr': '₹1 – ₹5 Crores',
  '5Cr-plus': '₹5 Crores+',
  discuss: 'To be discussed',
};

const TIMELINE_LABELS: Record<string, string> = {
  asap: 'As soon as possible',
  '1-3m': 'Within 1–3 months',
  '3-6m': 'Within 3–6 months',
  '6m-plus': '6+ months / flexible',
};

export function buildCaseIntakeFromGuidedWizard(state: GuidedWizardFormState): CaseIntakeInput {
  const title = buildWizardTitle(state.selectedService, state.details, state.locationCity);
  const budgetLabel = BUDGET_LABELS[state.budgetRange] || state.budgetRange;
  const timelineLabel = TIMELINE_LABELS[state.targetTimeline] || state.targetTimeline;

  const enrichedDetails: Record<string, any> = {
    ...state.details,
    budget: budgetLabel,
    expectedBudget: budgetLabel,
  };

  if (state.sitePhotos?.length) enrichedDetails.sitePhotos = state.sitePhotos;
  if (state.siteCoordinates) enrichedDetails.siteCoordinates = state.siteCoordinates;
  if (state.siteMeasurements?.length) enrichedDetails.siteMeasurements = state.siteMeasurements;

  if (state.details.builtUpArea) enrichedDetails.builtUpArea = state.details.builtUpArea;
  if (state.details.landArea) enrichedDetails.landArea = state.details.landArea;
  if (state.details.areaSqFt) enrichedDetails.plotBuiltUpArea = state.details.areaSqFt;

  const attachments: FormAttachment[] = [];

  const intake = buildCaseIntakeFromDynamicForm({
    selectedService: state.selectedService,
    title,
    details: {
      ...enrichedDetails,
      formSource: 'GuidedRequirementWizard',
      wizardVersion: '1.1',
      discussionMode: state.privateDiscussion ? 'CASE_ONLY' : 'STANDARD',
    },
    clientName: state.clientName,
    clientEmail: state.clientEmail,
    clientPhone: state.clientPhone,
    locationCity: state.locationCity,
    pincode: state.pincode,
    siteAddress: state.siteAddress,
    targetTimeline: timelineLabel,
    preferredContact: state.preferredContact,
    attachments,
    bundledServices: [],
  });

  return {
    ...intake,
    budgetRange: budgetLabel,
    startDateUrgency: timelineLabel,
    scopeDescription: [
      intake.scopeDescription,
      'Submitted via Guided Requirement Wizard — technical details to be collected by assigned expert.',
    ].join(' '),
    targetSpecialist: state.specialistName || intake.targetSpecialist,
  };
}
