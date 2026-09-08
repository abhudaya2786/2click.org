export type ListingPurpose = 'SELL' | 'RENT' | 'PMS' | 'JV';

export type PropertyCategory = 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'LAND_PLOT';

export type PropertySubtype = 
  | 'Apartment / Flat'
  | 'Luxury Villa'
  | 'Independent Floor'
  | 'Penthouse'
  | 'Grade-A Office'
  | 'Retail Shop / Showroom'
  | 'Coworking / Managed Office'
  | 'Commercial SCO Plot'
  | 'Industrial Warehouse'
  | 'Open Industrial Plot'
  | 'Agricultural / Farm Land'
  | 'Commercial Land / Highway Plot';

export type FurnishingStatus = 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED' | 'BARE_SHELL';

export type ImageCategoryTag = 
  | 'Exterior' 
  | 'Interior' 
  | 'Floor Plan' 
  | 'Master Bedroom' 
  | 'Living Room'
  | 'Kitchen' 
  | 'Site Map' 
  | 'Drone View';

export interface PropertyMediaItem {
  id: string;
  url: string;
  name: string;
  categoryTag: ImageCategoryTag;
  isCover: boolean;
  sizeBytes?: number;
}

export interface GeolocationCoords {
  lat: number;
  lng: number;
  houseOrPlotNo: string;
  street: string;
  landmark: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  microMarketTags: string[]; // e.g. ["Near Metro Station", "Highway Facing", "Corner Plot", "IT Corridor"]
}

export interface PropertyAmenities {
  powerBackup247: boolean;
  gatedSecurity: boolean;
  waterSupply247: boolean;
  passengerGoodsLift: boolean;
  reservedParking: boolean;
  solarRooftopEquipped: boolean;
  waterRecyclingETP: boolean;
  cctvSurveillance: boolean;
  fireFightingSystem: boolean;
  evChargingStation: boolean;
  clubhouseGym?: boolean;
}

export interface LegalAndCompliance {
  isReraRegistered: boolean;
  reraNumber?: string;
  isFreeholdClearTitle: boolean;
  isEncumbranceFree: boolean;
  encumbranceDocUrl?: string;
  zoningClassification: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED_USE' | 'INDUSTRIAL' | 'AGRICULTURAL';
  farFsiPermissible?: string;
}

export interface PropertyListing {
  id: string;
  sku: string;
  title: string;
  tagline: string;
  description: string;
  purpose: ListingPurpose;
  category: PropertyCategory;
  subtype: PropertySubtype;
  
  // Pricing & Commercials
  price?: number; // For Sale or JV Land Value in INR
  priceDisplay?: string;
  monthlyRent?: number; // For Rent / Lease in INR
  monthlyRentDisplay?: string;
  maintenanceDeposit?: number; // Security deposit
  pricePerSqFt?: number;
  
  // Dimensions
  superBuiltupAreaSqFt: number;
  carpetAreaSqFt?: number;
  plotAreaSqYards?: number;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  furnishing: FurnishingStatus;
  floorNumber?: number;
  totalFloors?: number;
  facing?: 'NORTH' | 'EAST' | 'NORTH_EAST' | 'SOUTH' | 'WEST' | 'SOUTH_EAST';
  availableFrom: string;
  
  // Media & Tour
  images: PropertyMediaItem[];
  videoTourUrl?: string;
  virtualTour360Url?: string;
  
  // Location & Geo
  location: GeolocationCoords;
  
  // Features & Legal
  amenities: PropertyAmenities;
  legal: LegalAndCompliance;
  
  // Investment & Yield Metrics
  rentalYieldPct?: number; // e.g. 7.4%
  expectedRoi5YrPct?: number; // e.g. 14.8%
  fitoutCapexRequired?: number; // For JV / Coworking
  
  // Owner & Management
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  isNriRemoteOwner: boolean;
  isPmsManaged: boolean;
  
  // Status & Telemetry
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'RENTED_SOLD' | 'DRAFT';
  viewsCount: number;
  leadsCount: number;
  publishedAt: string;
  updatedAt: string;
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'SITE_VISIT_SCHEDULED' | 'NEGOTIATION' | 'CLOSED';
export type LeadType = 'BUYER' | 'TENANT' | 'INVESTOR' | 'JV_PARTNER';

export interface PropertyLead {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertySubtype: string;
  leadName: string;
  leadPhone: string;
  leadEmail?: string;
  isPhoneVerified: boolean;
  leadType: LeadType;
  budgetDisplay: string;
  requestedVisitDate?: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
  lastResponse?: string;
}

export type PMSTicketPriority = 'EMERGENCY' | 'HIGH' | 'MEDIUM' | 'LOW';
export type PMSTicketStatus = 'NEW' | 'OPEN' | 'VENDOR_ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
export type PMSTicketCategory = 
  | 'PLUMBING' 
  | 'ELECTRICAL' 
  | 'HVAC_AC' 
  | 'CARPENTRY' 
  | 'DEEP_CLEANING' 
  | 'PAINTING' 
  | 'PEST_CONTROL'
  | 'SECURITY_LOCK';

export interface PMSTicket {
  id: string;
  propertyId: string;
  propertyTitle: string;
  unitNumber: string;
  tenantName: string;
  tenantPhone: string;
  category: PMSTicketCategory;
  priority: PMSTicketPriority;
  description: string;
  photoUrl?: string;
  status: PMSTicketStatus;
  costEstimateINR: number;
  assignedVendorName?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface RentalPayoutLog {
  id: string;
  propertyId: string;
  propertyTitle: string;
  month: string; // e.g. "August 2026"
  grossRentCollected: number;
  pmsCommissionFee: number;
  maintenanceDeduction: number;
  netPayoutToOwner: number;
  payoutStatus: 'PROCESSED' | 'PENDING' | 'ESCROW_HELD';
  transactionRef: string;
  payoutDate: string;
}

export interface CapexCalculatorInputs {
  initialFitoutCapex: number; // In INR, slider 1L to 50L
  expectedMonthlyGrossRent: number; // In INR, slider 20K to 10L
  expectedOccupancyRatePct: number; // Slider 50% to 100%, default 85%
  landownerRevenueSharePct: number; // Slider 50% to 80%, default 65%
  monthlyOperatingExpenses: number; // In INR
  annualRentEscalationPct: number; // e.g. 5%
}

export interface CapexYearlyProjection {
  year: number;
  grossRentCollected: number;
  landownerPayout: number;
  operatingExpenses: number;
  operatorNetCashflow: number;
  cumulativeCashflow: number;
}

export interface CapexCalculatorOutputs {
  effectiveMonthlyGross: number;
  landownerMonthlyShare: number;
  operatorMonthlyCashflow: number;
  annualNetOperatorProfit: number;
  breakEvenMonths: number;
  breakEvenYearsDisplay: string;
  unleveredRoiPct: number;
  projections5Year: CapexYearlyProjection[];
}
