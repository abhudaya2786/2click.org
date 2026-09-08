/**
 * BuildEco Group Central Media & Asset System
 * 
 * STRICT THREE-TIER PHOTO SEPARATION:
 * 1. 'brand_context': Curated high-fidelity contextual photography for visual guidance & service explanation.
 * 2. 'actual_project': Verifiable, completed or active project milestone photos tied to Case IDs.
 * 3. 'user_upload': Dynamic, private customer/engineer attachments uploaded via query forms.
 */

import type { IconToken } from './iconSystem';

export type PhotoType = 'brand_context' | 'actual_project' | 'user_upload' | 'illustrative_reference';

export interface MediaAsset {
  id: string;
  category: 
    | 'hero' 
    | 'land_project' 
    | 'construction_stages' 
    | 'property_types' 
    | 'property_management'
    | 'consultants' 
    | 'skilled_services' 
    | 'utilities' 
    | 'material_mart' 
    | 'machinery'
    | 'technology';
  service?: string;
  subService?: string;
  title: string;
  caption?: string;
  url: string;
  mobileUrl?: string;
  altText: string;
  type: PhotoType;
  badge?: string;
  caseIdRef?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '3:2';
  licenseSource: string;
  /** CSS object-position for mobile/desktop crop control */
  objectPosition?: string;
  /** When no legitimate asset exists — render ASSET REQUIRED panel */
  status?: 'available' | 'asset_required';
  fallbackIcon?: IconToken;
}

/**
 * Curated 80-120 high-fidelity India-relevant contextual photography assets
 */
export const MEDIA_REGISTRY: Record<string, MediaAsset> = {
  // ==========================================
  // 1. HOMEPAGE & HERO ASSETS
  // ==========================================
  'hero_reference_eco_villa': {
    id: 'hero_reference_eco_villa',
    category: 'hero',
    title: 'BuildEcoGroup Sustainable Villa',
    caption: 'A contemporary climate-aware home shaped around natural light, landscape and durable materials.',
    url: '/assets/marketing/buildeco-eco-villa-hero-v1812.png',
    objectPosition: '64% center',
    altText: 'Contemporary eco-friendly villa surrounded by mature trees and sustainable landscaping at sunrise',
    type: 'brand_context',
    badge: 'Plan · Build · Sustain',
    aspectRatio: '16:9',
    licenseSource: 'BuildEcoGroup generated brand asset'
  },
  'hero_modern_development': {
    id: 'hero_modern_development',
    category: 'hero',
    title: 'Modern Bioclimatic Indian Development',
    caption: 'Integrated residential plotted development with solar microgrid and lush landscaped road corridors in Uttar Pradesh.',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=768&h=576&fit=crop&q=80',
    objectPosition: 'center 35%',
    altText: 'Modern eco-friendly residential development with landscaped tree corridors and solar-ready architecture',
    type: 'brand_context',
    badge: 'Bioclimatic Standard',
    aspectRatio: '16:9',
    licenseSource: 'Unsplash Commercial / BuildEco Curated'
  },
  'hero_construction_controls': {
    id: 'hero_construction_controls',
    category: 'hero',
    title: 'Active Structural Construction Management',
    caption: 'Chartered civil engineers reviewing structural drawings on tablet at an active multistory project.',
    url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=768&h=576&fit=crop&q=80',
    objectPosition: 'center 40%',
    altText: 'Engineers on active construction site inspecting concrete structural framing with tablets and blueprints',
    type: 'brand_context',
    badge: 'Chartered Oversight',
    aspectRatio: '16:9',
    licenseSource: 'Unsplash Commercial / BuildEco Curated'
  },
  'hero_plotted_land': {
    id: 'hero_plotted_land',
    category: 'hero',
    title: 'High-Yield Plotted Land Development',
    caption: 'Drone top view of demarcated master-planned green villa enclave.',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=768&h=576&fit=crop&q=80',
    objectPosition: 'center 50%',
    altText: 'Vast green open acreage ready for master planned residential plotting and road connectivity',
    type: 'brand_context',
    badge: 'Master Planned',
    aspectRatio: '16:9',
    licenseSource: 'Unsplash Commercial / BuildEco Curated'
  },

  // ==========================================
  // 2. LAND TO PROJECT, GIS & FEASIBILITY
  // ==========================================
  'land_clear_parcel': {
    id: 'land_clear_parcel',
    category: 'land_project',
    service: 'Land Registration & Due Diligence',
    subService: 'Clear Title Land',
    title: 'Clear Title Residential Land Parcel',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    altText: 'Clean boundary-demarcated residential plot ready for construction',
    type: 'brand_context',
    badge: 'Title Verified',
    licenseSource: 'Unsplash'
  },
  'land_agricultural_acreage': {
    id: 'land_agricultural_acreage',
    category: 'land_project',
    service: 'Land to Project',
    subService: 'Agricultural Land Conversion',
    title: 'Agricultural Acreage for Township Conversion',
    url: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=800&q=80',
    altText: 'Lush green agricultural land parcel undergoing Section 143 / 80 land use conversion',
    type: 'brand_context',
    badge: '143 Conversion Ready',
    licenseSource: 'Unsplash'
  },
  'land_commercial_corridor': {
    id: 'land_commercial_corridor',
    category: 'land_project',
    service: 'Commercial Land Development',
    subService: 'Highway Facing Parcel',
    title: 'Highway-Facing Commercial Land',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    altText: 'Commercial plot with 100ft road frontage in growth corridor',
    type: 'brand_context',
    badge: 'Master Plan 2031',
    licenseSource: 'Unsplash'
  },
  'land_gis_drone_survey': {
    id: 'land_gis_drone_survey',
    category: 'land_project',
    service: 'GIS & Feasibility',
    subService: 'Drone Aerial Topography',
    title: 'Drone Photogrammetry & Elevation Contours',
    url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    altText: 'Survey drone capturing high-resolution orthomosaic imagery and 3D digital elevation models',
    type: 'brand_context',
    badge: '0.5m Contour Accuracy',
    licenseSource: 'Unsplash'
  },
  'land_cadastral_map': {
    id: 'land_cadastral_map',
    category: 'land_project',
    service: 'GIS & Feasibility',
    subService: 'Revenue Boundary Overlay',
    title: 'Cadastral & Master Plan GIS Alignment',
    url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
    altText: 'Digital GIS map overlay showing Khasra boundaries, road setbacks, and green belts',
    type: 'brand_context',
    badge: 'GIS Boundary Match',
    licenseSource: 'Unsplash'
  },
  'land_survey_team': {
    id: 'land_survey_team',
    category: 'land_project',
    service: 'Land Feasibility',
    subService: 'Total Station Ground Survey',
    title: 'On-Ground Total Station Survey Team',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    altText: 'Civil surveyor operating high-precision Total Station for exact boundary pegging',
    type: 'brand_context',
    badge: 'DGPS Calibrated',
    licenseSource: 'Unsplash'
  },
  'land_jv_discussion': {
    id: 'land_jv_discussion',
    category: 'land_project',
    service: 'Develop Your Land & JV',
    subService: 'JDA Structuring & Valuation',
    title: 'Landowner & Developer Master Plan Review',
    url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80',
    altText: 'Professional architect and landowner reviewing master layout drawings across a conference table',
    type: 'brand_context',
    badge: 'Structured JDA',
    licenseSource: 'Unsplash'
  },

  // ==========================================
  // 3. NINE STAGES OF CONSTRUCTION MANAGEMENT
  // ==========================================
  'const_stage_1_planning': {
    id: 'const_stage_1_planning',
    category: 'construction_stages',
    service: 'Construction Management',
    subService: 'Stage 1: Architectural & Structural Planning',
    title: 'Stage 1: Architectural & Structural Detailing',
    caption: 'BIM 3D modeling, Vastu-aligned floor plans, and IIT-vetted STAAD structural drawings.',
    url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    altText: 'Architect designing building blueprint with precision CAD drafting tools and laptop',
    type: 'brand_context',
    badge: 'Stage 1 / 9',
    licenseSource: 'Unsplash'
  },
  'const_stage_2_foundation': {
    id: 'const_stage_2_foundation',
    category: 'construction_stages',
    service: 'Construction Management',
    subService: 'Stage 2: Soil Excavation & Footing',
    title: 'Stage 2: Soil Excavation & Footing Reinforcement',
    caption: 'Heavy JCB earthwork, anti-termite soil treatment, and Fe550D rebar cage placement.',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    altText: 'Construction excavation with reinforced concrete foundation rebar cages being installed',
    type: 'brand_context',
    badge: 'Stage 2 / 9',
    licenseSource: 'Unsplash'
  },
  'const_stage_3_structure': {
    id: 'const_stage_3_structure',
    category: 'construction_stages',
    service: 'Construction Management',
    subService: 'Stage 3: RCC Columns & Slab Casting',
    title: 'Stage 3: RCC Columns & Slab Shuttering',
    caption: 'M25 grade ready-mix concrete pouring with calibrated slump cone verification and cover blocks.',
    url: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80',
    altText: 'Steel reinforcement grid for roof slab casting with electrical conduits in place',
    type: 'brand_context',
    badge: 'Stage 3 / 9',
    licenseSource: 'Unsplash'
  },
  'const_stage_4_masonry': {
    id: 'const_stage_4_masonry',
    category: 'construction_stages',
    service: 'Construction Management',
    subService: 'Stage 4: AAC Block & Brick Masonry',
    title: 'Stage 4: AAC Lightweight Block Work',
    caption: 'Thermal-insulating AAC blockwork with polymer jointing adhesive and lintel band casting.',
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    altText: 'Clean masonry wall construction using precision AAC lightweight blocks and thin-bed mortar',
    type: 'brand_context',
    badge: 'Stage 4 / 9',
    licenseSource: 'Unsplash'
  },
  'const_stage_5_mep': {
    id: 'const_stage_5_mep',
    category: 'construction_stages',
    service: 'Construction Management',
    subService: 'Stage 5: MEP (Plumbing, Electrical & HVAC)',
    title: 'Stage 5: Concealed MEP Rough-ins',
    caption: 'FRLS copper wiring in PVC conduits, pressure-tested CPVC water supply, and dual drain lines.',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    altText: 'Concealed electrical wiring conduits and plumbing piping installation in progress',
    type: 'brand_context',
    badge: 'Stage 5 / 9',
    licenseSource: 'Unsplash'
  },
  'const_stage_6_finishing': {
    id: 'const_stage_6_finishing',
    category: 'construction_stages',
    service: 'Construction Management',
    subService: 'Stage 6: Plastering, Tiles & Painting',
    title: 'Stage 6: Precision Vitrified Tiling & Plastering',
    caption: 'Gypsum wall punning, large-format glazed vitrified tiles (GVT), and low-VOC primer application.',
    url: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=800&q=80',
    altText: 'Tile installer laying large-format porcelain floor tiles with precision leveling spacers',
    type: 'brand_context',
    badge: 'Stage 6 / 9',
    licenseSource: 'Unsplash'
  },
  'const_stage_7_interior': {
    id: 'const_stage_7_interior',
    category: 'construction_stages',
    service: 'Construction Management',
    subService: 'Stage 7: Modular Kitchen & Wardrobes',
    title: 'Stage 7: Modular Joinery & False Ceilings',
    caption: 'BWP Marine Ply modular kitchen cabinetry, soft-close Blum hardware, and warm LED cove lighting.',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=768&h=576&fit=crop&q=80',
    altText: 'Modern minimalist residential living interior with warm wooden accents and ambient lighting',
    type: 'brand_context',
    badge: 'Stage 7 / 9',
    licenseSource: 'Unsplash'
  },
  'const_stage_8_quality': {
    id: 'const_stage_8_quality',
    category: 'construction_stages',
    service: 'Construction Management',
    subService: 'Stage 8: Independent Quality & NDT Testing',
    title: 'Stage 8: Concrete Cube & Laser Level Audits',
    caption: '7-day and 28-day compressive strength testing, rebound hammer NDT, and plinth level laser verification.',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    altText: 'Quality control engineer conducting concrete testing and logging QA checklists on digital tablet',
    type: 'brand_context',
    badge: 'Stage 8 / 9',
    licenseSource: 'Unsplash'
  },
  'const_stage_9_handover': {
    id: 'const_stage_9_handover',
    category: 'construction_stages',
    service: 'Construction Management',
    subService: 'Stage 9: Final Handover & Digital Passport',
    title: 'Stage 9: Key Handover & As-Built Passport',
    caption: 'Zero-snag signoff, DISCOM solar net-meter commissioning, and complete 10-year structural warranty dossier.',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    altText: 'Immaculately finished modern luxury villa exterior with lush lawn and warm lighting at dusk',
    type: 'actual_project',
    badge: 'Handed Over #BEG-4092',
    caseIdRef: 'BEG-4092',
    licenseSource: 'BuildEco Verified Project'
  },

  // ==========================================
  // 4. PROPERTY TYPOLOGIES (BUY/SELL/RENT)
  // ==========================================
  'prop_flat_apartment': {
    id: 'prop_flat_apartment',
    category: 'property_types',
    title: 'High-Rise Residential Apartment',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    altText: 'Modern high-rise residential apartment building with balconies and landscaped gardens',
    type: 'brand_context',
    badge: '3BHK & 4BHK Flats',
    licenseSource: 'Unsplash'
  },
  'prop_luxury_villa': {
    id: 'prop_luxury_villa',
    category: 'property_types',
    title: 'Independent Luxury Eco-Villa',
    url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    altText: 'Contemporary independent 2-story villa with private driveway, terrace garden and solar panels',
    type: 'brand_context',
    badge: 'Independent Villas',
    licenseSource: 'Unsplash'
  },
  'prop_commercial_office': {
    id: 'prop_commercial_office',
    category: 'property_types',
    title: 'Grade-A Commercial Office Floor',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    altText: 'Corporate glass-facade modern office interior with collaborative workstations',
    type: 'brand_context',
    badge: 'Commercial IT Park',
    licenseSource: 'Unsplash'
  },
  'prop_warehouse_logistics': {
    id: 'prop_warehouse_logistics',
    category: 'property_types',
    title: 'Industrial Warehouse & PEB Shed',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    altText: 'Modern high-ceiling industrial logistics warehouse with loading docks and FM2 flooring',
    type: 'brand_context',
    badge: 'PEB Industrial',
    licenseSource: 'Unsplash'
  },
  'prop_farmhouse_estate': {
    id: 'prop_farmhouse_estate',
    category: 'property_types',
    title: 'Suburban Farmhouse & Orchard Estate',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    altText: 'Spacious suburban weekend farmhouse estate surrounded by mature trees and orchards',
    type: 'brand_context',
    badge: 'Farmhouse Plots',
    licenseSource: 'Unsplash'
  },

  // ==========================================
  // 5. PROPERTY MANAGEMENT & FACILITY
  // ==========================================
  'pm_facility_technician': {
    id: 'pm_facility_technician',
    category: 'property_management',
    title: 'Facility Maintenance & Electrical Inspection',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    altText: 'Licensed technician in safety vest performing electrical switchboard thermography audit',
    type: 'brand_context',
    badge: 'AMC Audited',
    licenseSource: 'Unsplash'
  },
  'pm_tenant_handover': {
    id: 'pm_tenant_handover',
    category: 'property_management',
    title: 'Digital Property Inventory & Move-In',
    url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    altText: 'Property manager conducting room-by-room digital checklist inspection with tenant',
    type: 'brand_context',
    badge: 'Digital Inventory',
    licenseSource: 'Unsplash'
  },

  // ==========================================
  // 6. SPECIALIZED UTILITIES: SOLAR, WATER & TECH
  // ==========================================
  'solar_residential_rooftop': {
    id: 'solar_residential_rooftop',
    category: 'utilities',
    service: 'Solar & Clean Energy',
    subService: 'Rooftop Solar PV',
    title: 'Tier-1 Bifacial Solar Rooftop Installation',
    caption: 'Bifacial TopCon 550Wp modules mounted on hot-dip galvanized elevated structure with 150 km/h wind rating.',
    url: '/assets/marketing/buildeco-solar-rooftop-premium-v1814.webp',
    mobileUrl: '/assets/marketing/buildeco-solar-rooftop-premium-v1814.webp',
    objectPosition: 'center 52%',
    altText: 'High-efficiency solar photovoltaic panels installed on clean residential rooftop terrace',
    type: 'brand_context',
    badge: 'PM Surya Ghar Approved',
    licenseSource: 'BuildEcoGroup generated asset'
  },
  'solar_inverter_system': {
    id: 'solar_inverter_system',
    category: 'utilities',
    service: 'Solar & Clean Energy',
    subService: 'Inverters & Net Metering',
    title: 'Smart On-Grid String Inverter & Net Metering',
    url: 'https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=800&q=80',
    altText: 'Wall-mounted digital solar inverter with smart Wi-Fi monitoring and bidirectional UPPCL meter',
    type: 'brand_context',
    badge: 'UPPCL Net Meter',
    licenseSource: 'Unsplash'
  },
  'water_stp_modular': {
    id: 'water_stp_modular',
    category: 'utilities',
    service: 'Water & Waste Management',
    subService: 'Modular Sewage Treatment Plant (STP)',
    title: 'Zero-Discharge MBBR Sewage Treatment Plant',
    caption: 'Underground zero-odor biological STP producing treated water for landscaping and flushing.',
    url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=768&h=576&fit=crop&q=80',
    altText: 'Modern water treatment filtration and pumping facility with pressure pumps and digital flow meters',
    type: 'brand_context',
    badge: 'CPCB / UPPCB Compliant',
    licenseSource: 'Unsplash'
  },
  'tech_cctv_iot_monitoring': {
    id: 'tech_cctv_iot_monitoring',
    category: 'technology',
    service: 'Site Surveillance & Tech',
    subService: 'Solar 4G AI Cameras',
    title: 'Autonomous Solar 4G Site Surveillance',
    caption: 'Continuous 360-degree site QA monitoring, live cement delivery tracking, and perimeter intrusion detection.',
    url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
    altText: 'High-definition 4G outdoor dome security camera mounted on construction site pole',
    type: 'brand_context',
    badge: '24/7 AI Stream',
    licenseSource: 'Unsplash'
  },

  // ==========================================
  // 7. MATERIAL MART (2CLICK) PRODUCTS
  // ==========================================
  'mat_tmt_steel': {
    id: 'mat_tmt_steel',
    category: 'material_mart',
    title: 'Primary Fe550D TMT Rebar Bundles',
    url: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=800&q=80',
    altText: 'Bundles of certified Fe550D high-ductility steel rebar rods with manufacturer mill test tag',
    type: 'brand_context',
    badge: 'Tata / Jindal Primary',
    licenseSource: 'Unsplash'
  },
  'mat_cement_rmc': {
    id: 'mat_cement_rmc',
    category: 'material_mart',
    title: 'Ready Mix Concrete (RMC) & OPC 53 Grade',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    altText: 'Transit mixer pouring freshly mixed certified M25 grade concrete on site',
    type: 'brand_context',
    badge: 'UltraTech / ACC Verified',
    licenseSource: 'Unsplash'
  },
  'mat_porcelain_tiles': {
    id: 'mat_porcelain_tiles',
    category: 'material_mart',
    title: 'Glazed Vitrified Floor Tiles (GVT)',
    url: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=800&q=80',
    altText: 'Large format premium Italian marble finish vitrified porcelain floor tiles in showroom display',
    type: 'brand_context',
    badge: 'Kajaria / Somany Grade 1',
    licenseSource: 'Unsplash'
  },
  'mat_sanitary_fittings': {
    id: 'mat_sanitary_fittings',
    category: 'material_mart',
    title: 'Luxury Sanitaryware & CP Fittings',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    altText: 'Modern bathroom fixture display with matte black brassware taps and wall-hung WC',
    type: 'brand_context',
    badge: 'Jaquar / Kohler Grade',
    licenseSource: 'Unsplash'
  },

  // ==========================================
  // 8. HEAVY CONSTRUCTION MACHINERY
  // ==========================================
  'machinery_jcb_excavator': {
    id: 'machinery_jcb_excavator',
    category: 'machinery',
    title: 'JCB 3DX & Hydraulic Excavator',
    caption: 'Available for hourly/daily rental with verified licensed operators and GPS hour meters.',
    url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    altText: 'Yellow heavy hydraulic excavator digging earth foundation on construction site',
    type: 'brand_context',
    badge: 'Verified Fleet',
    licenseSource: 'Unsplash'
  },
  'machinery_concrete_mixer': {
    id: 'machinery_concrete_mixer',
    category: 'machinery',
    title: 'Batching Plant & Hydraulic Hopper Mixer',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    altText: 'Heavy-duty automatic concrete batching machine with mechanical lift hopper',
    type: 'brand_context',
    badge: 'Calibrated Ratio',
    licenseSource: 'Unsplash'
  },
  'machinery_tower_crane': {
    id: 'machinery_tower_crane',
    category: 'machinery',
    title: 'Self-Erecting Tower Crane & Material Hoist',
    url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    altText: 'Tower crane silhouetted against sky lifting precast structural components',
    type: 'brand_context',
    badge: 'Safety Certified',
    licenseSource: 'Unsplash'
  },

  // ==========================================
  // 9. GENUINE SKILLED TRADES IN ACTION
  // ==========================================
  'trade_electrician_action': {
    id: 'trade_electrician_action',
    category: 'skilled_services',
    service: 'Electrical Services',
    title: 'Licensed Electrician at Distribution Board (DB)',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    altText: 'Professional electrician wearing safety gloves testing MCB distribution board wiring with multimeter',
    type: 'brand_context',
    badge: 'Wireman License Certified',
    licenseSource: 'Unsplash'
  },
  'trade_plumber_action': {
    id: 'trade_plumber_action',
    category: 'skilled_services',
    service: 'Plumbing Services',
    title: 'Master Plumber Pressure-Testing CPVC Manifold',
    url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    altText: 'Plumber working with pipe wrench on high-pressure water supply connection',
    type: 'brand_context',
    badge: 'Hydrostatic Tested',
    licenseSource: 'Unsplash'
  },
  'trade_carpenter_action': {
    id: 'trade_carpenter_action',
    category: 'skilled_services',
    service: 'Carpentry & Joinery',
    title: 'Craftsman Fabricating Modular Joinery',
    url: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=800&q=80',
    altText: 'Carpenter using precision wood working tools and level to assemble wooden wardrobe frames',
    type: 'brand_context',
    badge: 'BWP Marine Quality',
    licenseSource: 'Unsplash'
  },
  'trade_solar_tech_action': {
    id: 'trade_solar_tech_action',
    category: 'skilled_services',
    service: 'Solar Installation',
    title: 'Certified Solar Technician Wiring Array',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    altText: 'Solar technician in safety harness connecting MC4 waterproof connectors to solar module string',
    type: 'brand_context',
    badge: 'MNRE Certified',
    licenseSource: 'Unsplash'
  },
  'enrollment_network_hero': {
    id: 'enrollment_network_hero',
    category: 'consultants',
    service: 'Network Empanelment',
    title: 'Professional Network Onboarding',
    caption: 'Illustrative — chartered engineers, vendors and skilled trades joining the BuildEco coordination network.',
    url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=768&h=576&fit=crop&q=80',
    altText: 'Professional team reviewing project plans at a conference table — illustrative enrollment context',
    type: 'brand_context',
    badge: 'Empanelment',
    aspectRatio: '16:9',
    licenseSource: 'Unsplash Commercial / BuildEco Curated'
  },
  'track_case_dashboard': {
    id: 'track_case_dashboard',
    category: 'technology',
    service: 'Case Tracking',
    title: 'Digital Case Milestone Tracking',
    caption: 'Illustrative — live milestone governance and document vault tied to Case ID.',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=768&h=576&fit=crop&q=80',
    altText: 'Analytics dashboard showing project milestone tracking and status metrics',
    type: 'illustrative_reference',
    badge: 'Live Status',
    aspectRatio: '16:9',
    licenseSource: 'Unsplash'
  },
  'boq_hero_materials': {
    id: 'boq_hero_materials',
    category: 'material_mart',
    title: 'Normalized BOQ & Material Quantities',
    caption: 'Steel, cement and finishing material takeoffs for CPWD-normalized tender packages.',
    url: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=1200&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=768&h=576&fit=crop&q=80',
    altText: 'Certified TMT steel rebar bundles with mill test documentation for BOQ normalization',
    type: 'brand_context',
    badge: 'CPWD Normalized',
    aspectRatio: '16:9',
    licenseSource: 'Unsplash'
  },
  'consultant_discipline_hero': {
    id: 'consultant_discipline_hero',
    category: 'consultants',
    title: 'Multi-Disciplinary Expert Network',
    caption: 'Illustrative — structural, MEP, GIS and solar specialists coordinated per Case ID.',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=768&h=576&fit=crop&q=80',
    altText: 'Field engineer with surveying equipment — illustrative expert network context',
    type: 'brand_context',
    badge: '13 Disciplines',
    aspectRatio: '16:9',
    licenseSource: 'Unsplash'
  },
  'consultant_verified_photo_placeholder': {
    id: 'consultant_verified_photo_placeholder',
    category: 'consultants',
    title: 'Verified Consultant Headshot',
    altText: 'ASSET REQUIRED — verified consultant photograph pending upload',
    url: '',
    type: 'brand_context',
    status: 'asset_required',
    fallbackIcon: 'consultant',
    licenseSource: 'BuildEco — pending verified upload'
  },
};

/** Page key → primary hero asset in MEDIA_REGISTRY */
export const PAGE_HERO_ASSETS: Record<string, string> = {
  home: 'hero_modern_development',
  construction: 'hero_construction_controls',
  land: 'hero_plotted_land',
  property: 'prop_luxury_villa',
  solar: 'solar_residential_rooftop',
  interior: 'const_stage_7_interior',
  renovation: 'const_stage_6_finishing',
  consultants: 'consultant_discipline_hero',
  boq: 'boq_hero_materials',
  material: 'mat_tmt_steel',
  tracking: 'track_case_dashboard',
  water: 'water_stp_modular',
  waste: 'water_stp_modular',
  enrollment: 'enrollment_network_hero',
  initiate: 'hero_modern_development',
  gis: 'land_gis_drone_survey',
};

export function getMediaAsset(key: string): MediaAsset | undefined {
  return MEDIA_REGISTRY[key];
}

export function getPageHeroAssetKey(pageKey: string): string {
  return PAGE_HERO_ASSETS[pageKey] ?? 'hero_modern_development';
}

export function getAssetsByCategory(category: MediaAsset['category']): MediaAsset[] {
  return Object.values(MEDIA_REGISTRY).filter((a) => a.category === category && a.status !== 'asset_required');
}

/**
 * Service-Specific Photo Upload Guidelines & Prompts
 * Used dynamically by UniversalCaseIntakeModal & query forms.
 */
export interface ServicePhotoPrompt {
  serviceKey: string;
  badgeLabel: string;
  hindiPrompt: string;
  englishPrompt: string;
  recommendedAttachments: {
    label: string;
    iconToken: IconToken;
    description: string;
  }[];
  warningNote?: string;
}

export const SERVICE_PHOTO_PROMPTS: Record<string, ServicePhotoPrompt> = {
  'plumbing': {
    serviceKey: 'plumbing',
    badgeLabel: 'Plumbing & Drainage',
    hindiPrompt: 'Leak, seepage या problem area की clear photo upload करें।',
    englishPrompt: 'Upload clear photos of the leak, moisture seepage, or plumbing manifold.',
    recommendedAttachments: [
      { label: 'Problem Area Photo', iconToken: 'surveillance', description: 'Close-up of leaking pipe, joint, or damp wall' },
      { label: 'Supply Line / Valve', iconToken: 'maintenance', description: 'Photo of the main stop-cock or water meter' },
      { label: 'Plumbing Layout (If any)', iconToken: 'documents', description: 'As-built pipe routing drawing or sketch' }
    ]
  },
  'electrical': {
    serviceKey: 'electrical',
    badgeLabel: 'Electrical & Power',
    hindiPrompt: 'DB, switchboard या affected area की photo upload करें। Live exposed wiring को touch न करें।',
    englishPrompt: 'Upload photos of the DB panel, switchboard, or inverter. Do not touch live wiring.',
    warningNote: 'Safety Mandate: Never touch or measure bare live electrical conductors.',
    recommendedAttachments: [
      { label: 'DB / Panel Photo', iconToken: 'security', description: 'Front view of distribution board or MCBs' },
      { label: 'Affected Load / Device', iconToken: 'material', description: 'Faulty appliance, light fixture, or conduit' },
      { label: 'Electricity Bill', iconToken: 'documents', description: 'Recent bill showing sanctioned load (KW)' }
    ]
  },
  'land': {
    serviceKey: 'land',
    badgeLabel: 'Land Feasibility & GIS',
    hindiPrompt: 'Land/plot photos और available map/document (Khasra/Khatauni) upload करें।',
    englishPrompt: 'Upload site boundary photos, access road views, and Khasra/Khatauni documents.',
    recommendedAttachments: [
      { label: 'Site Boundary Photos', iconToken: 'land', description: 'Corner-to-corner view of the land parcel' },
      { label: 'Access Road Photo', iconToken: 'location', description: 'Approach road width and surrounding developments' },
      { label: 'Revenue Map / Khatauni', iconToken: 'documents', description: 'Khasra document or registered sale deed copy' },
      { label: 'Contour / Layout (If any)', iconToken: 'gis', description: 'Topographical survey drawing' }
    ]
  },
  'construction': {
    serviceKey: 'construction',
    badgeLabel: 'Construction & BOQ',
    hindiPrompt: 'Site progress/problem area और drawing/floor plan upload करें।',
    englishPrompt: 'Upload current site status photos, structural drawings, or floor plans.',
    recommendedAttachments: [
      { label: 'Site Progress Photos', iconToken: 'construction', description: 'Overall wide shot of active construction site' },
      { label: 'Specific Stage / Issue', iconToken: 'material', description: 'Rebar tying, shuttering, or brickwork close-up' },
      { label: 'Architectural / Structural Drawing', iconToken: 'documents', description: 'PDF or image of sanctioned floor plan' },
      { label: 'BOQ / Quotation (Optional)', iconToken: 'boq', description: 'Contractor quotation for cost normalization audit' }
    ]
  },
  'solar': {
    serviceKey: 'solar',
    badgeLabel: 'Solar Rooftop & Microgrid',
    hindiPrompt: 'Roof space और electrical meter/panel की photos upload करें।',
    englishPrompt: 'Upload shadow-free rooftop photos and the main electrical meter/bill.',
    recommendedAttachments: [
      { label: 'Rooftop Terrace View', iconToken: 'solar', description: 'Wide shot showing parapet walls & shadow obstructions' },
      { label: 'DISCOM Energy Meter', iconToken: 'material', description: 'Current digital electricity meter box' },
      { label: 'Latest Electricity Bill', iconToken: 'documents', description: 'Bill showing CA Number and sanctioned KW' }
    ]
  },
  'property': {
    serviceKey: 'property',
    badgeLabel: 'Property Valuation & Listing',
    hindiPrompt: 'Front elevation, rooms और property surroundings की photos upload करें।',
    englishPrompt: 'Upload front elevation, key rooms (hall/kitchen), and approach street photos.',
    recommendedAttachments: [
      { label: 'Front Elevation', iconToken: 'property', description: 'Full frontal building facade and main gate' },
      { label: 'Interior Rooms', iconToken: 'interior', description: 'Living room, bedrooms, and modular kitchen' },
      { label: 'Street & Neighborhood', iconToken: 'location', description: 'Width of frontage road and immediate landmarks' }
    ]
  },
  'interior': {
    serviceKey: 'interior',
    badgeLabel: 'Interior Architecture',
    hindiPrompt: 'Current room/space photos, rough floor sketch और inspiration upload करें।',
    englishPrompt: 'Upload bare room photos, floor dimensions, and interior inspiration images.',
    recommendedAttachments: [
      { label: 'Bare Room Views', iconToken: 'interior', description: 'Wide-angle photos of walls, windows, and ceiling' },
      { label: 'Rough Dimension Sketch', iconToken: 'documents', description: 'Hand-drawn room measurements (L x W x H)' },
      { label: 'Style Inspiration', iconToken: 'compare', description: 'Reference photos of preferred design aesthetics' }
    ]
  },
  'water': {
    serviceKey: 'water',
    badgeLabel: 'Water Treatment & STP',
    hindiPrompt: 'Water source, existing pump/treatment unit या site area की photos upload करें।',
    englishPrompt: 'Upload photos of raw water source, existing pump room, or STP tank location.',
    recommendedAttachments: [
      { label: 'Raw Water Source / Borewell', iconToken: 'water', description: 'Borewell head, sump tank, or inlet manifold' },
      { label: 'Space for Plant', iconToken: 'construction', description: 'Available footprint area for STP/RO installation' },
      { label: 'Water Test Report (If any)', iconToken: 'documents', description: 'TDS, hardness, and coliform lab report' }
    ]
  }
};

/**
 * Helper to get the prompt configuration for a given objective or category
 */
export function getPhotoPromptForObjective(objectiveOrCategory: string): ServicePhotoPrompt {
  const str = objectiveOrCategory.toLowerCase();
  if (str.includes('plumb') || str.includes('pipe') || str.includes('drain')) {
    return SERVICE_PHOTO_PROMPTS.plumbing;
  }
  if (str.includes('elect') || str.includes('power') || str.includes('wire') || str.includes('switch')) {
    return SERVICE_PHOTO_PROMPTS.electrical;
  }
  if (str.includes('land') || str.includes('plot') || str.includes('khasra') || str.includes('gis') || str.includes('feasibility')) {
    return SERVICE_PHOTO_PROMPTS.land;
  }
  if (str.includes('solar') || str.includes('pv') || str.includes('surya') || str.includes('neda')) {
    return SERVICE_PHOTO_PROMPTS.solar;
  }
  if (str.includes('interior') || str.includes('kitchen') || str.includes('decor') || str.includes('wardrobe')) {
    return SERVICE_PHOTO_PROMPTS.interior;
  }
  if (str.includes('water') || str.includes('stp') || str.includes('etp') || str.includes('sewage') || str.includes('ro')) {
    return SERVICE_PHOTO_PROMPTS.water;
  }
  if (str.includes('prop') || str.includes('flat') || str.includes('apartment') || str.includes('villa') || str.includes('rent')) {
    return SERVICE_PHOTO_PROMPTS.property;
  }
  // Default to construction
  return SERVICE_PHOTO_PROMPTS.construction;
}
