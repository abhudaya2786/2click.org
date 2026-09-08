import React from 'react';
import { 
  Building2, 
  Compass, 
  Sun, 
  Camera, 
  Droplets, 
  Recycle, 
  Wrench, 
  Globe, 
  FileSpreadsheet, 
  Layers, 
  Zap, 
  Sparkles,
  Users,
  ShieldCheck,
  Home,
  CheckCircle2,
  HardHat
} from 'lucide-react';
import { QueryCategory } from '../types/forms';
import { ROUTES } from './routes';

export interface ServiceDefinition {
  id: string;
  queryCategory: QueryCategory;
  title: string;
  shortTitle: string;
  categoryGroup: 'engineering' | 'sustainability' | 'site' | 'land' | 'advisory' | 'tech';
  categoryGroupLabel: string;
  route: string;
  hasDedicatedPage: boolean;
  tagline: string;
  description: string;
  deliverables: string[];
  standards: string;
  assignedDesk: string;
  defaultBudgetRange: string;
  turnaroundSLA: string;
  popular?: boolean;
  iconName: string;
  subOptions?: string[];
}

export const SERVICES_CATALOG: ServiceDefinition[] = [
  {
    id: 'construction',
    queryCategory: 'CONSTRUCTION',
    title: 'Construction & Turnkey Management',
    shortTitle: 'Construction',
    categoryGroup: 'engineering',
    categoryGroupLabel: 'Building & Execution',
    route: ROUTES.CONSTRUCTION_MANAGEMENT,
    hasDedicatedPage: true,
    tagline: 'Independent milestone supervision, RCC structural vetting, and contractor execution.',
    description: 'Turnkey residential villas, commercial structures, structural peer audits, and strict IS 456 seismic code supervision.',
    deliverables: [
      '3D BIM structural clash analysis & STAAD load vetting',
      'Geotechnical soil investigation & footing design (IS 1892)',
      'Stage-by-stage rebar & concrete slump quality audits',
      'Contractor milestone certification with zero advance leakages'
    ],
    standards: 'IS 456:2000, IS 1893:2016 (Seismic III), CPWD Norms',
    assignedDesk: 'Central Construction Management Desk',
    defaultBudgetRange: '₹45 Lakhs - ₹2.5 Crores',
    turnaroundSLA: '2 Hours Response',
    popular: true,
    iconName: 'HardHat',
    subOptions: [
      'New Residential Villa Construction',
      'Commercial / Multi-Floor Building',
      'RCC Structural Frame & Masonry',
      'Structural Audit & Peer Vetting',
      'Turnkey Construction with Materials'
    ]
  },
  {
    id: 'land',
    queryCategory: 'LAND',
    title: 'Land Feasibility & Due Diligence',
    shortTitle: 'Land & JV',
    categoryGroup: 'land',
    categoryGroupLabel: 'Land & Feasibility',
    route: ROUTES.LAND_DEVELOPMENT,
    hasDedicatedPage: true,
    tagline: 'Title search, Section 143 conversion, LDA/GDA master plan alignment & JV modeling.',
    description: 'De-risk land acquisition with revenue-share JDA modeling, Khasra title reports, and contour feasibility before breaking ground.',
    deliverables: [
      'Khatauni, Khasra & Encumbrance 30-year title audit',
      'LDA / GDA 2031 master plan road setback overlay',
      'Section 143 non-agricultural conversion roadmap',
      'Joint Development Agreement (JDA) revenue modeling'
    ],
    standards: 'UP Revenue Code 2006, Master Plan 2031, RERA Norms',
    assignedDesk: 'Land & Feasibility Cell',
    defaultBudgetRange: '₹1.5 - ₹15 Crores (GDV)',
    turnaroundSLA: 'Within 2 Hours',
    popular: true,
    iconName: 'Compass',
    subOptions: [
      'Land Feasibility & Best-Use Study',
      'Joint Development (JDA) Structuring',
      'Agricultural to Non-Agri 143 Advisory',
      'Boundary Verification & Survey',
      'Plot Valuation & Legal Search'
    ]
  },
  {
    id: 'solar',
    queryCategory: 'SOLAR',
    title: 'Solar Microgrids & Clean Energy',
    shortTitle: 'Solar Energy',
    categoryGroup: 'sustainability',
    categoryGroupLabel: 'Clean Energy & Microgrids',
    route: ROUTES.SOLAR,
    hasDedicatedPage: true,
    tagline: 'Tier-1 TopCon bifacial solar, PM Surya Ghar subsidy, and UPPCL net metering.',
    description: 'Rooftop solar PV microgrids, industrial solar plants, DISCOM net-metering approvals, and maximum central & UP state subsidies.',
    deliverables: [
      'Shadow-free rooftop shadow analysis & generation simulation',
      'Tier-1 TopCon 550Wp+ bifacial dual-glass module supply',
      'UPPCL / MVVNL bi-directional net meter synchronization',
      'PM Surya Ghar + UP NEDA subsidy processing up to ₹1,08,000'
    ],
    standards: 'MNRE Tier-1, CEA Regulations, UP NEDA / UPPCL Grid Code',
    assignedDesk: 'Solar & Clean Energy Microgrid Cell',
    defaultBudgetRange: '₹1.2 Lakhs - ₹15 Lakhs',
    turnaroundSLA: 'Immediate Desk Assignment',
    popular: true,
    iconName: 'Sun',
    subOptions: [
      'Residential Rooftop Solar (PM Surya Ghar)',
      'Commercial & Industrial On-Grid Plant',
      'Hybrid Solar with Lithium Battery Backup',
      'UPPCL Net Metering Approval & Subsidy',
      'Solar Microgrid Feasibility'
    ]
  },
  {
    id: 'boq',
    queryCategory: 'BOQ',
    title: 'BOQ & Cost Normalization',
    shortTitle: 'BOQ & Costing',
    categoryGroup: 'engineering',
    categoryGroupLabel: 'Cost Intelligence',
    route: ROUTES.BOQ_ESTIMATION,
    hasDedicatedPage: true,
    tagline: 'CPWD rate normalization, itemized tender matrices, and steel/cement takeoff.',
    description: 'Eliminate 20-35% contractor price gouging with itemized Bill of Quantities, line-item market rate benchmarks, and tender auditing.',
    deliverables: [
      'CPWD / State DSR normalized line-item cost schedule',
      'Exact rebar tonnage, cement bags & sand volume takeoff',
      'Unbalanced contractor bid detection & risk flag matrix',
      'Standardized tender comparative for contractor selection'
    ],
    standards: 'CPWD DSR 2023, IS 1200 (Measurement of Works)',
    assignedDesk: 'Cost Intelligence & BOQ Estimation Cell',
    defaultBudgetRange: '₹15,000 - ₹1.5 Lakhs (Audit Fee)',
    turnaroundSLA: '24-48 Hours Turnaround',
    popular: true,
    iconName: 'FileSpreadsheet',
    subOptions: [
      'Full Turnkey BOQ (Civil + MEP + Finishes)',
      'Civil & Structural Shell Only BOQ',
      'Contractor Quote Audit & Rate Verification',
      'Material Quantity Takeoff (Steel, Cement, AAC)',
      'Tender Comparative Package'
    ]
  },
  {
    id: 'surveillance',
    queryCategory: 'TECHNOLOGY',
    title: 'Surveillance & Site IoT Tech',
    shortTitle: 'Site Surveillance',
    categoryGroup: 'site',
    categoryGroupLabel: 'Site Tech & Security',
    route: `${ROUTES.SERVICES}#surveillance`,
    hasDedicatedPage: false,
    tagline: 'Autonomous 4G solar cameras, cloud time-lapse logs, and AI intrusion detection.',
    description: '24/7 remote site monitoring with wire-free solar PTZ cameras, daily progress time-lapse compilations, and biometric workforce attendance.',
    deliverables: [
      'Autonomous solar-powered 4G multi-camera deployment',
      'Automated daily progress time-lapse video generation',
      'AI thermal perimeter tripwire intrusion alerts',
      'Cloud evidence vault with timestamp watermarks'
    ],
    standards: 'NDAA Compliant, AES-256 Cloud Encryption, IP67 Weatherproof',
    assignedDesk: 'Site Technology & Surveillance Cell',
    defaultBudgetRange: '₹25,000 - ₹1.8 Lakhs',
    turnaroundSLA: 'Same Day Deployment Desk',
    popular: true,
    iconName: 'Camera',
    subOptions: [
      'Solar 4G Live Site Camera Deployment',
      'Automated Progress Time-Lapse System',
      'AI Boundary Tripwire & Intrusion Alert',
      'Biometric / QR Site Attendance System',
      'Smart Home / Building Automation IoT'
    ]
  },
  {
    id: 'water',
    queryCategory: 'WATER',
    title: 'Water Treatment & STP / ETP',
    shortTitle: 'Water & STP',
    categoryGroup: 'sustainability',
    categoryGroupLabel: 'Hydrology & Water Systems',
    route: `${ROUTES.SERVICES}#water`,
    hasDedicatedPage: false,
    tagline: 'Decentralized MBBR STP, industrial ETP, rainwater harvesting, and RO systems.',
    description: 'Zero-liquid discharge sewage treatment plants, dual-piping greywater recycling, stormwater drainage simulation, and commercial filtration.',
    deliverables: [
      'Modular MBBR / SBR sewage treatment plant engineering',
      'Dual-plumbing greywater circuit design for flush & gardening',
      'Rooftop rainwater harvesting recharge well sizing',
      'CPCB & UPPCB environmental consent compliance report'
    ],
    standards: 'CPCB 2021 Norms, UPPCB Discharge Standards, IS 1172',
    assignedDesk: 'Hydrology & Environmental Engineering Cell',
    defaultBudgetRange: '₹3.5 Lakhs - ₹45 Lakhs',
    turnaroundSLA: 'Within 4 Hours',
    popular: true,
    iconName: 'Droplets',
    subOptions: [
      'Sewage Treatment Plant (STP - MBBR/SBR)',
      'Effluent Treatment Plant (ETP - Industrial)',
      'Rooftop Rainwater Harvesting & Recharge Well',
      'Commercial WTP & Multi-Grade Sand Filter',
      'Dual Plumbing & Greywater Recycling Circuit'
    ]
  },
  {
    id: 'waste',
    queryCategory: 'WASTE',
    title: 'Solid Waste & Organic Composting',
    shortTitle: 'Waste & OWC',
    categoryGroup: 'sustainability',
    categoryGroupLabel: 'Zero Waste Systems',
    route: ROUTES.WASTE_MANAGEMENT,
    hasDedicatedPage: true,
    tagline: 'Zero-landfill site strategies, organic waste composters (OWC), and municipal audits.',
    description: 'On-site decentralized solid waste processing, automated organic waste composters (OWC), and zero-discharge compliance for townships & campuses.',
    deliverables: [
      'Automated organic waste composter (OWC) sizing & supply',
      'Solid waste segregation room layouts & air filtration',
      'Compost leachate neutralization & odor management',
      'Green Building (IGBC / GRIHA) credit documentation'
    ],
    standards: 'Solid Waste Management Rules 2016, IGBC Zero Waste Norms',
    assignedDesk: 'Sustainable Waste Management Cell',
    defaultBudgetRange: '₹2.5 Lakhs - ₹25 Lakhs',
    turnaroundSLA: 'Within 4 Hours',
    iconName: 'Recycle',
    subOptions: [
      'Organic Waste Bio-Composter (OWC 50kg-1000kg/day)',
      'Township Solid Waste Segregation Setup',
      'Zero-Discharge Environmental Audit',
      'Bio-degradable Waste Shredder & Curing Station'
    ]
  },
  {
    id: 'maintenance',
    queryCategory: 'MAINTENANCE',
    title: 'Facility Maintenance & AMC',
    shortTitle: 'Maintenance & AMC',
    categoryGroup: 'site',
    categoryGroupLabel: 'Operations & Facilities',
    route: ROUTES.MAINTENANCE_AMC,
    hasDedicatedPage: true,
    tagline: 'Preventive MEP maintenance, society annual maintenance contracts, and pump overhaul.',
    description: 'Structured preventive maintenance protocols, DG set servicing, elevator audits, pump room AMC, and waterproofing restorative health checks.',
    deliverables: [
      'Preventive MEP maintenance schedule & digital SOP manuals',
      'Society AMC SLA benchmarking & contractor rate audits',
      'Submersible pump, hydro-pneumatic & DG servicing protocols',
      'Thermographic electrical panel & pipe leakage inspection'
    ],
    standards: 'NBC 2016 Part 8 (Building Services), IS 732',
    assignedDesk: 'Facility Operations & AMC Cell',
    defaultBudgetRange: '₹35,000 - ₹5 Lakhs / year',
    turnaroundSLA: 'Immediate SLA Guarantee',
    iconName: 'Wrench',
    subOptions: [
      'Society / Commercial Complex Comprehensive AMC',
      'DG Set, Panel & Electrical Preventive Care',
      'Hydro-Pneumatic Pump Room & STP AMC',
      'Basement & Terrace Waterproofing Restoration',
      'Elevator & Firefighting System SLA Audit'
    ]
  },
  {
    id: 'gis',
    queryCategory: 'LAND',
    title: 'GIS Contouring & Drone Survey',
    shortTitle: 'GIS & Drone',
    categoryGroup: 'tech',
    categoryGroupLabel: 'Spatial & GIS Tech',
    route: ROUTES.GIS,
    hasDedicatedPage: true,
    tagline: '0.5m interval contour mapping, natural drain slope detection, and cut & fill modeling.',
    description: 'High-precision drone photogrammetry, DGPS ground control point pegging, digital elevation models (DEM), and cut-fill earthwork calculations.',
    deliverables: [
      '0.5m high-resolution topographical contour CAD map',
      'Digital Surface Model (DSM) and orthomosaic imagery',
      'DGPS physical boundary pegging with geodetic coordinates',
      'Cut & Fill earthwork volume calculation matrix'
    ],
    standards: 'Survey of India Datum, WGS84 Geoid, DGCA Drone SOP',
    assignedDesk: 'GIS & Geomatics Engineering Cell',
    defaultBudgetRange: '₹20,000 - ₹3.5 Lakhs',
    turnaroundSLA: '48 Hours Flight to CAD',
    popular: true,
    iconName: 'Globe',
    subOptions: [
      'Drone Photogrammetry & 3D Contour Mapping',
      'DGPS Boundary Pegging & Geodetic Survey',
      'Digital Elevation Model & Slope Hydrology',
      'Cut & Fill Earthwork Volume Calculation',
      'Khasra Map Cadastral GIS Overlay'
    ]
  },
  {
    id: 'interior',
    queryCategory: 'INTERIOR',
    title: 'Turnkey Interior Architecture & Fitouts',
    shortTitle: 'Interiors',
    categoryGroup: 'engineering',
    categoryGroupLabel: 'Design & Finishes',
    route: ROUTES.INTERIOR,
    hasDedicatedPage: true,
    tagline: 'Factory modular kitchens, false ceilings, acoustic lighting & turnkey fitouts.',
    description: 'Complete interior design execution with 3D walkthroughs, factory-manufactured modular woodwork, concealed MEP routing, and zero-defect handover.',
    deliverables: [
      'Photorealistic 3D interior renders & material moodboards',
      'Factory-finished HDHMR / BWP plywood modular cabinetry',
      'Integrated false ceiling, magnetic track & profile lighting',
      'Turnkey milestone-based fitout with 10-year warranty'
    ],
    standards: 'IS 303 / IS 710 (Plywood), IS 2046, GreenPro Certified',
    assignedDesk: 'Interior Architecture & Execution Cell',
    defaultBudgetRange: '₹4 Lakhs - ₹35 Lakhs',
    turnaroundSLA: '2 Hours Response',
    iconName: 'Building2',
    subOptions: [
      'Complete Residential Villa Turnkey Interior',
      'Modular Kitchen & Wardrobe Execution',
      'Corporate Office / Retail Store Fitout',
      'False Ceiling & Architectural Lighting Plan',
      '3D Visualization & Material Moodboards'
    ]
  },
  {
    id: 'consultants',
    queryCategory: 'CONSTRUCTION',
    title: 'Consultant Vetting & Structural Review',
    shortTitle: 'Consultants',
    categoryGroup: 'advisory',
    categoryGroupLabel: 'Advisory & Peer Review',
    route: ROUTES.CONSULTANTS,
    hasDedicatedPage: true,
    tagline: 'Direct technical engagement with senior structural, MEP, and green building engineers.',
    description: 'Peer review of structural drawings, seismic stability certification, MEP design vetting, and Vastu spatial harmonization before execution.',
    deliverables: [
      'Independent structural calculation & STAAD re-analysis',
      'Seismic Zone III stability & rebar detailing certificate',
      'MEP clash detection & energy efficiency audit',
      'Scientific Vastu directional energy adjustment report'
    ],
    standards: 'IS 456, IS 1893, NBC 2016, IGBC AP Norms',
    assignedDesk: 'Senior Engineering Advisory Council',
    defaultBudgetRange: '₹20,000 - ₹2.5 Lakhs',
    turnaroundSLA: 'Direct Specialist Match',
    popular: true,
    iconName: 'Users',
    subOptions: [
      'Structural Drawing Peer Review & STAAD Vetting',
      'Architectural Plan Vetting & Sanction Review',
      'MEP & Firefighting Engineering Advisory',
      'Scientific Vastu Spatial Alignment',
      'Green Building IGBC / GRIHA Certification'
    ]
  },
  {
    id: 'material',
    queryCategory: 'MATERIAL_PROCUREMENT',
    title: 'Direct Material Procurement & Wholesale',
    shortTitle: 'Material Supply',
    categoryGroup: 'engineering',
    categoryGroupLabel: 'Supply & Procurement',
    route: ROUTES.MATERIAL_PROCUREMENT,
    hasDedicatedPage: true,
    tagline: 'Direct primary steel mills, bulk cement, AAC blocks, and factory-priced aggregates.',
    description: 'Transparent construction material procurement directly from primary manufacturers with test certificates, digital weighing slips, and wholesale rates.',
    deliverables: [
      'Primary Fe550D TMT rebar supply directly from integrated mills',
      'Bulk 53-grade OPC / PPC cement with manufacturer test reports',
      'Precision autoclaved aerated concrete (AAC) blocks & adhesive',
      'Verified weighbridge tickets and batch quality test certificates'
    ],
    standards: 'IS 1786 (Fe550D Rebar), IS 269 / IS 1489 (Cement), IS 2185',
    assignedDesk: 'Bulk Material Supply & Logistics Desk',
    defaultBudgetRange: 'Wholesale Mill Pricing',
    turnaroundSLA: 'Instant Price Quote',
    iconName: 'Layers',
    subOptions: [
      'Primary TMT Steel Fe550D (Tata / Jindal / SAIL)',
      'Bulk Cement (Ultratech / Ambuja / ACC 53 Grade)',
      'AAC Blocks & Block Jointing Polymer Adhesive',
      'Ready Mix Concrete (RMC) M25 / M30 Batch Supply',
      'Sanitaryware, CPVC Pipes & Electrical Cables'
    ]
  },
  {
    id: 'vastu',
    queryCategory: 'VASTU',
    title: 'Vastu & Directional Consultation',
    shortTitle: 'Vastu Consultation',
    categoryGroup: 'advisory',
    categoryGroupLabel: 'Consultation & Advisory',
    route: ROUTES.VASTU,
    hasDedicatedPage: true,
    tagline: 'Vastu Shastra site and layout analysis for new or existing properties.',
    description: 'Structured Vastu consultation covering plot orientation, room placement, and directional alignment, delivered as a documented report with practical recommendations for new construction or corrective adjustments to existing properties.',
    deliverables: [
      'Site/plot orientation and directional analysis',
      'Existing or proposed floor-plan Vastu review',
      'Documented recommendations report',
      'Follow-up consultation for implementation guidance'
    ],
    standards: 'Traditional Vastu Shastra principles, site-specific practical guidance',
    assignedDesk: 'Vastu & Directional Energy Cell',
    defaultBudgetRange: '₹15,000 - ₹75,000',
    turnaroundSLA: 'Within 24 Hours',
    iconName: 'Compass',
    subOptions: [
      'New Construction Vastu Planning',
      'Existing Property Vastu Audit & Corrections',
      'Commercial / Office Vastu Consultation'
    ]
  },
  {
    id: 'workers',
    queryCategory: 'LABOUR',
    title: 'Skilled Workers & Labour',
    shortTitle: 'Find Workers',
    categoryGroup: 'site',
    categoryGroupLabel: 'Workforce & Site Personnel',
    route: ROUTES.WORKERS,
    hasDedicatedPage: true,
    tagline: 'Verified skilled labour matched to your project trade, timeline, and site location.',
    description: 'Request verified skilled workers and labour teams — masons, carpenters, electricians, plumbers, and general site crews — matched to your project requirement, trade, and location, with attendance and work-history tracking.',
    deliverables: [
      'Trade-matched skilled worker sourcing',
      'Verified experience and identity checks',
      'Site attendance and work-history tracking',
      'Wage-model and payment status visibility'
    ],
    standards: 'Verified network onboarding, trade-specific experience checks',
    assignedDesk: 'Workforce Coordination Desk',
    defaultBudgetRange: 'Trade & Duration Dependent',
    turnaroundSLA: 'Within 24-48 Hours',
    iconName: 'HardHat',
    subOptions: [
      'Masons, Carpenters & General Labour',
      'Electricians & Plumbers',
      'Site Supervision & Skilled Crew Teams'
    ]
  },
  {
    id: 'equipment',
    queryCategory: 'EQUIPMENT',
    title: 'Machinery & Equipment Rental',
    shortTitle: 'Hire Equipment',
    categoryGroup: 'site',
    categoryGroupLabel: 'Machinery & Site Equipment',
    route: ROUTES.EQUIPMENT,
    hasDedicatedPage: true,
    tagline: 'Construction machinery and equipment rental, with or without operators.',
    description: 'Book construction machinery and equipment — excavators, cranes, concrete mixers, and site machinery — for your project timeline, with optional operator support and availability confirmed before booking.',
    deliverables: [
      'Equipment availability and capacity matching',
      'Rental booking and confirmation',
      'Optional operator assignment',
      'Usage tracking through to return'
    ],
    standards: 'Verified equipment providers, capacity-matched booking',
    assignedDesk: 'Equipment & Machinery Desk',
    defaultBudgetRange: 'Equipment & Duration Dependent',
    turnaroundSLA: 'Within 24-48 Hours',
    iconName: 'Truck',
    subOptions: [
      'Excavators & Earthmoving Machinery',
      'Cranes & Material Hoists',
      'Concrete Mixers & Batching Equipment'
    ]
  }
];

export function getServiceById(id: string): ServiceDefinition | undefined {
  if (!id) return undefined;
  const lower = id.toLowerCase().trim();
  return SERVICES_CATALOG.find(s => 
    s.id.toLowerCase() === lower || 
    s.queryCategory.toLowerCase() === lower ||
    s.shortTitle.toLowerCase() === lower
  );
}

export function mapSearchParamToService(param: string | null): ServiceDefinition {
  if (!param) return SERVICES_CATALOG[0]; // default construction
  const cleaned = param.toLowerCase().trim();
  
  if (cleaned.includes('solar') || cleaned.includes('energy') || cleaned.includes('pv')) {
    return SERVICES_CATALOG.find(s => s.id === 'solar')!;
  }
  if (cleaned.includes('land') || cleaned.includes('jv') || cleaned.includes('plot') || cleaned.includes('feasib')) {
    return SERVICES_CATALOG.find(s => s.id === 'land')!;
  }
  if (cleaned.includes('boq') || cleaned.includes('cost') || cleaned.includes('estimat')) {
    return SERVICES_CATALOG.find(s => s.id === 'boq')!;
  }
  if (cleaned.includes('surv') || cleaned.includes('cctv') || cleaned.includes('camera') || cleaned.includes('tech')) {
    return SERVICES_CATALOG.find(s => s.id === 'surveillance')!;
  }
  if (cleaned.includes('water') || cleaned.includes('stp') || cleaned.includes('etp') || cleaned.includes('rain')) {
    return SERVICES_CATALOG.find(s => s.id === 'water')!;
  }
  if (cleaned.includes('waste') || cleaned.includes('compost') || cleaned.includes('owc')) {
    return SERVICES_CATALOG.find(s => s.id === 'waste')!;
  }
  if (cleaned.includes('maint') || cleaned.includes('amc') || cleaned.includes('pump')) {
    return SERVICES_CATALOG.find(s => s.id === 'maintenance')!;
  }
  if (cleaned.includes('gis') || cleaned.includes('drone') || cleaned.includes('contour')) {
    return SERVICES_CATALOG.find(s => s.id === 'gis')!;
  }
  if (cleaned.includes('inter') || cleaned.includes('furnish') || cleaned.includes('kitchen')) {
    return SERVICES_CATALOG.find(s => s.id === 'interior')!;
  }
  if (cleaned.includes('consult') || cleaned.includes('struct') || cleaned.includes('vetting') || cleaned.includes('vastu')) {
    return SERVICES_CATALOG.find(s => s.id === 'consultants')!;
  }
  if (cleaned.includes('mater') || cleaned.includes('steel') || cleaned.includes('cement') || cleaned.includes('procure')) {
    return SERVICES_CATALOG.find(s => s.id === 'material')!;
  }
  if (cleaned.includes('elec') || cleaned.includes('wire') || cleaned.includes('power')) {
    return SERVICES_CATALOG.find(s => s.id === 'maintenance')!;
  }
  if (cleaned.includes('const') || cleaned.includes('build') || cleaned.includes('villa')) {
    return SERVICES_CATALOG.find(s => s.id === 'construction')!;
  }

  return SERVICES_CATALOG[0];
}
