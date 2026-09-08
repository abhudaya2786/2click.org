import { ServiceDefinition, getServiceById } from './servicesRegistry';

export type WizardStepId = 'service' | 'location' | 'details' | 'budget' | 'contact' | 'review' | 'success';

export const WIZARD_STEP_ORDER: WizardStepId[] = [
  'service',
  'location',
  'details',
  'budget',
  'contact',
  'review',
  'success',
];

/** Primary goals shown on step 1 — matches homepage goal tiles (intake only). */
export const WIZARD_PRIMARY_SERVICE_IDS = [
  'construction',
  'land',
  'solar',
  'interior',
  'boq',
  'material',
] as const;

export interface WizardFieldOption {
  value: string;
  labelEn: string;
  labelHi: string;
}

export interface WizardField {
  key: string;
  type: 'select' | 'text' | 'textarea';
  labelEn: string;
  labelHi: string;
  options?: WizardFieldOption[];
  placeholderEn?: string;
  placeholderHi?: string;
  required?: boolean;
}

export const BUDGET_OPTIONS: WizardFieldOption[] = [
  { value: 'under-25L', labelEn: 'Under ₹25 Lakhs', labelHi: '₹25 लाख से कम' },
  { value: '25L-1Cr', labelEn: '₹25L – ₹1 Crore', labelHi: '₹25L – ₹1 करोड़' },
  { value: '1-5Cr', labelEn: '₹1 – ₹5 Crores', labelHi: '₹1 – ₹5 करोड़' },
  { value: '5Cr-plus', labelEn: '₹5 Crores+', labelHi: '₹5 करोड़+' },
  { value: 'discuss', labelEn: 'Prefer to discuss', labelHi: 'चर्चा करना चाहूंगा' },
];

export const TIMELINE_OPTIONS: WizardFieldOption[] = [
  { value: 'asap', labelEn: 'As soon as possible', labelHi: 'जल्द से जल्द' },
  { value: '1-3m', labelEn: 'Within 1–3 months', labelHi: '1–3 महीने में' },
  { value: '3-6m', labelEn: 'Within 3–6 months', labelHi: '3–6 महीने में' },
  { value: '6m-plus', labelEn: '6+ months / flexible', labelHi: '6+ महीने / लचीला' },
];

export const SERVICE_DETAIL_FIELDS: Record<string, WizardField[]> = {
  construction: [
    {
      key: 'projectType',
      type: 'select',
      labelEn: 'What are you building?',
      labelHi: 'आप क्या बना रहे हैं?',
      required: true,
      options: [
        { value: 'villa', labelEn: 'Villa / Home', labelHi: 'विला / घर' },
        { value: 'residential', labelEn: 'Residential building', labelHi: 'आवासीय इमारत' },
        { value: 'commercial', labelEn: 'Commercial / Office', labelHi: 'व्यावसायिक / ऑफिस' },
        { value: 'industrial', labelEn: 'Industrial / Warehouse', labelHi: 'औद्योगिक / गोदाम' },
      ],
    },
    {
      key: 'builtUpArea',
      type: 'text',
      labelEn: 'Approx. built-up area (sq ft)',
      labelHi: 'अनुमानित बिल्ट-अप एरिया (वर्ग फुट)',
      placeholderEn: 'e.g. 2500',
      placeholderHi: 'जैसे 2500',
      required: true,
    },
    {
      key: 'briefNote',
      type: 'textarea',
      labelEn: 'Anything else we should know? (optional)',
      labelHi: 'और कुछ बताना चाहेंगे? (वैकल्पिक)',
      placeholderEn: 'e.g. G+2 villa, mass timber preferred',
      placeholderHi: 'जैसे G+2 विला',
    },
  ],
  land: [
    {
      key: 'landPurpose',
      type: 'select',
      labelEn: 'What do you need help with?',
      labelHi: 'आपको किसमें मदद चाहिए?',
      required: true,
      options: [
        { value: 'buy', labelEn: 'Buy land / property', labelHi: 'ज़मीन / प्रॉपर्टी खरीदना' },
        { value: 'sell', labelEn: 'Sell land / property', labelHi: 'ज़मीन / प्रॉपर्टी बेचना' },
        { value: 'jv', labelEn: 'Develop / Joint Venture', labelHi: 'विकास / जॉइंट वेंचर' },
        { value: 'feasibility', labelEn: 'Feasibility check only', labelHi: 'केवल व्यवहार्यता जाँच' },
      ],
    },
    {
      key: 'landArea',
      type: 'text',
      labelEn: 'Plot / land size',
      labelHi: 'प्लॉट / ज़मीन का आकार',
      placeholderEn: 'e.g. 2000 sq yd or 1 acre',
      placeholderHi: 'जैसे 2000 वर्ग गज',
      required: true,
    },
  ],
  solar: [
    {
      key: 'installationType',
      type: 'select',
      labelEn: 'Installation type',
      labelHi: 'इंस्टॉलेशन प्रकार',
      required: true,
      options: [
        { value: 'rooftop-home', labelEn: 'Home rooftop', labelHi: 'घर की छत' },
        { value: 'rooftop-commercial', labelEn: 'Commercial rooftop', labelHi: 'व्यावसायिक छत' },
        { value: 'ground-mount', labelEn: 'Ground mount / MW scale', labelHi: 'ग्राउंड माउंट' },
      ],
    },
    {
      key: 'monthlyBill',
      type: 'select',
      labelEn: 'Average monthly electricity bill',
      labelHi: 'औसत मासिक बिजली बिल',
      required: true,
      options: [
        { value: 'under-3k', labelEn: 'Under ₹3,000', labelHi: '₹3,000 से कम' },
        { value: '3k-10k', labelEn: '₹3,000 – ₹10,000', labelHi: '₹3,000 – ₹10,000' },
        { value: '10k-50k', labelEn: '₹10,000 – ₹50,000', labelHi: '₹10,000 – ₹50,000' },
        { value: '50k-plus', labelEn: '₹50,000+', labelHi: '₹50,000+' },
      ],
    },
  ],
  interior: [
    {
      key: 'spaceType',
      type: 'select',
      labelEn: 'Space type',
      labelHi: 'स्थान का प्रकार',
      required: true,
      options: [
        { value: 'home', labelEn: 'Home / Apartment', labelHi: 'घर / अपार्टमेंट' },
        { value: 'office', labelEn: 'Office / Commercial', labelHi: 'ऑफिस / व्यावसायिक' },
        { value: 'retail', labelEn: 'Retail / Showroom', labelHi: 'रिटेल / शोरूम' },
      ],
    },
    {
      key: 'areaSqFt',
      type: 'text',
      labelEn: 'Area to design (sq ft)',
      labelHi: 'डिज़ाइन एरिया (वर्ग फुट)',
      placeholderEn: 'e.g. 1800',
      placeholderHi: 'जैसे 1800',
      required: true,
    },
  ],
  boq: [
    {
      key: 'projectStage',
      type: 'select',
      labelEn: 'Project stage',
      labelHi: 'प्रोजेक्ट स्टेज',
      required: true,
      options: [
        { value: 'planning', labelEn: 'Planning / pre-construction', labelHi: 'योजना / निर्माण पूर्व' },
        { value: 'active', labelEn: 'Under construction', labelHi: 'निर्माणाधीन' },
        { value: 'renovation', labelEn: 'Renovation / retrofit', labelHi: 'रेनोवेशन' },
      ],
    },
    {
      key: 'estimateNeed',
      type: 'select',
      labelEn: 'What estimate do you need?',
      labelHi: 'आपको किस अनुमान की ज़रूरत है?',
      required: true,
      options: [
        { value: 'full-boq', labelEn: 'Full BOQ / quantity survey', labelHi: 'पूर्ण BOQ' },
        { value: 'material', labelEn: 'Material cost estimate', labelHi: 'सामग्री लागत अनुमान' },
        { value: 'compare', labelEn: 'Compare vendor quotes', labelHi: 'विक्रेता कोट तुलना' },
      ],
    },
  ],
  material: [
    {
      key: 'materialCategory',
      type: 'select',
      labelEn: 'Material category',
      labelHi: 'सामग्री श्रेणी',
      required: true,
      options: [
        { value: 'steel', labelEn: 'Steel / TMT', labelHi: 'स्टील / TMT' },
        { value: 'cement', labelEn: 'Cement / RMC', labelHi: 'सीमेंट / RMC' },
        { value: 'tiles', labelEn: 'Tiles / Sanitary', labelHi: 'टाइल्स / सैनिटरी' },
        { value: 'mixed', labelEn: 'Mixed / multiple items', labelHi: 'मिश्रित / कई आइटम' },
      ],
    },
    {
      key: 'quantityEstimate',
      type: 'text',
      labelEn: 'Approx. quantity or scope (optional)',
      labelHi: 'अनुमानित मात्रा (वैकल्पिक)',
      placeholderEn: 'e.g. 50 MT steel, 200 bags cement',
      placeholderHi: 'जैसे 50 MT स्टील',
    },
  ],
};

/** Fallback for extended catalog services (water, gis, etc.) */
export const GENERIC_DETAIL_FIELDS: WizardField[] = [
  {
    key: 'briefDescription',
    type: 'textarea',
    labelEn: 'Briefly describe what you need',
    labelHi: 'संक्षेप में बताएं आपको क्या चाहिए',
    placeholderEn: 'A coordinator will collect technical details later.',
    placeholderHi: 'कोऑर्डिनेटर बाद में तकनीकी विवरण लेंगे।',
    required: true,
  },
];

export function getDetailFieldsForService(serviceId: string): WizardField[] {
  return SERVICE_DETAIL_FIELDS[serviceId] ?? GENERIC_DETAIL_FIELDS;
}

export function serviceNeedsBudgetStep(service: ServiceDefinition): boolean {
  return !['consultants'].includes(service.id);
}

export function buildWizardTitle(
  service: ServiceDefinition,
  details: Record<string, string>,
  city: string
): string {
  const hint =
    details.projectType ||
    details.landPurpose ||
    details.installationType ||
    details.spaceType ||
    details.estimateNeed ||
    details.materialCategory ||
    details.briefDescription?.slice(0, 40) ||
    service.shortTitle;
  return `${service.shortTitle} — ${hint} (${city})`;
}

export function resolveInitialService(serviceId?: string): ServiceDefinition {
  if (serviceId) {
    const found = getServiceById(serviceId);
    if (found) return found;
  }
  return getServiceById('construction')!;
}
