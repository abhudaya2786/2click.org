export type SolarCustomerType = 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural';
export type RoofType = 'RCC Slab' | 'Tin Shed / Metal Sheet' | 'Ground / Open Plot';
export type FinancialModel = 'CAPEX' | 'OPEX_RESCO' | 'DEBT_LOAN';

export interface SolarSystemTopology {
  id: string;
  categoryName: string;
  capacityRange: string;
  targetSegment: string;
  gridConnection: string;
  keyComponents: string[];
  architectureOverview: string;
  standardsAndCodes: string;
  idealFor: string[];
  bannerBadge: string;
  iconName: string;
  estimatedPricingPerKw: number;
}

export type HardwareCategory = 'MODULE' | 'INVERTER' | 'BATTERY' | 'STRUCTURE_BOS';

export type TechnologyType = 
  | 'TOPCon' 
  | 'Mono PERC' 
  | 'HJT' 
  | 'LFP' 
  | 'NMC' 
  | 'Multi-MPPT String' 
  | 'Hybrid Storage' 
  | 'Microinverter'
  | 'Liquid-Cooled BESS';

export interface SolarProductItem {
  id: string;
  sku?: string;
  name?: string;
  category: HardwareCategory;
  subcategory?: string;
  brandName: string;
  brand?: string;
  modelNumber: string;
  model?: string;
  capacityRating: string;
  capacityValue?: number;
  capacityUnit?: 'Wp' | 'kW' | 'kWh' | 'VA' | string;
  technologyType: string;
  efficiencyPercentage: number;
  temperatureCoefficient?: string;
  bifacialityFactor?: string;
  warrantyYears: number; // Product warranty
  linearWarrantyYears?: number; // Performance warranty (e.g. 25-30 yrs)
  almmApproved: boolean;
  bessCycleLife?: number;
  depthOfDischarge?: string;
  protectionRating?: string;
  mpptChannels?: string;
  keyFeatures: string[];
  datasheetSummary: string;
  datasheetUrl?: string;
  countryOfOrigin: string;
  tier: 'Tier-1 Premium' | 'Tier-1 Standard' | 'Industrial Utility';
  priceEstimate?: string;
  priceDisplay?: string;
  basePrice?: number;
  currency?: string;
  inStock?: boolean;
  leadTimeDays?: number;
  specifications?: Record<string, any>;
  imageUrl?: string;
  status?: 'ACTIVE' | 'ARCHIVED' | 'OUT_OF_STOCK';
}

export type Product = SolarProductItem;

export interface StateSubsidyRule {
  stateCode: string;
  stateName: string;
  discoms: string[];
  residentialTopUp1kW: number;
  residentialTopUp2kWPlus: number;
  netMeteringCapKw: number;
  openAccessMinKw: number;
  specialIncentives: string;
}

export interface SolarCalculationResult {
  monthlyBill: number;
  averageTariff: number;
  monthlyUnits: number;
  dailyUnitsNeeded: number;
  requiredKWp: number;
  minRoofRequiredSqFt: number;
  estimatedEPCPrice: number;
  cfaSubsidy: number;
  stateSubsidy: number;
  totalSubsidy: number;
  netCustomerCost: number;
  annualSavings: number;
  paybackPeriodYears: number;
  lifetime25YearSavings: number;
  co2OffsetTonsPerYear: number;
  treesEquivalent: number;
  monthlyGenerationUnits: number;
  adFirstYearBenefit?: number; // for Commercial
}

export interface LeadSubmissionPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  pincode: string;
  state: string;
  discom?: string;
  customerSegment: SolarCustomerType;
  monthlyBill: number;
  sanctionedLoadKw?: number;
  roofAreaSqFt?: number;
  roofType?: RoofType;
  recommendedCapacityKWp: number;
  estimatedCost: number;
  eligibleSubsidy: number;
  modalSource: 'QUICK_QUOTE' | 'SUBSIDY_CHECKER' | 'CI_RFQ' | 'SITE_SURVEY';
  companyName?: string;
  gstin?: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
  address?: string;
  capexOpexPreference?: string;
}
