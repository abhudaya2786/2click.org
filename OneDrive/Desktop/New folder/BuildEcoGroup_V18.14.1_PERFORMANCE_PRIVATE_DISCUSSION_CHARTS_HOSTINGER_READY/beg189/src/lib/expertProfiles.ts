/** Public expert profiles — advisory & leadership positioning, no private contact details. */
export type ExpertProfileKind = 'property' | 'leadership';

export interface ExpertProfile {
  kind: ExpertProfileKind;
  id: string;
  slug: string;
  name: string;
  title: string;
  designation: string;
  experienceLabel: string;
  photoUrl: string;
  city: string;
  state: string;
  intro: string[];
  highlightCards: { title: string; description: string; icon: 'chart' | 'compass' | 'trending' | 'shield' | 'layers' | 'users' }[];
  coreExpertise?: { title: string; description: string }[];
  keyMarkets?: string[];
  strategicGuidance?: { title: string; description: string }[];
  experienceHighlights?: { title: string; description: string }[];
  ecosystemPillars?: string[];
  coreValues?: { title: string; description: string }[];
  mission?: string;
  quote: string;
  ctaLabel: string;
  ctaService?: string;
}

export const ABBHUDAYA_PRATAP_PROFILE: ExpertProfile = {
  kind: 'leadership',
  id: 'expert-abbhudaya',
  slug: 'abbhudaya-pratap',
  name: 'Abbhudaya Pratap',
  title: 'Director, Build Eco Group Private Limited',
  designation: 'Entrepreneur · Cisco Network & Infrastructure Specialist',
  experienceLabel: '15+ Years Experience',
  photoUrl: '/assets/team-photos/abbhudaya-pratap.jpg',
  city: 'Lucknow',
  state: 'Uttar Pradesh',
  intro: [
    'A seasoned entrepreneur and technology professional with 15+ years of diverse experience across IT, government projects, e-governance, consulting and business development.',
    'With more than 15 years of professional experience, his journey has evolved towards real estate and integrated development. Build Eco Group Private Limited is an ecosystem designed to bring together property, construction, expertise, materials, services, technology and investment opportunities to help people build a better, more secure and fulfilling life.',
  ],
  highlightCards: [
    {
      title: 'Technology Leadership',
      description: 'Cisco network & infrastructure expertise applied to scalable project and platform delivery.',
      icon: 'layers',
    },
    {
      title: 'Government & E-Governance',
      description: 'Experience across Karvy, Census, IPM, Aadhaar and other national e-governance initiatives.',
      icon: 'shield',
    },
    {
      title: 'Entrepreneurial Vision',
      description: 'Founded Ani-E Services and leads Build Eco Group as an integrated development ecosystem.',
      icon: 'users',
    },
  ],
  experienceHighlights: [
    {
      title: '15+ Years Professional Experience',
      description: 'Across IT, government projects, e-governance, consulting and business development.',
    },
    {
      title: "Master's Degree — RML University",
      description: 'Academic foundation supporting technology, consulting and enterprise leadership.',
    },
    {
      title: '2011 — Career Beginning',
      description: 'Started as a Cisco Programmer / Network & Infrastructure Specialist.',
    },
    {
      title: 'Government & E-Governance',
      description: 'Key projects with Karvy, Census Department, IPM, Aadhaar and allied initiatives.',
    },
    {
      title: 'Entrepreneurial Journey',
      description: 'Founded Ani-E Services — e-commerce, technology services, project consulting and business development.',
    },
    {
      title: 'Business Partner & Consultant',
      description: 'Associated as partner and consultant for major private and government projects.',
    },
  ],
  ecosystemPillars: [
    'Property',
    'Construction',
    'Expertise',
    'Materials',
    'Services',
    'Technology',
    'Investment Opportunities',
  ],
  mission:
    'To create sustainable value through innovation, integrity and excellence in every project we undertake.',
  coreValues: [
    { title: 'Integrity', description: 'We build trust in everything we do.' },
    { title: 'Quality', description: 'We are committed to the highest standards.' },
    { title: 'Innovation', description: 'We embrace technology and new ideas.' },
    { title: 'Sustainability', description: 'We create value with responsibility and care.' },
    { title: 'Client Focus', description: 'We grow together with our clients and partners.' },
  ],
  quote:
    'The right combination of technology, expertise and real estate can transform lives and create a better tomorrow.',
  ctaLabel: 'Start a Project Discussion',
  ctaService: 'land',
};

export const ABHISHEK_MISHRA_PROFILE: ExpertProfile = {
  kind: 'property',
  id: 'expert-abhishek',
  slug: 'abhishek-mishra',
  name: 'Abhishek Mishra',
  title: 'Property Expert & Strategic Advisor',
  designation: 'Land Management & Strategic Property Advisory',
  experienceLabel: '21+ Years Experience',
  photoUrl: '/assets/team-photos/abhishek-mishra-headshot.png',
  city: 'Gorakhpur',
  state: 'Uttar Pradesh',
  intro: [
    'With a professional journey dating back to 2005, Abhishek Mishra brings more than 21 years of hands-on experience across land, property advisory, strategic investments and development opportunities.',
    'His expertise goes beyond conventional property dealing. He has worked across large land-management assignments, private development opportunities, property transactions and strategic real-estate advisory, helping clients evaluate not only what a property is worth today, but what it can become tomorrow.',
  ],
  highlightCards: [
    {
      title: 'Market Intelligence',
      description: 'In-depth understanding of locations, trends and future development potential.',
      icon: 'chart',
    },
    {
      title: 'Strategic Evaluation',
      description: 'Analysing land and property potential to identify the right opportunities.',
      icon: 'compass',
    },
    {
      title: 'Smart Investments',
      description: 'Guiding clients towards high-value investments and long-term growth.',
      icon: 'trending',
    },
  ],
  coreExpertise: [
    {
      title: 'Land & Property Advisory',
      description: 'End-to-end advisory for buying, selling and evaluating land and properties.',
    },
    {
      title: 'Land Management & Transactions',
      description: 'Large land assignments, title due-diligence, negotiations and transaction support.',
    },
    {
      title: 'Development & Investment Strategy',
      description: 'Identifying development opportunities and creating profitable investment plans.',
    },
    {
      title: 'Market Intelligence',
      description: 'Location analysis, emerging corridors, market trends and future-development potential.',
    },
    {
      title: 'Strategic Evaluation',
      description: 'Assessment of land/property potential before major investment decisions.',
    },
    {
      title: 'Long-Term Investment Planning',
      description: 'Guidance focused on appreciation, exit planning and sustainable wealth creation.',
    },
  ],
  keyMarkets: ['Uttar Pradesh', 'Delhi/NCR', 'Mumbai', 'Overseas Investment Opportunities'],
  strategicGuidance: [
    { title: 'Land & Property Potential', description: 'Assessing the present and future potential of a property.' },
    { title: 'Location & Future Development', description: 'Studying infrastructure, growth corridors and upcoming developments.' },
    { title: 'Investment & Appreciation', description: 'Identifying opportunities with stronger long-term value potential.' },
    { title: 'Commercial & Residential Opportunities', description: 'Evaluating appropriate use and investment possibilities.' },
    { title: 'Development Opportunities', description: 'Exploring private projects, land development and strategic partnerships.' },
    { title: 'Exit & Long-Term Strategy', description: 'Planning investment holding, monetisation and future exit possibilities.' },
  ],
  quote:
    'The right property is not only about what it is worth today — it is about what it can become tomorrow.',
  ctaLabel: 'Discuss Property Requirement',
  ctaService: 'land',
};

const EXPERT_PROFILES: ExpertProfile[] = [ABBHUDAYA_PRATAP_PROFILE, ABHISHEK_MISHRA_PROFILE];

export function getExpertBySlug(slug: string): ExpertProfile | undefined {
  return EXPERT_PROFILES.find((profile) => profile.slug === slug);
}

export function expertPhotoUrl(photoUrl: string): string {
  return photoUrl;
}
