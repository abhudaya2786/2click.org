import { ROUTES } from './routes';

export const SITE_URL = 'https://www.buildecogroup.com';

export type SeoMeta = {
  title: string;
  description: string;
  canonicalPath?: string;
  robots?: 'index, follow' | 'noindex, nofollow';
  ogType?: 'website' | 'article';
};

const DEFAULT_DESCRIPTION =
  'BuildEcoGroup is a connected ecosystem for land development, construction management, verified professionals, procurement and property lifecycle. Phone: +91 7007254932';

export const DEFAULT_SEO: SeoMeta = {
  title: 'BuildEcoGroup | From Land to Project. From Construction to Management.',
  description: DEFAULT_DESCRIPTION,
  canonicalPath: '/',
  robots: 'index, follow',
  ogType: 'website',
};

/** Exact-path SEO entries for public marketing pages */
export const ROUTE_SEO: Record<string, SeoMeta> = {
  [ROUTES.HOME]: {
    title: 'BuildEcoGroup | Land to Project · Construction Management India',
    description:
      'Connected platform for land feasibility, verified consultants, CPWD-normalized BOQ, contractor comparison and milestone tracking across India.',
    canonicalPath: '/',
  },
  [ROUTES.ABOUT]: {
    title: 'About BuildEcoGroup | Zero Contractor Bias Platform',
    description: 'Learn about BuildEcoGroup — Lucknow HQ, Gorakhpur hub, and our charter for transparent construction orchestration.',
    canonicalPath: '/about',
  },
  [ROUTES.PILLARS]: {
    title: '5 Pillars of BuildEcoGroup | Land · Build · BOQ · Property · Tech',
    description: 'Explore the five interconnected pillars: land-to-project, construction management, BOQ normalization, property lifecycle and technology.',
    canonicalPath: '/pillars',
  },
  [ROUTES.SERVICES]: {
    title: 'Construction & Development Services | BuildEcoGroup',
    description: 'Solar, water treatment, GIS, interior, waste management, AMC and more — orchestrated through one case-based platform.',
    canonicalPath: '/services',
  },
  [ROUTES.CONSULTANTS]: {
    title: 'Verified Architects & Engineers Directory | BuildEcoGroup',
    description: 'Empanelled structural engineers, architects, MEP consultants and project managers — peer-reviewed and case-assigned.',
    canonicalPath: '/consultants',
  },
  [ROUTES.PROPERTY]: {
    title: 'Property Marketplace & JV Listings | BuildEcoGroup',
    description: 'Residential, commercial and land parcels with verified documentation, yield analytics and owner inquiry workflows.',
    canonicalPath: '/property',
  },
  [ROUTES.TECHNOLOGY]: {
    title: 'Construction Technology & Platform | BuildEcoGroup',
    description: 'Case tracking, BOQ engines, GIS overlays, surveillance integrations and digital handover for Indian construction projects.',
    canonicalPath: '/technology',
  },
  [ROUTES.CONTACT]: {
    title: 'Contact BuildEcoGroup | Lucknow HQ · Gorakhpur Hub',
    description: 'Reach BuildEcoGroup for land feasibility, construction management and consultant empanelment. Phone: +91 7007254932.',
    canonicalPath: '/contact',
  },
  [ROUTES.INITIATE_PROJECT]: {
    title: 'Start Your Project Case | BuildEcoGroup Intake',
    description: 'Structured requirement intake with zero sales pressure. Get a Case ID, expert assignment and comparable BOQ packages.',
    canonicalPath: '/initiate-project',
  },
  [ROUTES.ONBOARDING]: {
    title: 'Join BuildEco Consultant Network | Empanelment',
    description: 'Apply to join BuildEcoGroup as a verified architect, engineer or contractor partner with transparent case routing.',
    canonicalPath: '/onboarding',
  },
  [ROUTES.LAND_DEVELOPMENT]: {
    title: 'Land Development & Feasibility | BuildEcoGroup',
    description: 'GIS-backed land feasibility, zoning checks, JV structuring and land-to-project orchestration across Uttar Pradesh and India.',
    canonicalPath: '/land-development',
  },
  [ROUTES.LAND_FEASIBILITY]: {
    title: 'Land Feasibility Study | BuildEcoGroup',
    description: 'Due diligence, title verification, FAR analysis and development potential reports for residential and commercial parcels.',
    canonicalPath: '/land-feasibility',
  },
  [ROUTES.CONSTRUCTION_MANAGEMENT]: {
    title: 'Construction Management & Monitoring | BuildEcoGroup',
    description: '5-stage escrow, milestone approvals, site surveillance, peer review and contractor governance for Indian projects.',
    canonicalPath: '/construction-management',
  },
  [ROUTES.PROJECT_MONITORING]: {
    title: 'Project Monitoring & Site Controls | BuildEcoGroup',
    description: 'Real-time milestone tracking, quality audits and progress dashboards for owners and developers.',
    canonicalPath: '/project-monitoring',
  },
  [ROUTES.BOQ_ESTIMATION]: {
    title: 'BOQ Estimation & CPWD-Normalized Costing | BuildEcoGroup',
    description: 'Itemized Bill of Quantities with CPWD DSR calibration, rebar tonnage, cement bags and contractor tender packages.',
    canonicalPath: '/boq-estimation',
  },
  [ROUTES.SOLAR]: {
    title: 'Solar & PM Surya Ghar | BuildEcoGroup',
    description: 'Rooftop solar design, subsidy navigation, vendor comparison and installation oversight for residential and commercial sites.',
    canonicalPath: '/solar',
  },
  [ROUTES.WATER_TREATMENT]: {
    title: 'Water Treatment & STP Solutions | BuildEcoGroup',
    description: 'STP, WTP, rainwater harvesting and compliance-ready water infrastructure for housing societies and industries.',
    canonicalPath: '/water-treatment',
  },
  '/water': {
    title: 'Water Treatment & STP Solutions | BuildEcoGroup',
    description: 'STP, WTP, rainwater harvesting and compliance-ready water infrastructure for housing societies and industries.',
    canonicalPath: '/water-treatment',
  },
  [ROUTES.WASTE_MANAGEMENT]: {
    title: 'Waste Management & Compliance | BuildEcoGroup',
    description: 'Solid waste, biomedical and construction debris management with regulatory compliance for Indian projects.',
    canonicalPath: '/waste-management',
  },
  [ROUTES.MAINTENANCE_AMC]: {
    title: 'Facility Maintenance & AMC | BuildEcoGroup',
    description: 'Annual maintenance contracts, HVAC, electrical and civil AMC for commercial and residential assets.',
    canonicalPath: '/maintenance-amc',
  },
  [ROUTES.GIS]: {
    title: 'GIS & Land Intelligence | BuildEcoGroup',
    description: 'Parcel mapping, contour analysis, utility overlays and spatial feasibility for land acquisition teams.',
    canonicalPath: '/gis',
  },
  [ROUTES.MATERIAL_PROCUREMENT]: {
    title: 'Material Procurement & 2CLICK Mart | BuildEcoGroup',
    description: 'Normalized material rates, vendor quotes and procurement workflows tied to approved BOQ line items.',
    canonicalPath: '/material-procurement',
  },
  [ROUTES.INTERIOR]: {
    title: 'Interior Design & Fit-Out | BuildEcoGroup',
    description: 'Residential and commercial interior design with BOQ-linked contractor packages and milestone billing.',
    canonicalPath: '/interior',
  },
  [ROUTES.VASTU]: {
    title: 'Vastu Consultation | BuildEcoGroup',
    description: 'Certified Vastu consultants for layout review, remediation and design alignment before construction.',
    canonicalPath: '/vastu',
  },
  [ROUTES.WORKERS]: {
    title: 'Skilled Construction Workers | BuildEcoGroup',
    description: 'Verified masons, electricians, plumbers and site supervisors for project-based deployment.',
    canonicalPath: '/workers',
  },
  [ROUTES.EQUIPMENT]: {
    title: 'Construction Equipment Rental | BuildEcoGroup',
    description: 'Cranes, excavators, batching plants and site equipment sourcing with transparent rate cards.',
    canonicalPath: '/equipment',
  },
  [ROUTES.LOCAL_LUCKNOW]: {
    title: 'Construction Services Lucknow | BuildEcoGroup HQ',
    description: 'Land feasibility, BOQ, architects and construction management in Lucknow and Gomti Nagar corridor.',
    canonicalPath: '/services/lucknow',
  },
  [ROUTES.LOCAL_GORAKHPUR]: {
    title: 'Construction Services Gorakhpur | BuildEcoGroup East UP',
    description: 'Regional hub for land development, house construction costing and verified consultants in Gorakhpur.',
    canonicalPath: '/services/gorakhpur',
  },
  [ROUTES.PROJECTS]: {
    title: 'Projects & Portfolio | BuildEcoGroup Case Studies',
    description: 'Completed and in-progress construction, land and solar projects delivered through the BuildEco platform.',
    canonicalPath: '/projects',
  },
  [ROUTES.RESEARCH]: {
    title: 'Research & Construction Guides | BuildEcoGroup',
    description: 'CPWD costing guides, BOQ best practices, land due diligence checklists and construction management insights.',
    canonicalPath: '/research',
  },
  [ROUTES.BLOG]: {
    title: 'BuildEco Blog | Construction & Land Insights',
    description: 'Articles on house construction cost, BOQ normalization, solar subsidies and project governance in India.',
    canonicalPath: '/blog',
  },
  [ROUTES.TRACK_REQUEST]: {
    title: 'Track Your Case | BuildEcoGroup Portal',
    description: 'Enter your Case ID to view status, milestones, BOQ progress and expert assignments on BuildEcoGroup.',
    canonicalPath: '/track',
  },
  '/experts/abhishek-mishra': {
    title: 'Abhishek Mishra | Property Expert & Strategic Advisor | BuildEcoGroup',
    description:
      '21+ years in land management, property advisory and strategic real-estate investments across Uttar Pradesh, Delhi/NCR, Mumbai and overseas opportunities.',
    canonicalPath: '/experts/abhishek-mishra',
  },
  '/experts/abbhudaya-pratap': {
    title: 'Abbhudaya Pratap | Director, Build Eco Group | BuildEcoGroup',
    description:
      'Director and ecosystem lead with 15+ years across technology, e-governance, consulting and integrated real-estate development.',
    canonicalPath: '/experts/abbhudaya-pratap',
  },
};

const PRIVATE_PREFIXES = ['/dashboard', '/marketplace'];
const PRIVATE_EXACT = new Set<string>([ROUTES.LOGIN, ROUTES.REGISTER]);

const KNOWN_PUBLIC_EXACT = new Set(Object.keys(ROUTE_SEO));

export function isPrivateRoute(pathname: string): boolean {
  if (PRIVATE_EXACT.has(pathname)) return true;
  return PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isNoindexPublicRoute(pathname: string): boolean {
  if (/^\/track\/[^/]+/.test(pathname)) return true;
  if (/^\/cases\/[^/]+/.test(pathname)) return true;
  if (/^\/projects\/[^/]+/.test(pathname)) return true;
  return false;
}

export function isKnownPublicRoute(pathname: string): boolean {
  if (KNOWN_PUBLIC_EXACT.has(pathname)) return true;
  if (/^\/services\/[a-z0-9-]+$/i.test(pathname)) return true;
  if (/^\/experts\/[a-z0-9-]+$/i.test(pathname)) return true;
  if (pathname === '/water-landing') return true;
  return false;
}

export function resolveSeoMeta(pathname: string): SeoMeta {
  if (isPrivateRoute(pathname)) {
    return {
      title: 'BuildEcoGroup Console',
      description: DEFAULT_DESCRIPTION,
      robots: 'noindex, nofollow',
    };
  }

  if (!isKnownPublicRoute(pathname) || pathname.includes('should-404')) {
    return {
      title: 'Page Not Found | BuildEcoGroup',
      description: 'The requested page could not be found on BuildEcoGroup.',
      robots: 'noindex, nofollow',
    };
  }

  const exact = ROUTE_SEO[pathname];
  if (exact) {
    return { ...DEFAULT_SEO, ...exact };
  }

  if (/^\/services\/[a-z0-9-]+$/i.test(pathname)) {
    const city = pathname.split('/').pop()?.replace(/-/g, ' ') ?? 'India';
    const titleCity = city.charAt(0).toUpperCase() + city.slice(1);
    return {
      ...DEFAULT_SEO,
      title: `Construction Services ${titleCity} | BuildEcoGroup`,
      description: `Land feasibility, BOQ estimation, verified consultants and construction management in ${titleCity}.`,
      canonicalPath: pathname,
    };
  }

  if (isNoindexPublicRoute(pathname)) {
    return {
      title: 'BuildEcoGroup Case Portal',
      description: DEFAULT_DESCRIPTION,
      canonicalPath: pathname,
      robots: 'noindex, nofollow',
    };
  }

  return DEFAULT_SEO;
}

export function canonicalUrl(pathname: string, meta: SeoMeta): string {
  const path = meta.canonicalPath ?? pathname;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Public URLs for sitemap generation (static list) */
export const SITEMAP_PATHS: string[] = [
  '/',
  '/about',
  '/pillars',
  '/services',
  '/consultants',
  '/experts/abhishek-mishra',
  '/experts/abbhudaya-pratap',
  '/property',
  '/technology',
  '/contact',
  '/initiate-project',
  '/onboarding',
  '/land-development',
  '/land-feasibility',
  '/construction-management',
  '/project-monitoring',
  '/boq-estimation',
  '/solar',
  '/water-treatment',
  '/waste-management',
  '/maintenance-amc',
  '/gis',
  '/material-procurement',
  '/interior',
  '/vastu',
  '/workers',
  '/equipment',
  '/services/lucknow',
  '/services/gorakhpur',
  '/projects',
  '/research',
  '/blog',
  '/track',
];
