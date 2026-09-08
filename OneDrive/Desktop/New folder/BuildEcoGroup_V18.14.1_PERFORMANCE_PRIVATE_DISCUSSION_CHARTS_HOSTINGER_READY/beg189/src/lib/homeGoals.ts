import { ROUTES } from './routes';

/** Goal-based homepage choices — each maps to an existing route/workflow (no backend changes). */
export const HOME_GOALS = [
  {
    id: 'build',
    label: 'Build a Project',
    labelHi: 'प्रोजेक्ट बनाएं',
    desc: 'New construction, villa, commercial or turnkey',
    route: `${ROUTES.INITIATE_PROJECT}?service=construction`,
    service: 'construction',
  },
  {
    id: 'land',
    label: 'Land / Property',
    labelHi: 'ज़मीन / प्रॉपर्टी',
    desc: 'Buy, sell, develop or feasibility check',
    route: `${ROUTES.INITIATE_PROJECT}?service=land`,
    service: 'land',
  },
  {
    id: 'solar',
    label: 'Solar',
    labelHi: 'सोलर',
    desc: 'Rooftop, microgrid or PM Surya Ghar',
    route: `${ROUTES.INITIATE_PROJECT}?service=solar`,
    service: 'solar',
  },
  {
    id: 'interior',
    label: 'Interior / Renovation',
    labelHi: 'इंटीरियर / रेनोवेशन',
    desc: 'Fit-out, retrofit or modernize',
    route: `${ROUTES.INITIATE_PROJECT}?service=interior`,
    service: 'interior',
  },
  {
    id: 'boq',
    label: 'Material / BOQ',
    labelHi: 'मटीरियल / BOQ',
    desc: 'Cost estimate, procurement or comparison',
    route: `${ROUTES.INITIATE_PROJECT}?service=boq`,
    service: 'boq',
  },
  {
    id: 'expert',
    label: 'Find an Expert',
    labelHi: 'विशेषज्ञ खोजें',
    desc: 'Structural, MEP, GIS, Vastu & more',
    route: ROUTES.CONSULTANTS,
    service: 'consultants',
  },
  {
    id: 'track',
    label: 'Track My Case',
    labelHi: 'केस ट्रैक करें',
    desc: 'Check status with your Case ID',
    route: ROUTES.TRACK_REQUEST,
    service: 'track',
  },
] as const;

export const PRIMARY_CTA_ROUTE = ROUTES.INITIATE_PROJECT;
export const PRIMARY_CTA_LABEL = 'START MY REQUIREMENT';

export const SUBMISSION_STEPS = [
  {
    step: '1',
    title: 'Tell us your goal',
    titleHi: 'अपना लक्ष्य बताएं',
    desc: 'Pick a goal above or start a requirement — takes 2 minutes.',
  },
  {
    step: '2',
    title: 'Get a Case ID',
    titleHi: 'Case ID मिलेगा',
    desc: 'We structure your scope and issue a trackable reference.',
  },
  {
    step: '3',
    title: 'Compare & track',
    titleHi: 'तुलना और ट्रैकिंग',
    desc: 'Review experts, BOQs and milestones in one place.',
  },
] as const;
