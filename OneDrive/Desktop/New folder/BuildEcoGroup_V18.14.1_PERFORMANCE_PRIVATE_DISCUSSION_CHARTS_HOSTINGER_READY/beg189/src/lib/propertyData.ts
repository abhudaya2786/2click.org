import { 
  PropertyListing, 
  PropertyLead, 
  PMSTicket, 
  RentalPayoutLog,
  CapexCalculatorInputs,
  CapexCalculatorOutputs,
  CapexYearlyProjection
} from '../types/property';

export const INITIAL_PROPERTY_LISTINGS: PropertyListing[] = [
  {
    id: 'prop-beg-001',
    sku: 'BEG-PROP-LKO-OFF-09',
    title: 'Grade-A Coworking & Managed Corporate Office Floor',
    tagline: 'Pre-leased to Fintech Enterprise with 9.2% Net Yield',
    description: 'Fully furnished, high-density Grade-A corporate workspace in Vibhuti Khand IT Corridor. Fitted with 120 ergonomic workstations, 4 executive boardrooms with video-conferencing, breakout cafeteria, biometric access control, and 100% DG power backup.',
    purpose: 'SELL',
    category: 'COMMERCIAL',
    subtype: 'Grade-A Office',
    price: 38500000,
    priceDisplay: '₹3.85 Cr',
    pricePerSqFt: 7700,
    monthlyRent: 295000,
    monthlyRentDisplay: '₹2.95 Lakh / mo',
    superBuiltupAreaSqFt: 5000,
    carpetAreaSqFt: 4150,
    furnishing: 'FULLY_FURNISHED',
    floorNumber: 4,
    totalFloors: 12,
    facing: 'NORTH_EAST',
    availableFrom: 'Immediate',
    images: [
      {
        id: 'img-101',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        name: 'Open Workspace',
        categoryTag: 'Interior',
        isCover: true,
      },
      {
        id: 'img-102',
        url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
        name: 'Executive Boardroom',
        categoryTag: 'Interior',
        isCover: false,
      },
      {
        id: 'img-103',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        name: 'Glass Facade Tower',
        categoryTag: 'Exterior',
        isCover: false,
      },
      {
        id: 'img-104',
        url: 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1200&q=80',
        name: 'Site Layout Plan',
        categoryTag: 'Floor Plan',
        isCover: false,
      }
    ],
    videoTourUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    virtualTour360Url: 'https://my.matterport.com/show/?m=example-beg-tour',
    location: {
      lat: 26.8724,
      lng: 80.9998,
      houseOrPlotNo: 'Tower-B, 4th Floor, Cyber Heights',
      street: 'TCG 2/2, Vibhuti Khand',
      landmark: 'Opposite High Court Gate No. 3',
      locality: 'Gomti Nagar',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226010',
      microMarketTags: ['IT Park Corridor', 'Metro Connected', 'Near High Court', '4-Side Open']
    },
    amenities: {
      powerBackup247: true,
      gatedSecurity: true,
      waterSupply247: true,
      passengerGoodsLift: true,
      reservedParking: true,
      solarRooftopEquipped: true,
      waterRecyclingETP: true,
      cctvSurveillance: true,
      fireFightingSystem: true,
      evChargingStation: true,
      clubhouseGym: true
    },
    legal: {
      isReraRegistered: true,
      reraNumber: 'UPRERAAGT10928/2023',
      isFreeholdClearTitle: true,
      isEncumbranceFree: true,
      zoningClassification: 'COMMERCIAL',
      farFsiPermissible: '2.5 FSI'
    },
    rentalYieldPct: 9.2,
    expectedRoi5YrPct: 15.6,
    ownerId: 'usr-owner-01',
    ownerName: 'Vikas Singhal (NRI Investor)',
    ownerPhone: '+91 98390 12345',
    isNriRemoteOwner: true,
    isPmsManaged: true,
    status: 'ACTIVE',
    viewsCount: 1420,
    leadsCount: 28,
    publishedAt: '2026-07-15',
    updatedAt: '2026-08-28'
  },
  {
    id: 'prop-beg-002',
    sku: 'BEG-PROP-NOI-VIL-14',
    title: 'Biophilic 4BHK Eco-Smart Luxury Villa with Solar Rooftop',
    tagline: 'Net-Zero Energy Certified with Private Plunge Pool & Zen Garden',
    description: 'Ultra-luxury bioclimatic villa designed with rammed-earth accents, double-glazed low-E fenestrations, 8.5 kWp on-grid solar system, rainwater harvesting aquifer recharge, and smart home automation. Situated in a secured, landscaped gated golf enclave.',
    purpose: 'SELL',
    category: 'RESIDENTIAL',
    subtype: 'Luxury Villa',
    price: 49500000,
    priceDisplay: '₹4.95 Cr',
    pricePerSqFt: 11000,
    superBuiltupAreaSqFt: 4500,
    carpetAreaSqFt: 3800,
    plotAreaSqYards: 350,
    bedrooms: 4,
    bathrooms: 5,
    balconies: 3,
    furnishing: 'FULLY_FURNISHED',
    floorNumber: 0,
    totalFloors: 2,
    facing: 'NORTH_EAST',
    availableFrom: 'Immediate',
    images: [
      {
        id: 'img-201',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        name: 'Villa Facade & Lawn',
        categoryTag: 'Exterior',
        isCover: true,
      },
      {
        id: 'img-202',
        url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
        name: 'Double Height Living Room',
        categoryTag: 'Living Room',
        isCover: false,
      },
      {
        id: 'img-203',
        url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        name: 'Master Suite with Balcony',
        categoryTag: 'Master Bedroom',
        isCover: false,
      },
      {
        id: 'img-204',
        url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
        name: 'Solar Rooftop & Pergola',
        categoryTag: 'Drone View',
        isCover: false,
      }
    ],
    videoTourUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    location: {
      lat: 28.5355,
      lng: 77.3910,
      houseOrPlotNo: 'Villa #18, The Meadows',
      street: 'Expressway Sector 128',
      landmark: 'Near Jaypee Greens Golf Course',
      locality: 'Noida Expressway',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201304',
      microMarketTags: ['Expressway Facing', 'Golf Course View', 'Gated Luxury Township', 'EV Ready']
    },
    amenities: {
      powerBackup247: true,
      gatedSecurity: true,
      waterSupply247: true,
      passengerGoodsLift: false,
      reservedParking: true,
      solarRooftopEquipped: true,
      waterRecyclingETP: true,
      cctvSurveillance: true,
      fireFightingSystem: true,
      evChargingStation: true,
      clubhouseGym: true
    },
    legal: {
      isReraRegistered: true,
      reraNumber: 'UPRERAPRJ88219/NOIDA',
      isFreeholdClearTitle: true,
      isEncumbranceFree: true,
      zoningClassification: 'RESIDENTIAL',
      farFsiPermissible: '1.75 FSI'
    },
    rentalYieldPct: 5.8,
    expectedRoi5YrPct: 18.2,
    ownerId: 'usr-owner-02',
    ownerName: 'Col. Rajeshwar Singh (Retd.)',
    ownerPhone: '+91 99110 54321',
    isNriRemoteOwner: false,
    isPmsManaged: false,
    status: 'ACTIVE',
    viewsCount: 2310,
    leadsCount: 42,
    publishedAt: '2026-08-01',
    updatedAt: '2026-08-30'
  },
  {
    id: 'prop-beg-003',
    sku: 'BEG-PROP-GKP-JV-03',
    title: '2.5-Acre Prime National Highway Land for Commercial JV',
    tagline: 'Ideal for Logistics Park, Drive-Through Retail, or Hospital Campus',
    description: 'Clear title, non-agricultural (143 converted) commercial highway land parcel on Gorakhpur–Varanasi 4-lane corridor with 220 feet frontage. Landowner seeking joint venture partnership with developer or long-term lease with profit sharing.',
    purpose: 'JV',
    category: 'LAND_PLOT',
    subtype: 'Commercial Land / Highway Plot',
    price: 75000000,
    priceDisplay: '₹7.50 Cr Land Valuation',
    plotAreaSqYards: 12100,
    superBuiltupAreaSqFt: 108900,
    furnishing: 'BARE_SHELL',
    availableFrom: 'Immediate',
    images: [
      {
        id: 'img-301',
        url: 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1200&q=80',
        name: 'Aerial Drone Survey',
        categoryTag: 'Drone View',
        isCover: true,
      },
      {
        id: 'img-302',
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
        name: 'Highway Frontage & Access',
        categoryTag: 'Exterior',
        isCover: false,
      },
      {
        id: 'img-303',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        name: 'GIS Cadastral Overlay',
        categoryTag: 'Site Map',
        isCover: false,
      }
    ],
    location: {
      lat: 26.7606,
      lng: 83.3732,
      houseOrPlotNo: 'Khasra No. 142/1 & 142/2',
      street: 'NH-27 Four-Lane Bypass Corridor',
      landmark: 'Near AIIMS Gorakhpur & Transport Nagar',
      locality: 'Nausarh Industrial Belt',
      city: 'Gorakhpur',
      state: 'Uttar Pradesh',
      pincode: '273016',
      microMarketTags: ['220 Ft Highway Frontage', 'Section 143 Converted', 'Near AIIMS', 'Logistics Hub']
    },
    amenities: {
      powerBackup247: false,
      gatedSecurity: true,
      waterSupply247: true,
      passengerGoodsLift: false,
      reservedParking: true,
      solarRooftopEquipped: false,
      waterRecyclingETP: false,
      cctvSurveillance: true,
      fireFightingSystem: false,
      evChargingStation: false
    },
    legal: {
      isReraRegistered: false,
      isFreeholdClearTitle: true,
      isEncumbranceFree: true,
      zoningClassification: 'COMMERCIAL',
      farFsiPermissible: '2.25 FSI'
    },
    rentalYieldPct: 11.5,
    expectedRoi5YrPct: 24.0,
    fitoutCapexRequired: 15000000,
    ownerId: 'usr-owner-03',
    ownerName: 'Shrinet Agritech & Land Holdings',
    ownerPhone: '+91 70072 54932',
    isNriRemoteOwner: false,
    isPmsManaged: false,
    status: 'ACTIVE',
    viewsCount: 3100,
    leadsCount: 64,
    publishedAt: '2026-06-20',
    updatedAt: '2026-08-31'
  },
  {
    id: 'prop-beg-004',
    sku: 'BEG-PROP-LKO-PMS-04',
    title: 'NRI-Managed 3BHK Parkview Apartment in Shalimar Grand',
    tagline: 'Full PMS Protection: Guaranteed Rent, Tenant Screening & Digital Invoicing',
    description: 'Fully furnished luxury 3BHK with designer Italian modular kitchen, VRV air conditioning in all rooms, wooden flooring in master suite, automated digital keyless lock, and expansive balcony overlooking the Gomti riverfront park. Managed end-to-end by BuildEcoGroup PMS.',
    purpose: 'RENT',
    category: 'RESIDENTIAL',
    subtype: 'Apartment / Flat',
    monthlyRent: 48000,
    monthlyRentDisplay: '₹48,000 / mo',
    maintenanceDeposit: 96000,
    superBuiltupAreaSqFt: 2150,
    carpetAreaSqFt: 1720,
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    furnishing: 'FULLY_FURNISHED',
    floorNumber: 9,
    totalFloors: 18,
    facing: 'NORTH',
    availableFrom: 'Available Now',
    images: [
      {
        id: 'img-401',
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        name: 'Modern Living Room',
        categoryTag: 'Living Room',
        isCover: true,
      },
      {
        id: 'img-402',
        url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
        name: 'Italian Modular Kitchen',
        categoryTag: 'Kitchen',
        isCover: false,
      },
      {
        id: 'img-403',
        url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
        name: 'Master Suite Bedroom',
        categoryTag: 'Master Bedroom',
        isCover: false,
      },
      {
        id: 'img-404',
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        name: 'Tower Facade & Landscape',
        categoryTag: 'Exterior',
        isCover: false,
      }
    ],
    videoTourUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    location: {
      lat: 26.8520,
      lng: 80.9750,
      houseOrPlotNo: 'Flat 904, Tower Emerald',
      street: 'Jockey Club Road, Riverfront',
      landmark: 'Near 1090 Crossing & Vivanta Taj',
      locality: 'Gomti Nagar Extension',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226010',
      microMarketTags: ['Riverfront View', 'Gated Society', 'NRI Owner', 'Ready to Move']
    },
    amenities: {
      powerBackup247: true,
      gatedSecurity: true,
      waterSupply247: true,
      passengerGoodsLift: true,
      reservedParking: true,
      solarRooftopEquipped: true,
      waterRecyclingETP: true,
      cctvSurveillance: true,
      fireFightingSystem: true,
      evChargingStation: true,
      clubhouseGym: true
    },
    legal: {
      isReraRegistered: true,
      reraNumber: 'UPRERAPRJ44102/SHALIMAR',
      isFreeholdClearTitle: true,
      isEncumbranceFree: true,
      zoningClassification: 'RESIDENTIAL'
    },
    rentalYieldPct: 6.4,
    expectedRoi5YrPct: 14.0,
    ownerId: 'usr-owner-04',
    ownerName: 'Dr. Ananya & Rohit Verma (San Francisco, USA)',
    ownerPhone: '+1 415 890 1234',
    isNriRemoteOwner: true,
    isPmsManaged: true,
    status: 'ACTIVE',
    viewsCount: 1890,
    leadsCount: 35,
    publishedAt: '2026-08-10',
    updatedAt: '2026-08-31'
  },
  {
    id: 'prop-beg-005',
    sku: 'BEG-PROP-DEL-RET-07',
    title: 'High-Street Corner Retail Showroom with Triple Height Atrium',
    tagline: 'Footfall Hotspot in Central Business District • Pre-Approved for F&B/Apparel',
    description: 'Double-glazed corner retail showroom with massive 45-foot glass frontage on a high-density arterial high-street. Equipped with dedicated 3-phase commercial load, exhaust shaft provision for fine-dining restaurants, and outdoor terrace seating.',
    purpose: 'RENT',
    category: 'COMMERCIAL',
    subtype: 'Retail Shop / Showroom',
    monthlyRent: 185000,
    monthlyRentDisplay: '₹1.85 Lakh / mo',
    maintenanceDeposit: 550000,
    superBuiltupAreaSqFt: 2200,
    carpetAreaSqFt: 1850,
    furnishing: 'SEMI_FURNISHED',
    floorNumber: 0,
    totalFloors: 3,
    facing: 'EAST',
    availableFrom: '15th Sept 2026',
    images: [
      {
        id: 'img-501',
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        name: 'Showroom Glass Frontage',
        categoryTag: 'Exterior',
        isCover: true,
      },
      {
        id: 'img-502',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
        name: 'Interior Showroom Space',
        categoryTag: 'Interior',
        isCover: false,
      }
    ],
    location: {
      lat: 28.6328,
      lng: 77.2197,
      houseOrPlotNo: 'Showroom G-03, Plaza Arcade',
      street: 'Outer Circle, Connaught Place',
      landmark: 'Near Rajiv Chowk Gate No. 7',
      locality: 'Connaught Place',
      city: 'Delhi NCR',
      state: 'Delhi',
      pincode: '110001',
      microMarketTags: ['Central Business District', 'Corner High-Street', 'High Footfall', 'Metro Adjacent']
    },
    amenities: {
      powerBackup247: true,
      gatedSecurity: true,
      waterSupply247: true,
      passengerGoodsLift: true,
      reservedParking: true,
      solarRooftopEquipped: false,
      waterRecyclingETP: false,
      cctvSurveillance: true,
      fireFightingSystem: true,
      evChargingStation: true
    },
    legal: {
      isReraRegistered: true,
      reraNumber: 'DLRERARETAIL9910/CP',
      isFreeholdClearTitle: true,
      isEncumbranceFree: true,
      zoningClassification: 'COMMERCIAL'
    },
    rentalYieldPct: 8.8,
    ownerId: 'usr-owner-05',
    ownerName: 'Manish Malhotra Commercial Trusts',
    ownerPhone: '+91 98100 87654',
    isNriRemoteOwner: false,
    isPmsManaged: true,
    status: 'ACTIVE',
    viewsCount: 2750,
    leadsCount: 51,
    publishedAt: '2026-08-05',
    updatedAt: '2026-08-29'
  }
];

export const INITIAL_PROPERTY_LEADS: PropertyLead[] = [
  {
    id: 'lead-001',
    propertyId: 'prop-beg-001',
    propertyTitle: 'Grade-A Coworking & Managed Corporate Office Floor',
    propertySubtype: 'Grade-A Office',
    leadName: 'Sameer Singhania',
    leadPhone: '+91 98200 44556',
    leadEmail: 'sameer.s@zenithfintech.in',
    isPhoneVerified: true,
    leadType: 'BUYER',
    budgetDisplay: '₹3.5 Cr – ₹4.0 Cr',
    requestedVisitDate: '2026-09-03 (11:30 AM)',
    message: 'We are expanding our Lucknow regional technology center and want to inspect the 4th floor workspace and verify the existing tenant lease agreement.',
    status: 'NEW',
    createdAt: '2026-08-31T14:20:00Z',
  },
  {
    id: 'lead-002',
    propertyId: 'prop-beg-004',
    propertyTitle: 'NRI-Managed 3BHK Parkview Apartment in Shalimar Grand',
    propertySubtype: 'Apartment / Flat',
    leadName: 'Dr. Priya Nambiar',
    leadPhone: '+91 97400 11223',
    leadEmail: 'priya.nambiar@medanta.org',
    isPhoneVerified: true,
    leadType: 'TENANT',
    budgetDisplay: '₹45,000 – ₹50,000 / mo',
    requestedVisitDate: '2026-09-02 (4:00 PM)',
    message: 'Senior consultant joining Medanta hospital next month. Family looking for a 2-year lease. Please confirm if pet-friendly and parking included.',
    status: 'SITE_VISIT_SCHEDULED',
    createdAt: '2026-08-30T10:15:00Z',
    lastResponse: 'Site visit confirmed with building security pass issued.'
  },
  {
    id: 'lead-003',
    propertyId: 'prop-beg-003',
    propertyTitle: '2.5-Acre Prime National Highway Land for Commercial JV',
    propertySubtype: 'Commercial Land',
    leadName: 'Harshvardhan Goenka',
    leadPhone: '+91 98111 99887',
    leadEmail: 'h.goenka@logixwarehouses.com',
    isPhoneVerified: true,
    leadType: 'JV_PARTNER',
    budgetDisplay: '₹12 Cr Capex Partnering',
    requestedVisitDate: '2026-09-05 (10:00 AM)',
    message: 'We develop Grade-A temperature-controlled logistics hubs across East UP. Interested in structured revenue-sharing JV model on this highway frontage plot.',
    status: 'NEGOTIATION',
    createdAt: '2026-08-28T16:45:00Z',
    lastResponse: 'Sent standard JV Escrow Draft & Feasibility Report.'
  },
  {
    id: 'lead-004',
    propertyId: 'prop-beg-002',
    propertyTitle: 'Biophilic 4BHK Eco-Smart Luxury Villa with Solar Rooftop',
    propertySubtype: 'Luxury Villa',
    leadName: 'Amitabh Mukherjee',
    leadPhone: '+91 99200 33445',
    leadEmail: 'amitabh.m@globalcapital.com',
    isPhoneVerified: true,
    leadType: 'BUYER',
    budgetDisplay: '₹4.8 Cr – ₹5.2 Cr',
    requestedVisitDate: '2026-09-04 (03:00 PM)',
    message: 'Looking for a sustainable residence near Noida Expressway. Need confirmation on RERA registration and net-zero solar warranty documents.',
    status: 'CONTACTED',
    createdAt: '2026-08-29T11:00:00Z',
    lastResponse: 'Shared 360 Virtual Tour link and solar generation logs.'
  }
];

export const INITIAL_PMS_TICKETS: PMSTicket[] = [
  {
    id: 'tkt-801',
    propertyId: 'prop-beg-004',
    propertyTitle: 'Shalimar Grand #904',
    unitNumber: 'Tower Emerald #904',
    tenantName: 'Vikramaditya Rao',
    tenantPhone: '+91 94150 99881',
    category: 'HVAC_AC',
    priority: 'HIGH',
    description: 'Master bedroom VRV AC blower unit showing error code E4 (coolant sensor fault). Requires certified technician inspection before weekend.',
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    status: 'VENDOR_ASSIGNED',
    costEstimateINR: 3200,
    assignedVendorName: 'CoolAir HVAC Express Services',
    createdAt: '2026-08-30T16:00:00Z'
  },
  {
    id: 'tkt-802',
    propertyId: 'prop-beg-001',
    propertyTitle: 'Cyber Heights 4th Floor',
    unitNumber: 'Tower-B Unit 401',
    tenantName: 'Zenith FinTech Admin',
    tenantPhone: '+91 98390 77665',
    category: 'ELECTRICAL',
    priority: 'MEDIUM',
    description: 'Routine quarterly maintenance for 120kVA online UPS battery bank & secondary sub-meter calibration.',
    status: 'IN_PROGRESS',
    costEstimateINR: 8500,
    assignedVendorName: 'PowerVolt MEP Specialists',
    createdAt: '2026-08-29T09:30:00Z'
  },
  {
    id: 'tkt-803',
    propertyId: 'prop-beg-004',
    propertyTitle: 'Shalimar Grand #904',
    unitNumber: 'Tower Emerald #904',
    tenantName: 'Vikramaditya Rao',
    tenantPhone: '+91 94150 99881',
    category: 'DEEP_CLEANING',
    priority: 'LOW',
    description: 'Biannual balcony glass exterior pressure washing & silicone seal inspection.',
    status: 'RESOLVED',
    costEstimateINR: 2400,
    assignedVendorName: 'CleanPro Facility Managers',
    createdAt: '2026-08-20T11:00:00Z',
    resolvedAt: '2026-08-22T15:00:00Z'
  }
];

export const INITIAL_RENTAL_PAYOUTS: RentalPayoutLog[] = [
  {
    id: 'pay-aug-2026',
    propertyId: 'prop-beg-004',
    propertyTitle: 'Shalimar Grand #904 (NRI Owner)',
    month: 'August 2026',
    grossRentCollected: 48000,
    pmsCommissionFee: 3840, // 8% PMS management fee
    maintenanceDeduction: 2400, // Ticket 803
    netPayoutToOwner: 41760,
    payoutStatus: 'PROCESSED',
    transactionRef: 'UPI-NEFT-ICICI884920199',
    payoutDate: '2026-08-05'
  },
  {
    id: 'pay-jul-2026',
    propertyId: 'prop-beg-004',
    propertyTitle: 'Shalimar Grand #904 (NRI Owner)',
    month: 'July 2026',
    grossRentCollected: 48000,
    pmsCommissionFee: 3840,
    maintenanceDeduction: 0,
    netPayoutToOwner: 44160,
    payoutStatus: 'PROCESSED',
    transactionRef: 'UPI-NEFT-ICICI773918231',
    payoutDate: '2026-07-05'
  },
  {
    id: 'pay-aug-2026-comm',
    propertyId: 'prop-beg-001',
    propertyTitle: 'Cyber Heights 4th Floor (Commercial)',
    month: 'August 2026',
    grossRentCollected: 295000,
    pmsCommissionFee: 20650, // 7% PMS Fee
    maintenanceDeduction: 8500,
    netPayoutToOwner: 265850,
    payoutStatus: 'PROCESSED',
    transactionRef: 'RTGS-HDFC00019283-99',
    payoutDate: '2026-08-03'
  }
];

/**
 * High-Precision Fit-Out Capex & Yield Calculation Engine
 */
export function calculateCapexBreakEven(inputs: CapexCalculatorInputs): CapexCalculatorOutputs {
  const {
    initialFitoutCapex,
    expectedMonthlyGrossRent,
    expectedOccupancyRatePct,
    landownerRevenueSharePct,
    monthlyOperatingExpenses,
    annualRentEscalationPct = 5
  } = inputs;

  // Occupancy adjusted gross monthly revenue
  const effectiveMonthlyGross = expectedMonthlyGrossRent * (expectedOccupancyRatePct / 100);
  
  // Split between landowner and operator
  const landownerMonthlyShare = effectiveMonthlyGross * (landownerRevenueSharePct / 100);
  const operatorGrossMonthly = effectiveMonthlyGross * ((100 - landownerRevenueSharePct) / 100);
  
  // Operator Net Cashflow after opex
  const operatorMonthlyCashflow = Math.max(0, operatorGrossMonthly - monthlyOperatingExpenses);
  const annualNetOperatorProfit = operatorMonthlyCashflow * 12;

  // Break-even calculation in months
  const breakEvenMonths = operatorMonthlyCashflow > 0 
    ? Math.ceil(initialFitoutCapex / operatorMonthlyCashflow) 
    : 999;
  
  const years = Math.floor(breakEvenMonths / 12);
  const remMonths = breakEvenMonths % 12;
  const breakEvenYearsDisplay = operatorMonthlyCashflow > 0 
    ? `${years > 0 ? `${years} yr ` : ''}${remMonths} mo`
    : 'Negative Cash Flow';

  // Unlevered Annualized ROI %
  const unleveredRoiPct = initialFitoutCapex > 0 
    ? (annualNetOperatorProfit / initialFitoutCapex) * 100 
    : 0;

  // 5-Year Cumulative Projection with escalation
  const projections5Year: CapexYearlyProjection[] = [];
  let cumulative = -initialFitoutCapex;

  for (let yr = 1; yr <= 5; yr++) {
    const escalationFactor = Math.pow(1 + annualRentEscalationPct / 100, yr - 1);
    const yrGross = effectiveMonthlyGross * 12 * escalationFactor;
    const yrLandowner = yrGross * (landownerRevenueSharePct / 100);
    const yrOpex = monthlyOperatingExpenses * 12 * Math.pow(1.03, yr - 1); // 3% inflation on opex
    const yrOperatorNet = yrGross - yrLandowner - yrOpex;
    cumulative += yrOperatorNet;

    projections5Year.push({
      year: yr,
      grossRentCollected: Math.round(yrGross),
      landownerPayout: Math.round(yrLandowner),
      operatingExpenses: Math.round(yrOpex),
      operatorNetCashflow: Math.round(yrOperatorNet),
      cumulativeCashflow: Math.round(cumulative)
    });
  }

  return {
    effectiveMonthlyGross: Math.round(effectiveMonthlyGross),
    landownerMonthlyShare: Math.round(landownerMonthlyShare),
    operatorMonthlyCashflow: Math.round(operatorMonthlyCashflow),
    annualNetOperatorProfit: Math.round(annualNetOperatorProfit),
    breakEvenMonths,
    breakEvenYearsDisplay,
    unleveredRoiPct: parseFloat(unleveredRoiPct.toFixed(1)),
    projections5Year
  };
}
