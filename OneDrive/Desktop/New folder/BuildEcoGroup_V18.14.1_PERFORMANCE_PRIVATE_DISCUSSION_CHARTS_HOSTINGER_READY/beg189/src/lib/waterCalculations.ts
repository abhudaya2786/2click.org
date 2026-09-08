/**
 * WATER TREATMENT & REUSE ENGINEERING CALCULATION ENGINE
 * Covers: STP, ETP (Car Wash), RO, Pressure Filters (DMF/ACF), Sludge, Dosing, Pumps & Gardening
 */

// ==========================================
// 1. TYPE DEFINITIONS & INPUT INTERFACES
// ==========================================

export interface STPInput {
  residents: number;
  lpcd?: number; // Default: 135 L/person/day
  sewageFactor?: number; // Default: 0.80 (80%)
  bodInlet?: number; // Default: 300 mg/L
  bodOutlet?: number; // Default: 10 mg/L
  tssInlet?: number; // Default: 250 mg/L
  tssOutlet?: number; // Default: 20 mg/L
  eqTankHRT?: number; // Default: 8 hours
  aerationTankHRT?: number; // Default: 14 hours
  operatingHours?: number; // Default: 16 hours/day
}

export interface ETPInput {
  carsPerDay: number;
  litersPerCar?: number; // Default: 150 L/car
  recoveryEfficiency?: number; // Default: 0.85 (85%)
  pacDosingPpm?: number; // Default: 80 ppm (mg/L)
  operatingHours?: number; // Default: 10 hours/day
}

export interface ROInput {
  dailyRequirementKL: number;
  recoveryPercentage?: number; // Default: 65% (0.65)
  operatingHours?: number; // Default: 10 hours/day
  operatingPressureBar?: number; // Default: 14 bar
  pumpEfficiency?: number; // Default: 0.70 (70%)
}

export interface FilterVesselInput {
  flowRateM3Hr: number;
  filtrationVelocity?: number; // Default: 12 m/hr (Standard for DMF/ACF: 10-15 m/hr)
}

export interface GardeningInput {
  treatedWaterAvailableLiters: number;
  lawnWaterDemandPerSqM?: number; // Default: 5 L/sq.m/day
  waterCostPerKL?: number; // Default: ₹70 / kL (Tanker / municipal rate)
}

export interface ChemicalDosingInput {
  flowKL: number;
  dosingPpm: number;
  solutionStrengthPercent: number; // e.g., 10% Sodium Hypochlorite
}

export interface PumpPowerInput {
  flowRateM3Hr: number;
  headMeters: number;
  pumpEfficiency?: number; // Default: 0.65 (65%)
}

// ==========================================
// 2. CORE CALCULATION FUNCTIONS
// ==========================================

/**
 * 1. STP (Sewage Treatment Plant) Sizing
 */
export function calculateSTP(input: STPInput) {
  const lpcd = input.lpcd ?? 135;
  const factor = input.sewageFactor ?? 0.8;
  const eqHRT = input.eqTankHRT ?? 8;
  const aerationHRT = input.aerationTankHRT ?? 14;
  const opHours = input.operatingHours ?? 16;
  const bodIn = input.bodInlet ?? 300;
  const bodOut = input.bodOutlet ?? 10;
  const tssIn = input.tssInlet ?? 250;
  const tssOut = input.tssOutlet ?? 20;

  // Flow Calculations
  const dailyWaterConsumptionLiters = input.residents * lpcd;
  const dailySewageLiters = dailyWaterConsumptionLiters * factor;
  const dailySewageKLD = Number((dailySewageLiters / 1000).toFixed(2));
  const hourlyFlowM3Hr = Number((dailySewageKLD / opHours).toFixed(2));

  // Tank Sizing (m3)
  const equalizationTankVolumeM3 = Number(((dailySewageKLD / 24) * eqHRT).toFixed(2));
  const aerationTankVolumeM3 = Number(((dailySewageKLD / 24) * aerationHRT).toFixed(2));

  // Air & Blower Requirement
  const dailyBodLoadKg = Number(((dailySewageKLD * (bodIn - bodOut)) / 1000).toFixed(2));
  // Standard rule: 1.5 kg O2 per kg BOD, Transfer Efficiency ~ 8%, Safety Factor 1.2
  const airRequiredM3Hr = Number((dailyBodLoadKg * 45).toFixed(2)); 
  const blowerCFM = Number((airRequiredM3Hr * 0.5886).toFixed(2));

  // Daily Sludge Output (Dry kg/day)
  const drySludgeKgDay = Number(
    ((dailySewageKLD * (tssIn - tssOut) + dailyBodLoadKg * 0.5) / 1000 * 1000).toFixed(2)
  );

  return {
    dailyWaterConsumptionLiters,
    dailySewageLiters,
    dailySewageKLD,
    hourlyFlowM3Hr,
    equalizationTankVolumeM3,
    aerationTankVolumeM3,
    dailyBodLoadKg,
    airRequiredM3Hr,
    blowerCFM,
    drySludgeKgDay,
  };
}

/**
 * 2. ETP (Effluent Treatment Plant - Vehicle Wash / Industrial) Sizing
 */
export function calculateETP(input: ETPInput) {
  const litersPerCar = input.litersPerCar ?? 150;
  const recovery = input.recoveryEfficiency ?? 0.85;
  const pacPpm = input.pacDosingPpm ?? 80;
  const opHours = input.operatingHours ?? 10;

  const dailyEffluentLiters = input.carsPerDay * litersPerCar;
  const dailyEffluentKLD = Number((dailyEffluentLiters / 1000).toFixed(2));
  const hourlyFlowM3Hr = Number((dailyEffluentKLD / opHours).toFixed(2));

  // Recycled Water Available
  const recycledWaterLiters = Number((dailyEffluentLiters * recovery).toFixed(0));
  const rejectWaterLiters = dailyEffluentLiters - recycledWaterLiters;

  // Coagulant (PAC/Alum) Daily Requirement (kg/day)
  const dailyPacKg = Number(((dailyEffluentKLD * pacPpm) / 1000).toFixed(3));

  return {
    dailyEffluentKLD,
    dailyEffluentLiters,
    hourlyFlowM3Hr,
    recycledWaterLiters,
    rejectWaterLiters,
    dailyPacKg,
  };
}

/**
 * 3. RO (Reverse Osmosis) Sizing
 */
export function calculateRO(input: ROInput) {
  const recovery = input.recoveryPercentage ?? 0.65;
  const opHours = input.operatingHours ?? 10;
  const pressureBar = input.operatingPressureBar ?? 14;
  const efficiency = input.pumpEfficiency ?? 0.7;

  // Permeate (Treated Output) needed
  const permeateDailyLiters = input.dailyRequirementKL * 1000;
  const feedDailyLiters = permeateDailyLiters / recovery;
  const rejectDailyLiters = feedDailyLiters - permeateDailyLiters;

  // Sizing in LPH (Liters Per Hour)
  const plantCapacityLPH = Number((permeateDailyLiters / opHours).toFixed(0));
  const feedFlowM3Hr = Number(((feedDailyLiters / 1000) / opHours).toFixed(2));
  const permeateFlowM3Hr = Number(((permeateDailyLiters / 1000) / opHours).toFixed(2));

  // High-Pressure Pump Power: P(kW) = (Q (m3/hr) * P (bar) * 10) / (36 * efficiency)
  const hpPumpPowerKW = Number(
    ((feedFlowM3Hr * pressureBar * 10) / (36 * efficiency * 10)).toFixed(2)
  );

  return {
    plantCapacityLPH,
    feedDailyKL: Number((feedDailyLiters / 1000).toFixed(2)),
    permeateDailyKL: input.dailyRequirementKL,
    rejectDailyKL: Number((rejectDailyLiters / 1000).toFixed(2)),
    feedFlowM3Hr,
    permeateFlowM3Hr,
    hpPumpPowerKW,
    hpPumpHP: Number((hpPumpPowerKW * 1.341).toFixed(2)),
  };
}

/**
 * 4. Dual Media (DMF) & Carbon Filter (ACF) Vessel Sizing
 */
export function calculateFilterVessel(input: FilterVesselInput) {
  const velocity = input.filtrationVelocity ?? 12; // m/hr

  // Cross-sectional Area A = Q / V
  const vesselAreaM2 = Number((input.flowRateM3Hr / velocity).toFixed(3));
  
  // Diameter D = sqrt((4 * A) / pi)
  const vesselDiameterMeters = Number(Math.sqrt((4 * vesselAreaM2) / Math.PI).toFixed(2));
  const vesselDiameterMM = Math.round(vesselDiameterMeters * 1000);

  // Standard Commercial FRP Vessel Matching (Closest standard diameter in inches)
  const diameterInches = Math.ceil(vesselDiameterMM / 25.4);

  // Recommended Standard Model Name
  let standardModel = `${diameterInches}" × 65" FRP`;
  if (diameterInches <= 13) standardModel = '1354 (13" × 54") FRP';
  else if (diameterInches <= 16) standardModel = '1665 (16" × 65") FRP';
  else if (diameterInches <= 18) standardModel = '1865 (18" × 65") FRP';
  else if (diameterInches <= 24) standardModel = '2472 (24" × 72") FRP';
  else if (diameterInches <= 30) standardModel = '3072 (30" × 72") FRP';
  else if (diameterInches <= 36) standardModel = '3672 (36" × 72") FRP';
  else standardModel = `${diameterInches}" × 72" MSRL / Custom`;

  return {
    vesselAreaM2,
    vesselDiameterMeters,
    vesselDiameterMM,
    recommendedDiameterInches: diameterInches,
    standardModel,
  };
}

/**
 * 5. Smart Gardening & Landscape Irrigation Sizing
 */
export function calculateGardening(input: GardeningInput) {
  const waterDemandPerSqM = input.lawnWaterDemandPerSqM ?? 5; // 5 L/sq.m
  const waterRate = input.waterCostPerKL ?? 70; // INR per kL

  // Max Area Irrigable (sq.m & sq.ft)
  const maxLawnAreaSqM = Math.floor(input.treatedWaterAvailableLiters / waterDemandPerSqM);
  const maxLawnAreaSqFt = Math.floor(maxLawnAreaSqM * 10.7639);

  // Financial Savings from Recycled Water Usage
  const dailyKLSaved = input.treatedWaterAvailableLiters / 1000;
  const dailyMoneySavedINR = Number((dailyKLSaved * waterRate).toFixed(2));
  const monthlyMoneySavedINR = Number((dailyMoneySavedINR * 30).toFixed(2));
  const annualMoneySavedINR = Number((dailyMoneySavedINR * 365).toFixed(2));

  return {
    maxLawnAreaSqM,
    maxLawnAreaSqFt,
    dailyKLSaved,
    dailyMoneySavedINR,
    monthlyMoneySavedINR,
    annualMoneySavedINR,
  };
}

/**
 * 6. Chemical Dosing Calculation (Chlorine / Coagulant / Antiscalant)
 */
export function calculateChemicalDosing(input: ChemicalDosingInput) {
  // Volume of commercial liquid chemical needed (Liters/day)
  // Formula: (Flow in kL * Dosing PPM) / (Strength % * 10,000)
  const dailyChemicalLiters = Number(
    ((input.flowKL * input.dosingPpm) / (input.solutionStrengthPercent * 10000) * 1000).toFixed(3)
  );

  return {
    dailyChemicalLiters,
    hourlyDosingMLHr: Number(((dailyChemicalLiters / 24) * 1000).toFixed(1)),
  };
}

/**
 * 7. Pump Motor Sizing (Feed / Filter / Transfer Pumps)
 */
export function calculatePumpPower(input: PumpPowerInput) {
  const efficiency = input.pumpEfficiency ?? 0.65;
  // Formula: (Flow (m3/hr) * Head (m) * 9.81) / (3600 * Efficiency)
  const hydraulicPowerKW = Number(
    ((input.flowRateM3Hr * input.headMeters * 9.81) / (3600 * efficiency)).toFixed(2)
  );
  const motorHP = Number((hydraulicPowerKW * 1.341).toFixed(2));

  return {
    powerKW: hydraulicPowerKW,
    powerHP: motorHP,
    recommendedMotorHP: Math.ceil(motorHP * 2) / 2, // Rounded up to nearest 0.5 HP
  };
}
