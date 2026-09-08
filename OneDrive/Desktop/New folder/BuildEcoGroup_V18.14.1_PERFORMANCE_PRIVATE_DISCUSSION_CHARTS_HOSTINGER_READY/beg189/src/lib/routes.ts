/**
 * Central Route Map for BuildEcoGroup Clean Master
 */
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  PILLARS: '/pillars',
  SERVICES: '/services',
  CONSULTANTS: '/consultants',
  EXPERT_PROFILE: (slug: string) => `/experts/${slug}`,
  PROPERTY_EXPERT_PROFILE: (slug: string) => `/experts/${slug}`,
  PROPERTY: '/property',
  TECHNOLOGY: '/technology',
  CONTACT: '/contact',
  INITIATE_PROJECT: '/initiate-project',
  SUBMIT_REQUIREMENT: '/initiate-project',
  ONBOARDING: '/onboarding',
  CONSULTANTS_JOIN: '/onboarding',
  
  // Dedicated Service & Technology Landing Routes (SEO & Structured Journeys)
  LAND_DEVELOPMENT: '/land-development',
  LAND_FEASIBILITY: '/land-feasibility',
  CONSTRUCTION_MANAGEMENT: '/construction-management',
  BOQ_ESTIMATION: '/boq-estimation',
  SOLAR: '/solar',
  WATER_TREATMENT: '/water-treatment',
  WASTE_MANAGEMENT: '/waste-management',
  MAINTENANCE_AMC: '/maintenance-amc',
  GIS: '/gis',
  PROJECT_MONITORING: '/project-monitoring',
  MATERIAL_PROCUREMENT: '/material-procurement',
  INTERIOR: '/interior',
  VASTU: '/vastu',
  WORKERS: '/workers',
  EQUIPMENT: '/equipment',

  // Local SEO Routes (Regional Hubs)
  LOCAL_LUCKNOW: '/services/lucknow',
  LOCAL_GORAKHPUR: '/services/gorakhpur',

  // Projects & Case Studies Portfolio
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
  PROJECT_DETAIL_DEFAULT: '/projects/BEG-4092',

  // Research & Knowledge Hub (SEO Content Engine)
  RESEARCH: '/research',
  BLOG: '/blog',
  
  // Tracking & Request Portal
  TRACK_REQUEST: '/track',
  TRACK: '/track',

  // Auth Routes
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Dashboard & Console Workspaces
  DASHBOARD: '/dashboard',
  CUSTOMER_DASHBOARD: '/dashboard/user',
  USER_DASHBOARD: '/dashboard/user',
  CONSULTANT_DASHBOARD: '/dashboard/consultant',
  EMPLOYEE_DASHBOARD: '/dashboard/employee',
  ADMIN_DASHBOARD: '/dashboard/admin',
  SUPER_ADMIN_DASHBOARD: '/dashboard/super-admin',
  COMMERCIAL_SUITE: '/dashboard/commercial',
  MARKETPLACE: '/marketplace',
  CASES: '/dashboard/cases',
  DOCUMENTS: '/dashboard/documents',
  MESSAGES: '/dashboard/messages',
  SETTINGS: '/dashboard/settings',
  
  // Feature Anchors
  SURVEILLANCE: '/services#surveillance',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];

