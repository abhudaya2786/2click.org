import { 
  SolarSystemTopology, 
  SolarProductItem, 
  StateSubsidyRule, 
  SolarCustomerType, 
  RoofType, 
  SolarCalculationResult 
} from '../types/solar';

// ==========================================
// 1. TOPOLOGIES & PROJECT CATEGORIES
// ==========================================
export const SOLAR_TOPOLOGIES: SolarSystemTopology[] = [
  {
    id: 'residential-ongrid',
    categoryName: 'Residential On-Grid Rooftop',
    capacityRange: '1 kWp to 15 kWp',
    targetSegment: 'Individual villas, bungalows, row houses, and residential housing societies (GHS/RWA).',
    gridConnection: 'LT Single-Phase (1-3 kW) or Three-Phase (4-15 kW) with Bi-directional Net Metering.',
    keyComponents: [
      'N-Type Bifacial TOPCon / Mono PERC Glass-Glass Modules (550Wp+)',
      'Single / 3-Phase Multi-MPPT Grid-Tie String Inverter (Wi-Fi Enabled)',
      'Bi-directional Net Generation & Import/Export Digital Energy Meter',
      'IP65 DCDB & ACDB Enclosures with Class-II Type-2 Surge Protection (SPD)',
      'Pre-galvanized / HDG Elevated High-Rise or Flush Mounting Structure',
      'Dedicated Dual Chemical Earthing (DC + AC + Lightning Arrester ESE)'
    ],
    architectureOverview: 'Grid-synchronized solar generator where daytime generation offsets household consumption and surplus energy is exported to the Discom grid under Net Metering laws. Supported by National PM Surya Ghar central and state capital subsidies.',
    standardsAndCodes: 'IS 14286 / IEC 61215, CEA Grid Regulations 2023, BIS, MNRE ALMM List-I.',
    idealFor: ['Homes with monthly power bills ₹1,500 – ₹25,000', 'Apartment RWA common lift & water pumps', 'Gated communities'],
    bannerBadge: 'Max ₹1,08,000 Subsidy Available',
    iconName: 'Home',
    estimatedPricingPerKw: 55000
  },
  {
    id: 'ci-rooftop',
    categoryName: 'Commercial & Industrial (C&I) Rooftop',
    capacityRange: '20 kWp to 1,000 kWp+',
    targetSegment: 'Manufacturing units, cold storages, textile mills, auto ancillaries, hospitals, universities, tech parks.',
    gridConnection: 'LT (415V) or HT (11kV / 33kV) synchronized with dedicated HT breaker panel & CEIG clearance.',
    keyComponents: [
      'High-Power Bifacial TOPCon Modules (580Wp – 620Wp, 22.8%+ Efficiency)',
      'Multi-MPPT High-Capacity Commercial String Inverters (50kW – 125kW)',
      'Zero-Export Controller / DG-PV Synchronization Controller (Fuel Save)',
      'Anodized Aluminium Non-Penetrative Kliplok / Trapezoidal Sheet Brackets',
      'Class-A Weather Station (Pyranometer, Anemometer, Module Temp Sensors)',
      'Cloud SCADA Gateway with Modbus RS485 / 4G RTU Telemetry'
    ],
    architectureOverview: 'Engineered for high daytime energy intensive enterprises. Drastically cuts peak commercial tariffs (₹9–12/kWh) down to ₹2.50–₹3.20/kWh levelized cost. Leverages 40% Accelerated Depreciation (AD) tax write-off in Year 1.',
    standardsAndCodes: 'CEA (Measures Relating to Safety and Electric Supply), IEEE 1547, CEIG Standards.',
    idealFor: ['Industrial sheds with GI/metal roofing', 'Corporate headquarters & logistics hubs', 'Hospitals & cold chain logistics'],
    bannerBadge: '40% Accelerated Depreciation Eligible',
    iconName: 'Building2',
    estimatedPricingPerKw: 42000
  },
  {
    id: 'ground-mounted-utility',
    categoryName: 'Ground-Mounted Utility & Captive Parks',
    capacityRange: '1 MWp to 100 MWp+',
    targetSegment: 'Independent Power Producers (IPPs), Heavy Energy Intensive Industries (Steel, Cement, Chemicals).',
    gridConnection: 'Grid Interconnection at 11kV / 33kV / 66kV / 132kV Substation via Dedicated Transmission Bay.',
    keyComponents: [
      'Dual-Glass Frameless Bifacial Modules with 80%+ Bifaciality Albedo Factor',
      'Single-Axis Autonomous Astronomical Smart Solar Trackers / HDG Fixed Tilt',
      'High-Capacity Utility String Inverters (250kW – 350kW) or Central Inverters',
      'Oil-Immersed Step-Up Power Transformers (0.8kV to 11kV/33kV)',
      'Optical Fiber SCADA Network with Predictive AI String-Level Monitoring',
      'Automated Waterless Robotic Module Cleaning System'
    ],
    architectureOverview: 'Large-scale utility or captive open access plants designed for lowest Levelized Cost of Electricity (LCOE). Captive and Group Captive structures exempt wheeling cross-subsidy surcharges under Green Energy Open Access Rules.',
    standardsAndCodes: 'CERC / SERC Open Access Regulations, CEA Grid Connectivity Standards.',
    idealFor: ['Barren land owners seeking 25-yr lease revenue', 'Captive Open Access consumers (>100 kW load)', 'Solar Park EPCs'],
    bannerBadge: 'Green Energy Open Access Ready',
    iconName: 'Globe',
    estimatedPricingPerKw: 38000
  },
  {
    id: 'offgrid-bess',
    categoryName: 'Off-Grid Solar & Battery Storage (BESS)',
    capacityRange: '1 kWp to 50 kWp+',
    targetSegment: 'Remote rural residences, forest farmhouses, eco-resorts, highway petrol pumps, telecommunication towers.',
    gridConnection: 'Standalone Islanded System with Automatic Changeover Switch and Diesel Generator Integration.',
    keyComponents: [
      'High-Efficiency Mono PERC / TOPCon Solar PV Modules',
      'Heavy-Duty MPPT Pure Sine Wave Solar PCU with Galvanic Isolation',
      'Lithium Iron Phosphate (LiFePO4) 48V/96V Battery Bank (6,000+ Cycles)',
      'Intelligent Battery Management System (BMS) with Thermal Cutoff',
      'Heavy Gauge DC Battery Cables & Fast-Blow Class-T DC Fuses',
      'Integrated Priority Logic: Solar > Battery > Grid / DG'
    ],
    architectureOverview: 'Self-sufficient decentralized energy generator providing 24/7 continuous uninterrupted power in regions with unreliable or zero grid availability. Zero diesel dependence with quiet, emission-free stored solar power.',
    standardsAndCodes: 'IEC 62109, IEC 62619 (Lithium Battery Safety), UN38.3.',
    idealFor: ['Off-grid holiday homes and resorts', 'Agro-processing units without stable grid', 'Critical telecom & surveillance nodes'],
    bannerBadge: '100% Grid Independent',
    iconName: 'BatteryCharging',
    estimatedPricingPerKw: 68000
  },
  {
    id: 'hybrid-smartgrid',
    categoryName: 'Hybrid Smart Grid-Interactive Storage',
    capacityRange: '3 kWp to 100 kWp',
    targetSegment: 'Premium luxury residences, IT servers, specialty clinics, dental surgeries, diagnostic labs.',
    gridConnection: 'Bi-directional Hybrid Grid Interconnection with sub-10ms Emergency Power Supply (EPS) UPS backup.',
    keyComponents: [
      'Tier-1 All-Black or High-Efficiency Glass-Glass TOPCon Modules',
      'Bi-Directional Smart Hybrid Inverter with Dual MPPT & Dedicated EPS Port',
      'Modular High-Voltage (HV) LiFePO4 Battery Tower (10 kWh – 60 kWh)',
      'Smart Bidirectional CT Meter for Zero-Export & Peak Shaving Regulation',
      'App-Controlled Time-of-Day (TOD) Tariff Battery Arbitrage Automation',
      'Lightning-Fast Auto-Transfer Switch (<10ms Seamless UPS Switching)'
    ],
    architectureOverview: 'The ultimate modern solar system combining net-metered grid savings with instantaneous zero-downtime UPS backup. Intelligently stores cheap daytime solar to power high evening peak tariff loads.',
    standardsAndCodes: 'VDE-AR-N 4105, EN 50549-1, IEC 62109-1/-2, UL 9540.',
    idealFor: ['High-end villas with sensitive electronics & home automation', 'Diagnostic centres & operation theatres', 'Continuous IT workstations'],
    bannerBadge: 'Zero Downtime (<10ms UPS)',
    iconName: 'Zap',
    estimatedPricingPerKw: 75000
  },
  {
    id: 'agricultural-kusum',
    categoryName: 'Solar Water Pumping (PM-KUSUM)',
    capacityRange: '3 HP to 10 HP (2.4 kWp to 9 kWp)',
    targetSegment: 'Farmers, agricultural estates, irrigation cooperatives, remote farming communities.',
    gridConnection: 'Off-grid Standalone (Component-B) or Grid-Connected Feeder Solarization (Component-C).',
    keyComponents: [
      'High-Durability Polycrystalline or Mono PERC Modules (MNRE Certified)',
      'IP65 Solar Pump Controller with Variable Frequency Drive (VFD & MPPT)',
      'High-Efficiency Submersible Borewell or Surface Monoblock Water Pump',
      'Manual Season-Tilt or Solar-Tracking Hot-Dip Galvanized Mounting Structure',
      'Dry-Run, Reverse Polarity & Lightning Surge Protections',
      'Remote Telemetry & Water Flow Sensor Module'
    ],
    architectureOverview: 'Empowers farmers with reliable daytime irrigation without diesel costs or erratic midnight power cuts. Backed by up to 60% combined Central and State financial support under PM-KUSUM Component-B.',
    standardsAndCodes: 'MNRE Specifications for Solar Water Pumping Systems 2023, BIS 14286.',
    idealFor: ['Borewell depths from 50 ft to 450 ft', 'Drip & sprinkler horticulture irrigation', 'Remote agricultural farmland'],
    bannerBadge: 'Up to 60% Govt Subsidy',
    iconName: 'Droplet',
    estimatedPricingPerKw: 48000
  }
];

// ==========================================
// 2. HARDWARE DIRECTORY & PRODUCT CATALOG
// ==========================================
export const SOLAR_PRODUCTS_CATALOG: SolarProductItem[] = [
  // --- PV MODULES ---
  {
    id: 'prod-mod-waaree-topcon-580',
    sku: 'BEG-MOD-WAAREE-580W-TOPCON',
    name: 'Waaree 580Wp N-Type Bifacial TOPCon Module',
    category: 'MODULE',
    subcategory: 'TOPCon Dual-Glass Bifacial',
    brand: 'Waaree Energies',
    brandName: 'Waaree Energies',
    model: 'WST-580W-Bifacial-TOPCon',
    modelNumber: 'WST-580W-Bifacial-TOPCon',
    capacityRating: '580 Wp',
    capacityValue: 580,
    capacityUnit: 'Wp',
    technologyType: 'TOPCon',
    efficiencyPercentage: 22.45,
    temperatureCoefficient: '-0.30%/°C',
    bifacialityFactor: '80% ± 5%',
    warrantyYears: 12,
    linearWarrantyYears: 30,
    almmApproved: true,
    inStock: true,
    leadTimeDays: 3,
    basePrice: 12760,
    currency: 'INR',
    priceEstimate: '₹21.50 – ₹24.00 / Wp',
    priceDisplay: '₹22.00 / Wp',
    keyFeatures: [
      '144 Split-Cell N-Type TOPCon Technology with 16BB (Busbar) Architecture',
      'Superior low-light diffuse irradiance generation (morning & overcast)',
      'Anti-PID (Potential Induced Degradation) & Anti-LID certified',
      'Heavy load certification: 5400 Pa front snow / 2400 Pa rear wind'
    ],
    datasheetSummary: 'Premier Indian manufacturer with massive ALMM capacity. Ideal for residential rooftops and utility C&I plants requiring maximum power density.',
    countryOfOrigin: 'India (ALMM List-I)',
    tier: 'Tier-1 Premium',
    specifications: {
      voc: '51.20 V',
      isc: '14.28 A',
      vmp: '42.80 V',
      imp: '13.56 A',
      dimensions: '2278 x 1134 x 35 mm',
      weight: '28.5 kg',
      glass: '2.0mm + 2.0mm Dual AR Coated Tempered Glass'
    }
  },
  {
    id: 'prod-mod-adani-topcon-590',
    sku: 'BEG-MOD-ADANI-590W-TOPCON',
    name: 'Adani Elan Shine 590Wp TOPCon Dual-Glass Module',
    category: 'MODULE',
    subcategory: 'TOPCon Bifacial Glass-Glass',
    brand: 'Adani Solar',
    brandName: 'Adani Solar',
    model: 'Elan-Shine-TOPCon-590',
    modelNumber: 'Elan-Shine-TOPCon-590',
    capacityRating: '590 Wp',
    capacityValue: 590,
    capacityUnit: 'Wp',
    technologyType: 'TOPCon',
    efficiencyPercentage: 22.84,
    temperatureCoefficient: '-0.29%/°C',
    bifacialityFactor: '85% ± 5%',
    warrantyYears: 15,
    linearWarrantyYears: 30,
    almmApproved: true,
    inStock: true,
    leadTimeDays: 4,
    basePrice: 13275,
    currency: 'INR',
    priceEstimate: '₹22.00 – ₹25.00 / Wp',
    priceDisplay: '₹22.50 / Wp',
    keyFeatures: [
      'Ultra-low degradation: <1.0% in Year 1, 0.40% linear per year',
      'M10 wafer with micro-gap high-density encapsulation',
      'Dual POE (Polyolefin Elastomer) glass-glass hermetic sealing',
      'Certified for ammonia & salt mist coastal installations'
    ],
    datasheetSummary: 'Heavy-duty bifacial module with industry-leading temperature coefficient for hot Indian tropical climates.',
    countryOfOrigin: 'India (ALMM List-I)',
    tier: 'Tier-1 Premium',
    specifications: {
      voc: '51.80 V',
      isc: '14.42 A',
      vmp: '43.20 V',
      imp: '13.66 A',
      dimensions: '2278 x 1134 x 35 mm',
      weight: '29.0 kg',
      glass: '2.0mm + 2.0mm High Transmission Heat-Strengthened Glass'
    }
  },
  {
    id: 'prod-mod-tatapower-mono-545',
    sku: 'BEG-MOD-TATA-545W-MONOPERC',
    name: 'Tata Power 545Wp Mono PERC Half-Cut Module',
    category: 'MODULE',
    subcategory: 'Mono PERC Monofacial',
    brand: 'Tata Power Solar',
    brandName: 'Tata Power Solar',
    model: 'TP-MonoPERC-545W',
    modelNumber: 'TP-MonoPERC-545W',
    capacityRating: '545 Wp',
    capacityValue: 545,
    capacityUnit: 'Wp',
    technologyType: 'Mono PERC',
    efficiencyPercentage: 21.12,
    temperatureCoefficient: '-0.35%/°C',
    bifacialityFactor: 'Monofacial',
    warrantyYears: 12,
    linearWarrantyYears: 25,
    almmApproved: true,
    inStock: true,
    leadTimeDays: 2,
    basePrice: 11445,
    currency: 'INR',
    priceEstimate: '₹19.50 – ₹22.00 / Wp',
    priceDisplay: '₹21.00 / Wp',
    keyFeatures: [
      '144 Half-cut Mono PERC cell matrix with 10BB ribbons',
      'Robust 35mm anodized aluminium alloy frame',
      'Proven 30+ year track record of Tata engineering reliability',
      'Optimized bypass diode layout for minimized hot-spot risk'
    ],
    datasheetSummary: 'Widely trusted residential workhorse module with extensive pan-India warranty service and proven long-term durability.',
    countryOfOrigin: 'India (ALMM List-I)',
    tier: 'Tier-1 Standard',
    specifications: {
      voc: '49.80 V',
      isc: '13.98 A',
      vmp: '41.60 V',
      imp: '13.11 A',
      dimensions: '2278 x 1134 x 35 mm',
      weight: '27.8 kg',
      glass: '3.2mm Toughened Solar Glass'
    }
  },
  {
    id: 'prod-mod-vikram-mono-550',
    sku: 'BEG-MOD-VIKRAM-550W-MONO',
    name: 'Vikram Solar Somera Grand 550Wp Mono PERC',
    category: 'MODULE',
    subcategory: 'Mono PERC Monofacial',
    brand: 'Vikram Solar',
    brandName: 'Vikram Solar',
    model: 'Somera-Grand-550W',
    modelNumber: 'Somera-Grand-550W',
    capacityRating: '550 Wp',
    capacityValue: 550,
    capacityUnit: 'Wp',
    technologyType: 'Mono PERC',
    efficiencyPercentage: 21.35,
    temperatureCoefficient: '-0.34%/°C',
    bifacialityFactor: 'Monofacial',
    warrantyYears: 12,
    linearWarrantyYears: 27,
    almmApproved: true,
    inStock: true,
    leadTimeDays: 3,
    basePrice: 11550,
    currency: 'INR',
    priceEstimate: '₹20.00 – ₹22.50 / Wp',
    priceDisplay: '₹21.00 / Wp',
    keyFeatures: [
      'Engineered with high-grade multi-busbar P-type mono wafers',
      'PID and LeTID resistant with enhanced electrolyte seal',
      'Optimized junction box with IP68 protection'
    ],
    datasheetSummary: 'Dependable domestic Tier-1 module engineered for rooftop and ground mount deployments with strong hail impact ratings.',
    countryOfOrigin: 'India (ALMM List-I)',
    tier: 'Tier-1 Standard',
    specifications: {
      voc: '50.10 V',
      isc: '14.05 A',
      vmp: '41.90 V',
      imp: '13.13 A',
      dimensions: '2278 x 1134 x 35 mm',
      weight: '28.0 kg',
      glass: '3.2mm Tempered Front Glass'
    }
  },
  {
    id: 'prod-mod-jinko-tiger-neo-615',
    sku: 'BEG-MOD-JINKO-615W-TOPCON',
    name: 'Jinko Solar Tiger Neo 615Wp N-Type TOPCon Dual-Glass',
    category: 'MODULE',
    subcategory: 'TOPCon Dual-Glass',
    brand: 'Jinko Solar',
    brandName: 'Jinko Solar',
    model: 'Tiger-Neo-N-Type-615W',
    modelNumber: 'Tiger-Neo-N-Type-615W',
    capacityRating: '615 Wp',
    capacityValue: 615,
    capacityUnit: 'Wp',
    technologyType: 'TOPCon',
    efficiencyPercentage: 23.23,
    temperatureCoefficient: '-0.29%/°C',
    bifacialityFactor: '80% ± 5%',
    warrantyYears: 15,
    linearWarrantyYears: 30,
    almmApproved: false,
    inStock: true,
    leadTimeDays: 7,
    basePrice: 13530,
    currency: 'INR',
    priceEstimate: '₹20.00 – ₹23.50 / Wp',
    priceDisplay: '₹22.00 / Wp',
    keyFeatures: [
      'Global efficiency benchmark with SMBB (Super Multiple Busbar) technology',
      'HOT 2.0 reliability engineering for high moisture resistance',
      'High power density saving up to 6% in structural BOS installation costs'
    ],
    datasheetSummary: 'Global Tier-1 powerhouse designed for large commercial, industrial, and ground-mounted utility megawatt projects.',
    countryOfOrigin: 'Global (Export / Commercial)',
    tier: 'Industrial Utility',
    specifications: {
      voc: '55.80 V',
      isc: '14.12 A',
      vmp: '46.70 V',
      imp: '13.17 A',
      dimensions: '2465 x 1134 x 35 mm',
      weight: '34.0 kg',
      glass: '2.0mm + 2.0mm Dual Glass'
    }
  },

  // --- INVERTERS ---
  {
    id: 'prod-inv-sungrow-sg110cx',
    sku: 'BEG-INV-SUNGROW-110KW-P2',
    name: 'Sungrow 110kW Commercial String Inverter',
    category: 'INVERTER',
    subcategory: 'Commercial String Inverter',
    brand: 'Sungrow',
    brandName: 'Sungrow',
    model: 'SG110CX-P2 Commercial String',
    modelNumber: 'SG110CX-P2 Commercial String',
    capacityRating: '110 kW (Three-Phase)',
    capacityValue: 110,
    capacityUnit: 'kW',
    technologyType: 'Multi-MPPT String',
    efficiencyPercentage: 98.6,
    mpptChannels: '9 MPPTs (18 Strings Input)',
    protectionRating: 'IP66 & C5 Anti-Corrosion',
    warrantyYears: 5,
    linearWarrantyYears: 10,
    almmApproved: true,
    inStock: true,
    leadTimeDays: 5,
    basePrice: 275000,
    currency: 'INR',
    priceEstimate: '₹2,65,000 – ₹2,95,000',
    priceDisplay: '₹2,75,000',
    keyFeatures: [
      'Industry-leading 9 Independent MPPTs with Max 30A current per MPPT',
      'Compatible with 500Wp+ and 600Wp+ high-current bifacial modules',
      'Integrated Smart IV Curve Diagnosis with 100% string scanning in 15s',
      'Type II DC & AC Surge Protection + AFCI (Arc Fault Circuit Interrupter)'
    ],
    datasheetSummary: 'The gold standard for commercial and industrial rooftops. Handles complex multi-pitch industrial sheds with zero string mismatch losses.',
    countryOfOrigin: 'India & Global',
    tier: 'Tier-1 Premium',
    specifications: {
      maxDcVoltage: '1100 V',
      mpptVoltageRange: '200 V – 1000 V',
      nominalAcOutput: '110 kW @ 400V 3-Phase',
      maxEfficiency: '98.6%',
      cooling: 'Smart Forced Air Cooling',
      communication: 'RS485, Ethernet, WLAN, 4G Optional'
    }
  },
  {
    id: 'prod-inv-goodwe-sdted',
    sku: 'BEG-INV-GOODWE-10KW-SDT',
    name: 'GoodWe 10kW Three-Phase On-Grid Inverter',
    category: 'INVERTER',
    subcategory: 'Residential / Light C&I String',
    brand: 'GoodWe',
    brandName: 'GoodWe',
    model: 'GW10K-SDT-20 (Three Phase)',
    modelNumber: 'GW10K-SDT-20 (Three Phase)',
    capacityRating: '10 kW (Three-Phase)',
    capacityValue: 10,
    capacityUnit: 'kW',
    technologyType: 'Multi-MPPT String',
    efficiencyPercentage: 98.3,
    mpptChannels: '2 MPPTs',
    protectionRating: 'IP65',
    warrantyYears: 5,
    linearWarrantyYears: 10,
    almmApproved: true,
    inStock: true,
    leadTimeDays: 2,
    basePrice: 62000,
    currency: 'INR',
    priceEstimate: '₹58,000 – ₹68,000',
    priceDisplay: '₹62,000',
    keyFeatures: [
      '16A Max input current per string for high-efficiency TOPCon panels',
      'Integrated DC Switch, Export Power Limitation & Smart Energy Management',
      'Built-in Wi-Fi / LAN communication module with GoodWe SEMS Portal',
      'Fanless natural convection cooling for silent residential operation'
    ],
    datasheetSummary: 'Perfect for large luxury residences and light commercial businesses with 3-phase LT connection.',
    countryOfOrigin: 'Global / India Service',
    tier: 'Tier-1 Standard',
    specifications: {
      maxDcVoltage: '1000 V',
      mpptVoltageRange: '180 V – 850 V',
      nominalAcOutput: '10 kW @ 400V 3-Phase',
      maxEfficiency: '98.3%',
      cooling: 'Natural Convection Silent Cooling',
      communication: 'Wi-Fi / LAN / RS485'
    }
  },
  {
    id: 'prod-inv-enphase-iq8p',
    sku: 'BEG-INV-ENPHASE-IQ8P',
    name: 'Enphase IQ8P High-Power Microinverter',
    category: 'INVERTER',
    subcategory: 'Module-Level Rapid Shutdown Microinverter',
    brand: 'Enphase Energy',
    brandName: 'Enphase Energy',
    model: 'IQ8P Micro-Inverter',
    modelNumber: 'IQ8P Micro-Inverter',
    capacityRating: '480 VA (Per Panel Microinverter)',
    capacityValue: 0.48,
    capacityUnit: 'kVA',
    technologyType: 'Microinverter',
    efficiencyPercentage: 97.4,
    protectionRating: 'IP67 Submersible Grade',
    warrantyYears: 25,
    linearWarrantyYears: 25,
    almmApproved: true,
    inStock: true,
    leadTimeDays: 3,
    basePrice: 15500,
    currency: 'INR',
    priceEstimate: '₹14,500 – ₹17,000 / Unit',
    priceDisplay: '₹15,500 / Unit',
    keyFeatures: [
      'Decentralized Module-Level MPPT with zero high-voltage DC on rooftop (<60V DC)',
      'Sub-second rapid shutdown meeting strict NEC 2023 / NFPA fire safety standards',
      'Individual panel telemetry app revealing shading impacts in real time',
      '25-Year standard comprehensive manufacturer replacement warranty'
    ],
    datasheetSummary: 'Premium residential micro-inverter system. The highest safety standard and optimal yield on roofs with tree shadows, parapets, or complex chimneys.',
    countryOfOrigin: 'USA / India Operations',
    tier: 'Tier-1 Premium',
    specifications: {
      peakOutputPower: '480 VA',
      operatingVoltageRange: '16 V – 65 V',
      gridCompatibility: '230 V Single Phase / 400 V Three Phase',
      peakEfficiency: '97.4%',
      casing: 'Class II Double-Insulated IP67'
    }
  },
  {
    id: 'prod-inv-deye-hybrid-12k',
    sku: 'BEG-INV-DEYE-12KW-HYBRID',
    name: 'Deye 12kW Three-Phase Hybrid Storage Inverter',
    category: 'INVERTER',
    subcategory: 'Bi-Directional Hybrid Storage Inverter',
    brand: 'Deye',
    brandName: 'Deye',
    model: 'SUN-12K-SG04LP3-EU Hybrid',
    modelNumber: 'SUN-12K-SG04LP3-EU Hybrid',
    capacityRating: '12 kW Hybrid (Three Phase)',
    capacityValue: 12,
    capacityUnit: 'kW',
    technologyType: 'Hybrid Storage',
    efficiencyPercentage: 97.6,
    mpptChannels: '2 MPPTs',
    protectionRating: 'IP65',
    warrantyYears: 5,
    linearWarrantyYears: 10,
    almmApproved: true,
    inStock: true,
    leadTimeDays: 4,
    basePrice: 155000,
    currency: 'INR',
    priceEstimate: '₹1,45,000 – ₹1,75,000',
    priceDisplay: '₹1,55,000',
    keyFeatures: [
      'Low Voltage 48V Battery input for maximum safety and economical storage pairing',
      'Rapid <4ms seamless automatic transfer switch for zero computer reboot',
      'Supports Diesel Generator auto-start contact and peak load shaving logic',
      'Color touch LCD screen with interactive parameter programming'
    ],
    datasheetSummary: 'Versatile hybrid inverter for luxury bungalows and critical hospitals requiring both solar export and uninterrupted battery backup.',
    countryOfOrigin: 'Global',
    tier: 'Tier-1 Premium',
    specifications: {
      batteryVoltage: '40 V – 60 V (48V LFP Banks)',
      maxChargingCurrent: '240 A',
      ratedAcOutput: '12 kW Continuous / 24 kW Peak (10s)',
      switchTime: '< 4 ms UPS Transfer',
      cooling: 'Intelligent Smart Fan'
    }
  },

  // --- BATTERIES & BESS ---
  {
    id: 'prod-bat-byd-hvs-102',
    sku: 'BEG-BAT-BYD-HVS-1024KWH',
    name: 'BYD Battery-Box Premium HVS 10.24kWh HV LFP Tower',
    category: 'BATTERY',
    subcategory: 'High-Voltage LFP Tower',
    brand: 'BYD Energy Storage',
    brandName: 'BYD Energy Storage',
    model: 'Battery-Box Premium HVS 10.2',
    modelNumber: 'Battery-Box Premium HVS 10.2',
    capacityRating: '10.24 kWh',
    capacityValue: 10.24,
    capacityUnit: 'kWh',
    technologyType: 'LFP',
    efficiencyPercentage: 96.0,
    bessCycleLife: 6000,
    depthOfDischarge: '100% Usable DoD',
    protectionRating: 'IP55',
    warrantyYears: 10,
    almmApproved: true,
    inStock: true,
    leadTimeDays: 6,
    basePrice: 315000,
    currency: 'INR',
    priceEstimate: '₹2,90,000 – ₹3,40,000',
    priceDisplay: '₹3,15,000',
    keyFeatures: [
      'Cobalt-Free Lithium Iron Phosphate (LFP) chemistry with highest thermal stability',
      'Patented modular plug-and-play stacking design (expandable from 5.1 to 66.2 kWh)',
      'High-Voltage series connection for highest conversion efficiency with Hybrid inverters',
      'Automated BMS balancing with remote cloud diagnostic health tracking'
    ],
    datasheetSummary: 'Leading global automotive-grade residential and light commercial battery system with 10-year full capacity warranty.',
    countryOfOrigin: 'Global Tier-1',
    tier: 'Tier-1 Premium',
    specifications: {
      usableCapacity: '10.24 kWh',
      nominalVoltage: '409.6 V (High Voltage)',
      maxContinuousOutput: '10.24 kW (25 A)',
      dimensions: '1178 x 585 x 298 mm',
      weight: '167 kg'
    }
  },
  {
    id: 'prod-bat-pylontech-us5000',
    sku: 'BEG-BAT-PYLONTECH-US5000',
    name: 'Pylontech US5000 4.8kWh 48V LFP Rack Module',
    category: 'BATTERY',
    subcategory: '48V Low-Voltage Rack LFP',
    brand: 'Pylontech',
    brandName: 'Pylontech',
    model: 'US5000 48V LFP Module',
    modelNumber: 'US5000 48V LFP Module',
    capacityRating: '4.8 kWh (48V 100Ah)',
    capacityValue: 4.8,
    capacityUnit: 'kWh',
    technologyType: 'LFP',
    efficiencyPercentage: 95.0,
    bessCycleLife: 6000,
    depthOfDischarge: '95% DoD',
    protectionRating: 'IP20 (19-inch Rack Cabinet)',
    warrantyYears: 10,
    almmApproved: true,
    inStock: true,
    leadTimeDays: 2,
    basePrice: 135000,
    currency: 'INR',
    priceEstimate: '₹1,25,000 – ₹1,45,000',
    priceDisplay: '₹1,35,000',
    keyFeatures: [
      'Modular 19-inch server rack form factor with daisy-chain CAN/RS485 communication',
      'Dual active battery management system protection against overcharge/deep discharge',
      'High continuous discharge rate (up to 100A peak per module)',
      'Seamless compatibility with Victron, Deye, GoodWe, and Growatt inverters'
    ],
    datasheetSummary: 'The most popular residential and commercial rack-mountable 48V LFP battery across Europe and Asia.',
    countryOfOrigin: 'Global',
    tier: 'Tier-1 Standard',
    specifications: {
      nominalVoltage: '48 V DC',
      nominalCapacity: '100 Ah (4800 Wh)',
      recommendedChargeCurrent: '50 A',
      maxContinuousDischarge: '100 A (15 mins @ 120A)',
      dimensions: '442 x 420 x 161 mm (3.5U Rack)',
      weight: '39.7 kg'
    }
  },
  {
    id: 'prod-bat-sungrow-ess-container',
    sku: 'BEG-BAT-SUNGROW-POWERTITAN',
    name: 'Sungrow PowerTitan 2.0 Liquid-Cooled C&I BESS Container',
    category: 'BATTERY',
    subcategory: 'Utility / Industrial Liquid-Cooled Container BESS',
    brand: 'Sungrow Power',
    brandName: 'Sungrow Power',
    model: 'PowerTitan 2.0 Liquid-Cooled C&I BESS',
    modelNumber: 'PowerTitan 2.0 Liquid-Cooled C&I BESS',
    capacityRating: '1.25 MW / 2.75 MWh Container',
    capacityValue: 2750,
    capacityUnit: 'kWh',
    technologyType: 'LFP',
    efficiencyPercentage: 93.5,
    bessCycleLife: 8000,
    depthOfDischarge: '100% DoD',
    protectionRating: 'IP55 Outdoor Containerized',
    warrantyYears: 10,
    almmApproved: true,
    inStock: true,
    leadTimeDays: 30,
    basePrice: 42000000,
    currency: 'INR',
    priceEstimate: 'Custom Utility RFQ Quote',
    priceDisplay: 'RFQ / Turnkey Project',
    keyFeatures: [
      'Integrated Liquid Cooling maintaining cell temperature variance below 2.5°C',
      'Integrated PCS (Power Conversion System), HVAC, and FSS (Fire Suppression System)',
      'Pre-assembled 20-ft container reducing on-site commissioning time by 60%',
      'Designed for industrial peak shaving, energy arbitrage, and diesel generator replacement'
    ],
    datasheetSummary: 'Enterprise utility-scale battery energy storage system (BESS) for C&I microgrids and renewable grid stabilization.',
    countryOfOrigin: 'Global Tier-1',
    tier: 'Industrial Utility',
    specifications: {
      acRatedPower: '1250 kW',
      dcCapacity: '2752 kWh',
      cellType: '314Ah High-Energy-Density LFP Cell',
      thermalManagement: 'Industrial Liquid Chiller with Intelligent Flow Valve',
      dimensions: '6058 x 2438 x 2896 mm (Standard 20-ft HQ)',
      totalWeight: '32 Tons'
    }
  }
];

// ==========================================
// 3. STATE SUBSIDY MATRIX
// ==========================================
export const STATE_SUBSIDY_DATABASE: StateSubsidyRule[] = [
  {
    stateCode: 'UP',
    stateName: 'Uttar Pradesh',
    discoms: ['MVVNL (Madhyanchal)', 'PVVNL (Paschimanchal)', 'PuVVNL (Purvanchal)', 'DVVNL (Dakshinanchal)', 'KESCO', 'Torrent Power Agra'],
    residentialTopUp1kW: 15000,
    residentialTopUp2kWPlus: 30000,
    netMeteringCapKw: 10,
    openAccessMinKw: 100,
    specialIncentives: 'UP NEDA provides ₹15,000 for 1kW and ₹30,000 flat for 2kW+ systems on top of PM Surya Ghar. Total maximum subsidy ₹1,08,000.'
  },
  {
    stateCode: 'GJ',
    stateName: 'Gujarat',
    discoms: ['UGVCL', 'DGVCL', 'MGVCL', 'PGVCL', 'Torrent Power (Ahmedabad/Surat)'],
    residentialTopUp1kW: 0,
    residentialTopUp2kWPlus: 0,
    netMeteringCapKw: 1000,
    openAccessMinKw: 100,
    specialIncentives: 'Surya Gujarat high-efficiency net-metering settlement with prompt banking credits & highest solar irradiance index.'
  },
  {
    stateCode: 'MH',
    stateName: 'Maharashtra',
    discoms: ['MSEDCL (Mahavitaran)', 'Tata Power Mumbai', 'Adani Electricity Mumbai', 'BEST'],
    residentialTopUp1kW: 0,
    residentialTopUp2kWPlus: 0,
    netMeteringCapKw: 1000,
    openAccessMinKw: 100,
    specialIncentives: 'Fast-track digital portal approvals with high C&I commercial grid tariffs (₹11–₹14/unit) creating sub-3-year payback periods.'
  },
  {
    stateCode: 'DL',
    stateName: 'Delhi (NCT)',
    discoms: ['BSES Rajdhani (BRPL)', 'BSES Yamuna (BYPL)', 'TPDDL (Tata Power Delhi)', 'NDMC'],
    residentialTopUp1kW: 20000,
    residentialTopUp2kWPlus: 30000,
    netMeteringCapKw: 500,
    openAccessMinKw: 100,
    specialIncentives: 'Delhi Solar Policy 2024: Generation Based Incentive (GBI) of ₹3.00/unit generated for 5 years directly credited to bank account.'
  },
  {
    stateCode: 'RJ',
    stateName: 'Rajasthan',
    discoms: ['JVVNL (Jaipur)', 'AVVNL (Ajmer)', 'JdVVNL (Jodhpur)'],
    residentialTopUp1kW: 0,
    residentialTopUp2kWPlus: 0,
    netMeteringCapKw: 500,
    openAccessMinKw: 100,
    specialIncentives: 'Highest solar irradiation in India (5.6 kWh/m²/day) generating 1,600+ units per kWp per year. Accelerated PM-KUSUM approvals.'
  },
  {
    stateCode: 'KA',
    stateName: 'Karnataka',
    discoms: ['BESCOM (Bengaluru)', 'MESCOM', 'HESCOM', 'GESCOM', 'CESC Mysuru'],
    residentialTopUp1kW: 0,
    residentialTopUp2kWPlus: 0,
    netMeteringCapKw: 1000,
    openAccessMinKw: 100,
    specialIncentives: 'Karnataka Renewable Energy Policy allows up to 100% sanctioned load for rooftop solar with streamlined DISCOM sync.'
  },
  {
    stateCode: 'HR',
    stateName: 'Haryana',
    discoms: ['DHBVN (Dakshin Haryana)', 'UHBVN (Uttar Haryana)'],
    residentialTopUp1kW: 0,
    residentialTopUp2kWPlus: 0,
    netMeteringCapKw: 500,
    openAccessMinKw: 100,
    specialIncentives: 'Mandatory rooftop solar for residential plots >500 sq.yards with expedited net metering within 15 working days.'
  }
];

// ==========================================
// 4. MATHEMATICAL SIZING ENGINE
// ==========================================
export function calculateSolarSystem(
  customerType: SolarCustomerType,
  monthlyBill: number,
  stateCode: string = 'UP',
  customTariff?: number,
  customRoofArea?: number,
  roofType: RoofType = 'RCC Slab'
): SolarCalculationResult {
  // Default tariff logic
  let averageTariff = customTariff || (customerType === 'Residential' ? 7.5 : 9.5);
  if (customerType === 'Agricultural') averageTariff = 5.0;

  // Step 1: Unit Consumption
  const monthlyUnits = Math.max(50, Math.round(monthlyBill / averageTariff));
  const dailyUnitsNeeded = monthlyUnits / 30;

  // Step 2: Peak Sun Hours (Standard 4.2 hours / CUF 17.5%)
  const peakSunHours = 4.2;
  const rawKWp = dailyUnitsNeeded / peakSunHours;

  // Rounding logic based on category
  let requiredKWp = Math.round(rawKWp * 10) / 10;
  if (customerType === 'Residential') {
    requiredKWp = Math.max(1, Math.min(25, requiredKWp));
  } else if (customerType === 'Commercial' || customerType === 'Industrial') {
    requiredKWp = Math.max(10, Math.round(rawKWp));
  } else {
    requiredKWp = Math.max(3, Math.round(rawKWp));
  }

  // Step 3: Roof Area Calculation (80 sq.ft per kWp for high efficiency TOPCon)
  const minRoofRequiredSqFt = Math.round(requiredKWp * 80);

  // Step 4: Estimated EPC Turnkey Cost
  const ratePerKW = customerType === 'Residential' ? 55000 : 42000;
  const estimatedEPCPrice = Math.round(requiredKWp * ratePerKW);

  // Step 5: Central Financial Assistance (CFA) Subsidy - PM Surya Ghar
  let cfaSubsidy = 0;
  if (customerType === 'Residential') {
    if (requiredKWp <= 1.2) {
      cfaSubsidy = 30000;
    } else if (requiredKWp < 3) {
      cfaSubsidy = 60000;
    } else {
      cfaSubsidy = 78000; // Capped at ₹78,000 for 3kW to 10kW
    }
  }

  // Step 6: State Top-Up Subsidy
  const stateRule = STATE_SUBSIDY_DATABASE.find(s => s.stateCode === stateCode) || STATE_SUBSIDY_DATABASE[0];
  let stateSubsidy = 0;
  if (customerType === 'Residential') {
    if (requiredKWp <= 1.2) {
      stateSubsidy = stateRule.residentialTopUp1kW;
    } else {
      stateSubsidy = stateRule.residentialTopUp2kWPlus;
    }
  }

  const totalSubsidy = cfaSubsidy + stateSubsidy;
  const netCustomerCost = Math.max(0, estimatedEPCPrice - totalSubsidy);

  // Step 7: Generation & Savings
  const monthlyGenerationUnits = Math.round(requiredKWp * peakSunHours * 30);
  const annualSavings = Math.round(monthlyGenerationUnits * averageTariff * 12);
  const paybackPeriodYears = Number((netCustomerCost / Math.max(1, annualSavings)).toFixed(1));

  // 25-Year Cumulative Savings factoring 0.5% annual degradation
  let lifetimeSavingsGross = 0;
  let currentYearGeneration = monthlyGenerationUnits * 12;
  for (let year = 1; year <= 25; year++) {
    lifetimeSavingsGross += currentYearGeneration * averageTariff;
    currentYearGeneration *= 0.995; // 0.5% degradation
  }
  const lifetime25YearSavings = Math.round(lifetimeSavingsGross - netCustomerCost);

  // Environmental Metrics
  const co2OffsetTonsPerYear = Number((requiredKWp * 1.35).toFixed(2));
  const treesEquivalent = Math.round(co2OffsetTonsPerYear * 45);

  // Commercial 40% Accelerated Depreciation Tax Benefit
  let adFirstYearBenefit = 0;
  if (customerType === 'Commercial' || customerType === 'Industrial') {
    // 40% AD on asset value * 25.17% corporate tax rate
    adFirstYearBenefit = Math.round(estimatedEPCPrice * 0.40 * 0.2517);
  }

  return {
    monthlyBill,
    averageTariff,
    monthlyUnits,
    dailyUnitsNeeded: Number(dailyUnitsNeeded.toFixed(1)),
    requiredKWp,
    minRoofRequiredSqFt,
    estimatedEPCPrice,
    cfaSubsidy,
    stateSubsidy,
    totalSubsidy,
    netCustomerCost,
    annualSavings,
    paybackPeriodYears,
    lifetime25YearSavings,
    co2OffsetTonsPerYear,
    treesEquivalent,
    monthlyGenerationUnits,
    adFirstYearBenefit: adFirstYearBenefit > 0 ? adFirstYearBenefit : undefined
  };
}
