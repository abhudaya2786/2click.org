/** Public featured consultants shown on homepage — no private contact details. */
export interface FeaturedConsultant {
  id: string;
  slug: string;
  name: string;
  designation: string;
  expertise: string;
  intro: string;
  photoUrl: string;
  disciplines: string[];
  city: string;
  state: string;
  consultantUserId?: string;
}

export const FEATURED_CONSULTANTS: FeaturedConsultant[] = [
  {
    id: 'feat-abbhudaya',
    slug: 'abbhudaya-pratap',
    name: 'Abbhudaya Pratap',
    designation: 'Director & Ecosystem Lead, Build Eco Group',
    expertise: 'Technology · E-Governance · Integrated Project Orchestration',
    intro: 'Leads Build Eco Group\'s integrated ecosystem, bringing technology, property services, expert coordination and project workflows into one structured platform.',
    photoUrl: '/assets/team-photos/abbhudaya-pratap.jpg',
    disciplines: ['PROJECT_MANAGEMENT', 'LAND_GIS', 'TECHNOLOGY'],
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    consultantUserId: 'usr-consultant-abbhudaya',
  },
  {
    id: 'feat-abhishek',
    slug: 'abhishek-mishra',
    name: 'Abhishek Mishra',
    designation: 'Property Expert & Strategic Advisor',
    expertise: 'Land Management · Property Strategy · Investment Advisory',
    intro: 'Brings 21+ years of experience across land management, property transactions, development opportunities and long-term investment strategy.',
    photoUrl: '/assets/team-photos/abhishek-mishra.jpg',
    disciplines: ['PROPERTY_ADVISORY', 'LAND_MANAGEMENT', 'INVESTMENT_STRATEGY'],
    city: 'Gorakhpur',
    state: 'Uttar Pradesh',
    consultantUserId: 'usr-consultant-abhishek',
  },
];
