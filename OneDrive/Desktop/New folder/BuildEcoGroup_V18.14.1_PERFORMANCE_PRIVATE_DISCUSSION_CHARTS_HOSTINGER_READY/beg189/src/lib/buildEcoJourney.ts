import type { IconToken } from './iconSystem';
import { ROUTES } from './routes';

export interface BuildEcoJourneyStep {
  id: string;
  icon: IconToken;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  route: string;
  ctaEn: string;
  ctaHi: string;
}

/** End-to-end client journey — simple language, linked to real routes. */
export const BUILD_ECO_JOURNEY_STEPS: BuildEcoJourneyStep[] = [
  {
    id: 'need',
    icon: 'messages',
    titleEn: 'Tell Us Your Need',
    titleHi: 'अपनी ज़रूरत बताएं',
    descEn: 'Share your project goal in plain language — takes about 2 minutes.',
    descHi: 'साधारण भाषा में अपना लक्ष्य बताएं — लगभग 2 मिनट।',
    route: ROUTES.INITIATE_PROJECT,
    ctaEn: 'Start requirement',
    ctaHi: 'आवश्यकता शुरू करें',
  },
  {
    id: 'caseId',
    icon: 'caseId',
    titleEn: 'Case ID',
    titleHi: 'Case ID',
    descEn: 'You receive a real trackable Case ID from our server — save it.',
    descHi: 'सर्वर से असली Case ID मिलती है — सुरक्षित रखें।',
    route: ROUTES.TRACK_REQUEST,
    ctaEn: 'Track with Case ID',
    ctaHi: 'Case ID से ट्रैक करें',
  },
  {
    id: 'expert',
    icon: 'consultant',
    titleEn: 'Expert Assigned',
    titleHi: 'विशेषज्ञ नियुक्त',
    descEn: 'A verified consultant or coordinator is matched to your scope.',
    descHi: 'सत्यापित विशेषज्ञ या कोऑर्डिनेटर आपके scope से match होता है।',
    route: ROUTES.CONSULTANTS,
    ctaEn: 'Browse experts',
    ctaHi: 'विशेषज्ञ देखें',
  },
  {
    id: 'boq',
    icon: 'boq',
    titleEn: 'BOQ',
    titleHi: 'BOQ',
    descEn: 'Itemized Bill of Quantities with normalized rates and specs.',
    descHi: 'मानक दरों और specs के साथ itemized BOQ।',
    route: ROUTES.BOQ_ESTIMATION,
    ctaEn: 'Explore BOQ tools',
    ctaHi: 'BOQ टूल देखें',
  },
  {
    id: 'compare',
    icon: 'compare',
    titleEn: 'Compare Quotes',
    titleHi: 'कोट तुलना',
    descEn: 'Side-by-side vendor and contractor quotations on one Case ID.',
    descHi: 'एक Case ID पर vendor/contractor कोट की तुलना।',
    route: ROUTES.COMMERCIAL_SUITE,
    ctaEn: 'Compare quotations',
    ctaHi: 'कोट तुलना करें',
  },
  {
    id: 'approve',
    icon: 'approval',
    titleEn: 'Approve',
    titleHi: 'अनुमोदन',
    descEn: 'Review scope, milestones and sign off before work starts.',
    descHi: 'काम शुरू होने से पहले scope और milestones approve करें।',
    route: ROUTES.DASHBOARD,
    ctaEn: 'Open dashboard',
    ctaHi: 'डैशबोर्ड खोलें',
  },
  {
    id: 'execute',
    icon: 'construction',
    titleEn: 'Execute',
    titleHi: 'निर्माण / क्रियान्वयन',
    descEn: 'Site work runs with milestone checks and quality gates.',
    descHi: 'माइलस्टोन और quality checks के साथ site work।',
    route: ROUTES.CONSTRUCTION_MANAGEMENT,
    ctaEn: 'See execution model',
    ctaHi: 'execution model देखें',
  },
  {
    id: 'track',
    icon: 'tracking',
    titleEn: 'Track',
    titleHi: 'ट्रैक',
    descEn: 'Follow live status, documents and messages on your Case ID.',
    descHi: 'Case ID पर live status, documents और messages देखें।',
    route: ROUTES.TRACK_REQUEST,
    ctaEn: 'Track my case',
    ctaHi: 'मेरा केस ट्रैक करें',
  },
  {
    id: 'handover',
    icon: 'verified',
    titleEn: 'Handover',
    titleHi: 'हैंडओवर',
    descEn: 'Final snag clearance, documents and project close-out.',
    descHi: 'अंतिम snag clearance, documents और project close-out।',
    route: ROUTES.PROJECTS,
    ctaEn: 'View completed work',
    ctaHi: 'पूर्ण प्रोजेक्ट देखें',
  },
];
