import { PillarItem, SecondaryCapability, ConsultantMock, WorkflowStepItem, TrustCapabilityItem } from '../types/common';
import { NavItem, MegaMenuCategory, FooterGroup } from '../types/navigation';
import { ROUTES } from './routes';

export const APP_CONFIG = {
  name: 'BuildEcoGroup',
  tagline: 'From Land to Project. From Construction to Management.',
  version: 'BuildEcoGroup V18.14.1',
  positioningSummary:
    'A connected platform for land development, construction management, verified professionals, procurement, and property lifecycle coordination.',
  contactEmail: 'conect@buildecogroup.com',
  supportPhone: '+91 7007254932',
  officialDomain: 'https://www.buildecogroup.com',
  officeAddress: 'BuildEcoGroup Corporate Office, Cyber Heights, Vibhuti Khand, Gomti Nagar, Lucknow, Uttar Pradesh 226010, India',
  officeLocations: ['Lucknow (HQ)', 'Gorakhpur', 'Varanasi', 'Kanpur', 'Noida / NCR'],
} as const;

/**
 * Curated architectural & project orchestration image assets
 */
export const ASSETS = {
  hero: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
  heroSecondary: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
  architectureSustainable: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  gisSite: 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1200&q=80',
  timberEngineering: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  solarEnergy: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
  consultant1: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  consultant2: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
  consultant3: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
  consultant4: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
} as const;

/**
 * Main Top-Level Navigation Items
 * Desktop layout: Logo | Explore | Land | Construction | Consultants | Login | Start
 */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Explore', href: '#explore', hasMegaMenu: true },
  { label: 'Land', href: ROUTES.LAND_DEVELOPMENT },
  { label: 'Construction', href: ROUTES.CONSTRUCTION_MANAGEMENT },
  { label: 'Consultants', href: ROUTES.CONSULTANTS },
  { label: 'BOQ Estimator', href: ROUTES.BOQ_ESTIMATION },
  { label: 'Property', href: ROUTES.PROPERTY },
];

/**
 * 5 Core Strategic Pillars of BuildEcoGroup
 */
export const FIVE_PILLARS: PillarItem[] = [
  {
    id: 'construction-services',
    number: '01',
    title: 'Construction-related Services',
    shortDescription:
      'Structured technical scopes, architectural vetting, MEP coordination and execution management across project stages.',
    detailedDescription:
      'Orchestrates architectural frameworks, structural assessments, MEP systems design, materials specification, and multi-trade site scheduling with independent milestone signoffs.',
    icon: 'Hammer',
    href: ROUTES.PILLARS,
    badge: 'Core Foundation',
    keyCapabilities: ['Technical Scope Definition', 'Architectural Audits', 'MEP Systems Design', 'Material Verification'],
  },
  {
    id: 'surveillance-site-tech',
    number: '02',
    title: 'Surveillance & Site Technology',
    shortDescription:
      'Live perimeter monitoring, camera integration, drone progress records, and sensor-based environmental verification.',
    detailedDescription:
      'Deploys site surveillance cameras, automated perimeter monitoring, drone photogrammetry time-lapses, and environmental sensors for transparent real-time site oversight.',
    icon: 'ShieldCheck',
    href: ROUTES.PILLARS,
    badge: 'Site Tech',
    keyCapabilities: ['Site Video Feeds', 'Drone Photogrammetry', 'Perimeter Alarms', 'Sensor-based Audits'],
  },
  {
    id: 'land-property-assistance',
    number: '03',
    title: 'Land & Property Assistance',
    shortDescription:
      'Title clarity checks, zoning verification, contour surveying, and environmental impact feasibility.',
    detailedDescription:
      'Coordinates geospatial title boundary reviews, municipal master plan zoning validations, topographic contour modeling, and soil stability vetting prior to capital commitment.',
    icon: 'MapPin',
    href: ROUTES.PROPERTY,
    badge: 'Land Intelligence',
    keyCapabilities: ['GIS Boundary Verification', 'Zoning & Masterplan Checks', 'Soil & Contour Analysis', 'Legal Encumbrance Audit'],
  },
  {
    id: 'consultant-departments',
    number: '04',
    title: 'Consultant for Every Department',
    shortDescription:
      'Empaneled independent specialists in structural engineering, sustainability, acoustics, façade, and landscaping.',
    detailedDescription:
      'Provides direct access to verified domain specialists across 14+ technical engineering disciplines with clear scope deliverables and standardized engagement frameworks.',
    icon: 'Users',
    href: ROUTES.CONSULTANTS,
    badge: 'Verified Experts',
    keyCapabilities: ['Structural Engineers', 'Acoustic Designers', 'Sustainability Advisors', 'Façade Engineers'],
  },
  {
    id: 'innovation-startups',
    number: '05',
    title: 'Innovation & Startup Introduction',
    shortDescription:
      'Integration pathway for emerging climate-tech materials, low-carbon concrete, smart automation, and IoT hardware.',
    detailedDescription:
      'Connects progressive real-estate owners and developers with tested climate-tech startups, novel composite materials, smart building automation, and off-grid utilities.',
    icon: 'Sparkles',
    href: ROUTES.TECHNOLOGY,
    badge: 'Climate Tech',
    keyCapabilities: ['Low-Carbon Materials', 'Smart IoT Building Automation', 'Prefabrication Vetting', 'Clean Energy Pilots'],
  },
];

/**
 * Secondary Capabilities (Technical modules - not main pillars)
 */
export const SECONDARY_CAPABILITIES: SecondaryCapability[] = [
  {
    id: 'gis',
    title: 'Land GIS & Spatial Analysis',
    category: 'Technology',
    description: 'Cadastral overlay, elevation contours, flood plain risk mapping, and satellite asset monitoring.',
    icon: 'Globe',
    href: `${ROUTES.TECHNOLOGY}#gis`,
    tag: 'Spatial Tech',
  },
  {
    id: 'boq',
    title: 'BOQ & Cost Estimation',
    category: 'Engineering',
    description: 'Standardized Bill of Quantities structure, rate benchmarking, and item-by-item tender comparison.',
    icon: 'Calculator',
    href: `${ROUTES.SERVICES}#boq`,
    tag: 'Cost Intelligence',
  },
  {
    id: 'solar',
    title: 'Solar & Clean Microgrids',
    category: 'Sustainability',
    description: 'Rooftop irradiation assessment, photovoltaic capacity sizing, storage simulation, and grid-tie audits.',
    icon: 'SunMedium',
    href: `${ROUTES.TECHNOLOGY}#solar`,
    tag: 'Renewables',
  },
  {
    id: 'water-treatment',
    title: 'Water Treatment & Recycling',
    category: 'Sustainability',
    description: 'STP sizing, rainwater harvesting hydraulic design, greywater loop modeling, and filtration protocols.',
    icon: 'Droplets',
    href: ROUTES.WATER_TREATMENT,
    tag: 'Hydrology',
  },
  {
    id: 'waste-management',
    title: 'Solid Waste & Composting',
    category: 'Sustainability',
    description: 'Zero-discharge site strategies, organic waste composting design, and municipal solid-waste segregation.',
    icon: 'Recycle',
    href: `${ROUTES.SERVICES}#waste`,
    tag: 'Zero Waste',
  },
  {
    id: 'maintenance',
    title: 'Facility Maintenance Protocols',
    category: 'Site',
    description: 'Preventive HVAC/MEP schedule templates, asset lifecycle tracking, and AMC contractor benchmark audits.',
    icon: 'Wrench',
    href: `${ROUTES.SERVICES}#maintenance`,
    tag: 'Operations',
  },
  {
    id: 'vastu',
    title: 'Vastu & Geo-Spatial Alignment',
    category: 'Engineering',
    description: 'Scientific directional energy analysis, site orientation compliance, and spatial zoning harmonics.',
    icon: 'Compass',
    href: `${ROUTES.SERVICES}#vastu`,
    tag: 'Spatial Alignment',
  },
  {
    id: 'drone-lidar',
    title: 'Drone Survey & LiDAR Scanning',
    category: 'Technology',
    description: 'Millimeter-accurate Point Cloud generation, 3D volumetric earthwork checks, and façade photogrammetry.',
    icon: 'Layers',
    href: `${ROUTES.TECHNOLOGY}#lidar`,
    tag: 'Site Scanning',
  },
];

/**
 * Mock UI Consultant Data (Dev Fixtures for Phase 1 preview)
 * Note: Clearly labeled as mock UI data.
 */
export const MOCK_CONSULTANTS: ConsultantMock[] = [
  {
    id: 'c1',
    name: 'Dr. Ar. Elena Rostova',
    title: 'Senior Bioclimatic Architect',
    specialization: 'Passive Solar & Mass Timber Systems',
    city: 'Bengaluru',
    state: 'Karnataka',
    experienceLabel: '16+ Years Field Experience',
    verifiedStatus: 'Verified Specialist',
    avatarUrl: ASSETS.consultant1,
    focusAreas: ['Bioclimatic Envelope', 'Mass Timber', 'LEED Platinum Audit'],
    department: 'Architecture & Sustainable Design',
  },
  {
    id: 'c2',
    name: 'Er. Rajesh V. Nambiar',
    title: 'Lead Structural Consultant',
    specialization: 'Seismic Resilience & Post-Tensioned Slabs',
    city: 'Mumbai',
    state: 'Maharashtra',
    experienceLabel: '20+ Years Field Experience',
    verifiedStatus: 'Credential Vetted',
    avatarUrl: ASSETS.consultant2,
    focusAreas: ['High-Rise Seismic', 'Finite Element Analysis', 'Retrofit Audits'],
    department: 'Structural Engineering',
  },
  {
    id: 'c3',
    name: 'Er. Priya Swaminathan',
    title: 'Geospatial & Hydrogeology Specialist',
    specialization: 'GIS Contour Modeling & Rainwater Hydrodynamics',
    city: 'Hyderabad',
    state: 'Telangana',
    experienceLabel: '12+ Years Field Experience',
    verifiedStatus: 'Verified Specialist',
    avatarUrl: ASSETS.consultant3,
    focusAreas: ['LiDAR Topography', 'Aquifer Recharging', 'Flood Risk GIS'],
    department: 'Land & Environmental Intelligence',
  },
  {
    id: 'c4',
    name: 'Er. Amitav Sengupta',
    title: 'Chief MEP & Microgrid Consultant',
    specialization: 'Zero-Energy HVAC & Smart Sub-metering',
    city: 'New Delhi',
    state: 'NCR',
    experienceLabel: '15+ Years Field Experience',
    verifiedStatus: 'Empaneled Expert',
    avatarUrl: ASSETS.consultant4,
    focusAreas: ['Geothermal Heat Pumps', 'BMS Automation', 'Solar Microgrids'],
    department: 'Building Services (MEP)',
  },
];

/**
 * 5 Sequential Workflow Steps of the Orchestration Engine
 */
export const WORKFLOW_STEPS: WorkflowStepItem[] = [
  {
    stepNumber: 1,
    title: 'Submit Requirement',
    subtitle: 'Define Needs & Context',
    description:
      'Enter your project location, scope scale, technical priorities, and target milestones through a structured form.',
    icon: 'FileSpreadsheet',
    deliverable: 'Generated Requirement Blueprint',
  },
  {
    stepNumber: 2,
    title: 'Case is Structured',
    subtitle: 'Standardized Case ID',
    description:
      'BuildEcoGroup coordinator structures your inputs into a standardized engineering briefing with clear deliverables.',
    icon: 'FolderKanban',
    deliverable: 'Standardized Case Specification',
  },
  {
    stepNumber: 3,
    title: 'Relevant Experts Matched',
    subtitle: 'Independent Specialist Vetting',
    description:
      'Qualified independent consultants and solution providers receive structured scopes based on domain credentials.',
    icon: 'UserCheck',
    deliverable: 'Vetted Specialist Candidate List',
  },
  {
    stepNumber: 4,
    title: 'Compare & Coordinate',
    subtitle: 'Transparent Scope & BOQ',
    description:
      'Review side-by-side technical proposals, normalized BOQ rates, and verified deliverables with complete clarity.',
    icon: 'Scale',
    deliverable: 'Item-by-Item Comparison Matrix',
  },
  {
    stepNumber: 5,
    title: 'Track Project Journey',
    subtitle: 'Milestone & Quality Governance',
    description:
      'Coordinate site progress, milestone verifications, and document releases through one auditable digital record.',
    icon: 'CheckCircle2',
    deliverable: 'Auditable Milestone Completion Pack',
  },
];

/**
 * 6 Capability-Based Trust Anchors (No fake aggregate stats)
 */
export const TRUST_CAPABILITIES: TrustCapabilityItem[] = [
  {
    id: 'verified-profiles',
    title: 'Verified Profiles',
    subtitle: 'Credential & License Vetting',
    description:
      'Specialists undergo professional license checks, past structural review verification, and department empanelment.',
    icon: 'BadgeCheck',
    guaranteeNote: 'Independent professional verification standard',
  },
  {
    id: 'structured-requirements',
    title: 'Structured Requirements',
    subtitle: 'Clear Scope Before Quoting',
    description:
      'No ambiguous phone estimates. Every project starts with a structured case file defining technical criteria and bounds.',
    icon: 'FileText',
    guaranteeNote: 'Standardized technical brief',
  },
  {
    id: 'controlled-data',
    title: 'Controlled Data Access',
    subtitle: 'Privacy & Proprietary Protection',
    description:
      'Your property land records, blueprints, and budgets are shared only with explicitly assigned and signed consultants.',
    icon: 'Lock',
    guaranteeNote: 'Role-gated document sharing',
  },
  {
    id: 'transparent-comparison',
    title: 'Transparent Comparison',
    subtitle: 'Normalized Rate Benchmarks',
    description:
      'Compare consultant scopes and provider estimates on standardized BOQ templates without hidden markup layers.',
    icon: 'BarChart3',
    guaranteeNote: 'Objective line-item evaluation',
  },
  {
    id: 'trackable-workflow',
    title: 'Trackable Workflow',
    subtitle: 'Predictable Step Progression',
    description:
      'From Case ID creation to milestone signoff, every stakeholder operates against transparent timeline gates.',
    icon: 'GitBranch',
    guaranteeNote: 'Stage-gated governance model',
  },
  {
    id: 'auditable-records',
    title: 'Auditable Records',
    subtitle: 'Tamper-Resistant Project History',
    description:
      'Maintain an organized digital vault of drawing revisions, site camera logs, soil reports, and signed clearances.',
    icon: 'Archive',
    guaranteeNote: 'Permanent digital asset archive',
  },
];

/**
 * Mega Menu Structure for rich discovery
 */
export const MEGA_MENU_DATA: MegaMenuCategory[] = [
  {
    title: 'Core 5 Pillars',
    description: 'Foundational services orchestrated through BuildEcoGroup',
    items: [
      {
        title: 'Construction-related Services',
        description: 'Architectural audits, MEP planning, structural design, and scheduling.',
        href: ROUTES.PILLARS,
        badge: 'Pillar 01',
      },
      {
        title: 'Surveillance & Site Technology',
        description: 'Live site camera feeds, drone photogrammetry, and perimeter sensors.',
        href: ROUTES.PILLARS,
        badge: 'Pillar 02',
      },
      {
        title: 'Land & Property Assistance',
        description: 'GIS contour analysis, title checks, soil test vetting, and zoning review.',
        href: ROUTES.PROPERTY,
        badge: 'Pillar 03',
      },
      {
        title: 'Consultant for Every Department',
        description: 'Vetted specialists in 14+ technical engineering disciplines.',
        href: ROUTES.CONSULTANTS,
        badge: 'Pillar 04',
      },
      {
        title: 'Innovation & Startup Introduction',
        description: 'Direct access to validated low-carbon materials and smart IoT tech.',
        href: ROUTES.TECHNOLOGY,
        badge: 'Pillar 05',
      },
    ],
  },
  {
    title: 'Technical Capabilities',
    description: 'Modular engineering and spatial intelligence tools',
    items: [
      {
        title: 'Land GIS & Spatial Analysis',
        description: 'Topography elevation maps, flood plains, and cadastral boundaries.',
        href: `${ROUTES.TECHNOLOGY}#gis`,
      },
      {
        title: 'BOQ & Cost Normalization',
        description: 'Structured bill of quantities and comparative tender matrices.',
        href: `${ROUTES.SERVICES}#boq`,
      },
      {
        title: 'Solar & Clean Energy Sizing',
        description: 'Rooftop solar irradiance studies and hybrid storage design.',
        href: `${ROUTES.TECHNOLOGY}#solar`,
      },
      {
        title: 'Water Treatment & Rainwater',
        description: 'Hydraulic design for STP, greywater loops, and harvesting tanks.',
        href: ROUTES.WATER_TREATMENT,
      },
    ],
  },
];

/**
 * Comprehensive Footer Configuration
 */
export const FOOTER_GROUPS: FooterGroup[] = [
  {
    title: 'Company & Regional Hubs',
    links: [
      { label: 'About BuildEco Group', href: ROUTES.ABOUT },
      { label: 'Lucknow Corporate HQ', href: ROUTES.LOCAL_LUCKNOW, badge: 'HQ' },
      { label: 'Gorakhpur Regional Hub', href: ROUTES.LOCAL_GORAKHPUR, badge: 'East UP' },
      { label: 'Projects & Portfolio', href: ROUTES.PROJECTS },
      { label: 'Research & Guides', href: ROUTES.RESEARCH },
      { label: 'Contact & Support', href: ROUTES.CONTACT },
    ],
  },
  {
    title: 'Core Engines & Services',
    links: [
      { label: 'Land Feasibility & GIS', href: ROUTES.LAND_DEVELOPMENT },
      { label: 'Construction Management', href: ROUTES.CONSTRUCTION_MANAGEMENT },
      { label: 'Normalized BOQ Estimation', href: ROUTES.BOQ_ESTIMATION },
      { label: 'Solar & PM Surya Ghar', href: ROUTES.SOLAR },
      { label: 'Commercial Marketplace', href: ROUTES.MARKETPLACE },
    ],
  },
  {
    title: 'Specialized Capabilities',
    links: [
      { label: 'Independent Peer Reviews', href: ROUTES.CONSTRUCTION_MANAGEMENT },
      { label: '5-Stage Escrow Protection', href: ROUTES.CONSTRUCTION_MANAGEMENT },
      { label: 'CPWD DSR Cost Calibration', href: ROUTES.BOQ_ESTIMATION },
      { label: 'Water Treatment & STP', href: `${ROUTES.SERVICES}#water` },
      { label: 'Facility Maintenance AMC', href: `${ROUTES.SERVICES}#maintenance` },
    ],
  },
  {
    title: 'Consultants & Empanelment',
    links: [
      { label: 'Verified Consultants Directory', href: ROUTES.CONSULTANTS },
      { label: 'Join BuildEco Network', href: ROUTES.ONBOARDING, badge: 'Join' },
      { label: 'Empanelment Standards', href: `${ROUTES.CONSULTANTS}#empanelment` },
      { label: '2CLICK Vendor Mart', href: ROUTES.MARKETPLACE },
    ],
  },
  {
    title: 'Platform Access',
    links: [
      { label: 'Start a Project Case', href: ROUTES.INITIATE_PROJECT, badge: 'Start' },
      { label: 'Client Sign In', href: ROUTES.LOGIN },
      { label: 'Register Account', href: ROUTES.REGISTER },
      { label: 'Project Console', href: ROUTES.DASHBOARD },
    ],
  },
  {
    title: 'Governance & Trust',
    links: [
      { label: 'Zero Contractor Bias Charter', href: `${ROUTES.ABOUT}#charter` },
      { label: 'Terms of Platform Service', href: `${ROUTES.ABOUT}#terms` },
      { label: 'Privacy & Data Protection', href: `${ROUTES.ABOUT}#privacy` },
      { label: 'Entity Disambiguation Notice', href: `${ROUTES.ABOUT}#entity` },
    ],
  },
];
