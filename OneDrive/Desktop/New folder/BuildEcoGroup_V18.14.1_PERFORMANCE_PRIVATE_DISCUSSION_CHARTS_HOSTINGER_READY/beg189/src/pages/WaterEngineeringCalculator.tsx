import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Droplets,
  Factory,
  Cpu,
  Leaf,
  Settings2,
  FileSpreadsheet,
  Download,
  Info,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Gauge,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sliders,
  Check,
  Share2,
  Copy,
  Printer,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export interface WaterCalculatorProps {
  onRequestBOQ?: (summary: string) => void;
  onRequestConsultation?: (spec: string) => void;
}

export const WaterEngineeringCalculator: React.FC<WaterCalculatorProps> = ({
  onRequestBOQ,
  onRequestConsultation
}) => {
  // Active Tab Mode
  const [activeTab, setActiveTab] = useState<'STP' | 'ETP' | 'RO' | 'GARDEN' | 'AUX' | 'FORMULAS'>('STP');
  const [showAdvancedParams, setShowAdvancedParams] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // --- 1. STP PARAMETERS ---
  const [stpPersons, setStpPersons] = useState<number>(150);
  const [stpLPCD, setStpLPCD] = useState<number>(135); // Standard 135 Liters per capita per day
  const [stpSewageFactor, setStpSewageFactor] = useState<number>(0.80); // 80% converted to sewage
  const [stpHrtEqHours, setStpHrtEqHours] = useState<number>(7); // Equalization retention time
  const [stpBODin, setStpBODin] = useState<number>(300); // mg/L raw BOD
  const [stpBODout, setStpBODout] = useState<number>(10); // mg/L treated BOD (CPCB Norm < 10)
  const [stpTSSin, setStpTSSin] = useState<number>(250); // mg/L raw TSS
  const [stpTSSout, setStpTSSout] = useState<number>(10); // mg/L treated TSS
  const [stpHrtAerationHours, setStpHrtAerationHours] = useState<number>(14); // MBBR HRT
  const [stpOxygenTransferEff, setStpOxygenTransferEff] = useState<number>(0.08); // 8% standard OTE

  // --- 2. ETP PARAMETERS (Car Wash / Industrial) ---
  const [etpCarsPerDay, setEtpCarsPerDay] = useState<number>(60);
  const [etpLitersPerWash, setEtpLitersPerWash] = useState<number>(150); // 150 L/car
  const [etpRecoveryFactor, setEtpRecoveryFactor] = useState<number>(0.90); // 90% effluent collection
  const [etpPacPPM, setEtpPacPPM] = useState<number>(100); // 100 mg/L PAC coagulant
  const [etpPolyPPM, setEtpPolyPPM] = useState<number>(2.5); // 2.5 mg/L Poly flocculant
  const [etpRecyclePercent, setEtpRecyclePercent] = useState<number>(80); // 80% recycled for washing

  // --- 3. RO PARAMETERS ---
  const [roCapacityKLD, setRoCapacityKLD] = useState<number>(15);
  const [roOperatingHours, setRoOperatingHours] = useState<number>(10);
  const [roRecoveryPercent, setRoRecoveryPercent] = useState<number>(65); // 65% permeate recovery
  const [roOperatingPressureBar, setRoOperatingPressureBar] = useState<number>(14); // 14 bar for BWRO
  const [roPumpEfficiency, setRoPumpEfficiency] = useState<number>(0.70); // 70% efficiency

  // --- 4. SMART GARDENING PARAMETERS ---
  const [gardenLawnAreaSqM, setGardenLawnAreaSqM] = useState<number>(1200);
  const [gardenEvapoRateLPerSqM, setGardenEvapoRateLPerSqM] = useState<number>(5.0); // 5 L/sq.m/day
  const [gardenDripperRatingLPH, setGardenDripperRatingLPH] = useState<number>(4); // 4 LPH drippers
  const [gardenDrippersCount, setGardenDrippersCount] = useState<number>(300);

  // --- 5. AUXILIARY / FILTER / PUMP PARAMETERS ---
  const [filterVelocityMPerHr, setFilterVelocityMPerHr] = useState<number>(12); // 10-15 m/hr
  const [filterOperatingHours, setFilterOperatingHours] = useState<number>(12);
  const [pumpHeadMeters, setPumpHeadMeters] = useState<number>(25);
  const [pumpEfficiency, setPumpEfficiency] = useState<number>(0.65);
  const [hypoDosingPPM, setHypoDosingPPM] = useState<number>(4); // 4 mg/L chlorine
  const [hypoStrengthPercent, setHypoStrengthPercent] = useState<number>(10); // 10% sodium hypochlorite

  // ==========================================
  // ENGINEERING CALCULATION ENGINES
  // ==========================================

  // A. STP Calculations
  const stpCalc = useMemo(() => {
    const dailyRawWater = stpPersons * stpLPCD; // Liters
    const dailySewageLiters = dailyRawWater * stpSewageFactor; // Liters
    const kld = dailySewageLiters / 1000; // kL/day
    const hourlyFlow = dailySewageLiters / 24; // L/hr
    const eqTankVolM3 = (dailySewageLiters / 24 / 1000) * stpHrtEqHours; // m3
    const aerationTankVolM3 = (dailySewageLiters / 24 / 1000) * stpHrtAerationHours; // m3
    
    // BOD load & Oxygen/Air Flow
    const bodRemovedKgPerDay = (dailySewageLiters * (stpBODin - stpBODout)) / 1000000; // kg BOD/day
    const oxygenReqKgPerDay = bodRemovedKgPerDay * 1.5; // 1.5 kg O2/kg BOD
    // Air flow in m3/hr = OxygenReq / (OTE * 0.23 * 1.2 * 24)
    const airFlowM3PerHr = oxygenReqKgPerDay / (stpOxygenTransferEff * 0.23 * 1.2 * 24);
    const airFlowCFM = airFlowM3PerHr * 0.5886;

    // Recycled water (approx 85% recovered after tertiary filtration)
    const treatedWaterAvailableLiters = dailySewageLiters * 0.85;
    const lawnCoveredSqM = treatedWaterAvailableLiters / gardenEvapoRateLPerSqM;

    return {
      dailyRawWater,
      dailySewageLiters,
      kld: Number(kld.toFixed(1)),
      hourlyFlowLPH: Math.round(hourlyFlow),
      eqTankVolM3: Number(eqTankVolM3.toFixed(2)),
      eqTankVolLiters: Math.round(eqTankVolM3 * 1000),
      aerationTankVolM3: Number(aerationTankVolM3.toFixed(2)),
      bodRemovedKgPerDay: Number(bodRemovedKgPerDay.toFixed(2)),
      oxygenReqKgPerDay: Number(oxygenReqKgPerDay.toFixed(2)),
      airFlowM3PerHr: Math.round(airFlowM3PerHr),
      airFlowCFM: Math.round(airFlowCFM),
      treatedWaterAvailableLiters: Math.round(treatedWaterAvailableLiters),
      lawnCoveredSqM: Math.round(lawnCoveredSqM)
    };
  }, [stpPersons, stpLPCD, stpSewageFactor, stpHrtEqHours, stpBODin, stpBODout, stpHrtAerationHours, stpOxygenTransferEff, gardenEvapoRateLPerSqM]);

  // B. ETP Calculations
  const etpCalc = useMemo(() => {
    const dailyRawEffluentLiters = etpCarsPerDay * etpLitersPerWash * etpRecoveryFactor;
    const kld = dailyRawEffluentLiters / 1000;
    const pacDosingKgPerDay = (kld * etpPacPPM) / 1000;
    const polyDosingKgPerDay = (kld * etpPolyPPM) / 1000;
    const recycledWaterLiters = dailyRawEffluentLiters * (etpRecyclePercent / 100);
    const rejectWaterLiters = dailyRawEffluentLiters - recycledWaterLiters;
    const lawnCoveredSqM = (recycledWaterLiters * 0.3) / gardenEvapoRateLPerSqM; // 30% surplus for landscaping

    return {
      dailyRawEffluentLiters: Math.round(dailyRawEffluentLiters),
      kld: Number(kld.toFixed(1)),
      pacDosingKgPerDay: Number(pacDosingKgPerDay.toFixed(3)),
      polyDosingKgPerDay: Number(polyDosingKgPerDay.toFixed(3)),
      recycledWaterLiters: Math.round(recycledWaterLiters),
      rejectWaterLiters: Math.round(rejectWaterLiters),
      lawnCoveredSqM: Math.round(lawnCoveredSqM)
    };
  }, [etpCarsPerDay, etpLitersPerWash, etpRecoveryFactor, etpPacPPM, etpPolyPPM, etpRecyclePercent, gardenEvapoRateLPerSqM]);

  // C. RO Calculations
  const roCalc = useMemo(() => {
    const feedFlowLPH = (roCapacityKLD * 1000) / roOperatingHours;
    const feedFlowM3PerHr = feedFlowLPH / 1000;
    const permeateFlowLPH = feedFlowLPH * (roRecoveryPercent / 100);
    const rejectFlowLPH = feedFlowLPH - permeateFlowLPH;
    const dailyPermeateLiters = roCapacityKLD * 1000 * (roRecoveryPercent / 100);
    const dailyRejectLiters = roCapacityKLD * 1000 - dailyPermeateLiters;

    // High Pressure Pump Power: P(kW) = (Q * P * 10) / (36 * eta)
    const pumpPowerKw = (feedFlowM3PerHr * roOperatingPressureBar * 10) / (36 * roPumpEfficiency);
    const pumpPowerHP = pumpPowerKw * 1.34102;

    return {
      feedFlowLPH: Math.round(feedFlowLPH),
      feedFlowM3PerHr: Number(feedFlowM3PerHr.toFixed(2)),
      permeateFlowLPH: Math.round(permeateFlowLPH),
      rejectFlowLPH: Math.round(rejectFlowLPH),
      dailyPermeateLiters: Math.round(dailyPermeateLiters),
      dailyRejectLiters: Math.round(dailyRejectLiters),
      pumpPowerKw: Number(pumpPowerKw.toFixed(2)),
      pumpPowerHP: Number(pumpPowerHP.toFixed(2))
    };
  }, [roCapacityKLD, roOperatingHours, roRecoveryPercent, roOperatingPressureBar, roPumpEfficiency]);

  // D. Smart Gardening & Irrigation Calculations
  const gardenCalc = useMemo(() => {
    const dailyWaterRequiredLiters = gardenLawnAreaSqM * gardenEvapoRateLPerSqM;
    const irrigationZoneDischargeLPH = gardenDrippersCount * gardenDripperRatingLPH;
    const irrigationRunTimeHours = irrigationZoneDischargeLPH > 0 ? dailyWaterRequiredLiters / irrigationZoneDischargeLPH : 0;
    
    // Coverage comparison from active STP vs required
    const stpCoveragePercent = dailyWaterRequiredLiters > 0 ? (stpCalc.treatedWaterAvailableLiters / dailyWaterRequiredLiters) * 100 : 0;

    return {
      dailyWaterRequiredLiters: Math.round(dailyWaterRequiredLiters),
      irrigationZoneDischargeLPH: Math.round(irrigationZoneDischargeLPH),
      irrigationRunTimeHours: Number(irrigationRunTimeHours.toFixed(2)),
      irrigationRunTimeMinutes: Math.round(irrigationRunTimeHours * 60),
      stpCoveragePercent: Number(stpCoveragePercent.toFixed(1))
    };
  }, [gardenLawnAreaSqM, gardenEvapoRateLPerSqM, gardenDripperRatingLPH, gardenDrippersCount, stpCalc.treatedWaterAvailableLiters]);

  // E. Auxiliary Equipment Sizing Calculations (DMF/ACF, Sludge Press, Pump kW, Chlorine)
  const auxCalc = useMemo(() => {
    // 1. Filter Flow & Vessel Diameter (DMF/ACF)
    const plantKldForFilter = activeTab === 'ETP' ? etpCalc.kld : stpCalc.kld;
    const filterFlowM3PerHr = (plantKldForFilter || 10) / filterOperatingHours;
    const crossSectionAreaSqM = filterFlowM3PerHr / filterVelocityMPerHr;
    const vesselDiameterMeters = Math.sqrt((4 * crossSectionAreaSqM) / Math.PI);
    const vesselDiameterMm = vesselDiameterMeters * 1000;
    const vesselDiameterInches = vesselDiameterMm / 25.4;

    // Standard vessel sizing recommendation
    let recommendedVessel = '1354 (13" × 54")';
    if (vesselDiameterInches > 40) recommendedVessel = '4872 (48" × 72") MSRL';
    else if (vesselDiameterInches > 32) recommendedVessel = '3672 (36" × 72") FRP';
    else if (vesselDiameterInches > 26) recommendedVessel = '3072 (30" × 72") FRP';
    else if (vesselDiameterInches > 20) recommendedVessel = '2472 (24" × 72") FRP';
    else if (vesselDiameterInches > 15) recommendedVessel = '1865 (18" × 65") FRP';
    else if (vesselDiameterInches > 13) recommendedVessel = '1665 (16" × 65") FRP';

    // 2. Sludge Generation & Filter Press
    const drySludgeKgPerDay = plantKldForFilter * (((stpTSSin - stpTSSout) + 0.5 * (stpBODin - stpBODout)) / 1000);
    const filterPressVolLiters = drySludgeKgPerDay / (1.05 * (1 - 0.75));
    const pressChambersCount = Math.max(10, Math.ceil(filterPressVolLiters / 8)); // ~8L per chamber

    // 3. Pumping Power
    const pumpPowerKw = (filterFlowM3PerHr * pumpHeadMeters * 9.81) / (3600 * pumpEfficiency);
    const pumpPowerHP = pumpPowerKw * 1.34102;

    // 4. Chlorine / Hypo Dosing (L/day)
    const hypoDosingLitersPerDay = (plantKldForFilter * hypoDosingPPM) / ((hypoStrengthPercent / 100) * 1000000) * 1000;

    return {
      plantKld: plantKldForFilter,
      filterFlowM3PerHr: Number(filterFlowM3PerHr.toFixed(2)),
      crossSectionAreaSqM: Number(crossSectionAreaSqM.toFixed(3)),
      vesselDiameterMm: Math.round(vesselDiameterMm),
      vesselDiameterInches: Number(vesselDiameterInches.toFixed(1)),
      recommendedVessel,
      drySludgeKgPerDay: Number(drySludgeKgPerDay.toFixed(2)),
      filterPressVolLiters: Number(filterPressVolLiters.toFixed(1)),
      pressChambersCount,
      pumpPowerKw: Number(pumpPowerKw.toFixed(2)),
      pumpPowerHP: Number(pumpPowerHP.toFixed(2)),
      hypoDosingLitersPerDay: Number(hypoDosingLitersPerDay.toFixed(2))
    };
  }, [activeTab, etpCalc.kld, stpCalc.kld, filterOperatingHours, filterVelocityMPerHr, stpTSSin, stpTSSout, stpBODin, stpBODout, pumpHeadMeters, pumpEfficiency, hypoDosingPPM, hypoStrengthPercent]);

  // Quick Preset Handlers
  const handleApplyPreset = (type: 'RESIDENTIAL_100' | 'COMMERCIAL_HOTEL' | 'CAR_WASH_HUB' | 'SCHOOL_CAMPUS') => {
    if (type === 'RESIDENTIAL_100') {
      setActiveTab('STP');
      setStpPersons(120);
      setStpLPCD(135);
      setStpHrtEqHours(8);
      setGardenLawnAreaSqM(1500);
    } else if (type === 'COMMERCIAL_HOTEL') {
      setActiveTab('STP');
      setStpPersons(350);
      setStpLPCD(180);
      setStpBODin(400);
      setGardenLawnAreaSqM(3500);
    } else if (type === 'CAR_WASH_HUB') {
      setActiveTab('ETP');
      setEtpCarsPerDay(120);
      setEtpLitersPerWash(160);
      setEtpPacPPM(120);
      setEtpRecyclePercent(85);
    } else if (type === 'SCHOOL_CAMPUS') {
      setActiveTab('STP');
      setStpPersons(600);
      setStpLPCD(45); // Day school norm
      setGardenLawnAreaSqM(4000);
    }
  };

  // Copy Spec Sheet to Clipboard
  const handleCopySpec = () => {
    const summaryText = `
AQUATERRA ENGINEERING SIZING SPEC SHEET:
=========================================
1. STP Sizing: ${stpCalc.kld} KLD (${stpPersons} Users @ ${stpLPCD} LPCD)
   - Equalization Tank: ${stpCalc.eqTankVolM3} m³ (${stpHrtEqHours} hrs HRT)
   - Aeration Tank (MBBR): ${stpCalc.aerationTankVolM3} m³ (${stpHrtAerationHours} hrs HRT)
   - Air Blower Delivery: ${stpCalc.airFlowM3PerHr} m³/hr (${stpCalc.airFlowCFM} CFM)
   - Recycled Irrigation Output: ${stpCalc.treatedWaterAvailableLiters} L/day

2. ETP Sizing: ${etpCalc.kld} KLD (${etpCarsPerDay} Vehicles/day)
   - PAC Coagulant Dosing: ${etpCalc.pacDosingKgPerDay} kg/day
   - Recycled Water for Washing: ${etpCalc.recycledWaterLiters} L/day (80%)

3. RO Plant: ${roCapacityKLD} KLD @ ${roOperatingHours} hrs
   - Feed Flow: ${roCalc.feedFlowLPH} LPH
   - High Pressure Pump: ${roCalc.pumpPowerKw} kW (${roCalc.pumpPowerHP} HP) @ ${roOperatingPressureBar} bar

4. Landscape Irrigation:
   - Lawn Water Need: ${gardenCalc.dailyWaterRequiredLiters} L/day for ${gardenLawnAreaSqM} sq.m
   - Dripper Zone Discharge: ${gardenCalc.irrigationZoneDischargeLPH} LPH (${gardenCalc.irrigationRunTimeHours} hrs run)

5. Auxiliary Plant Units:
   - DMF / ACF Dual Media Filter: ${auxCalc.recommendedVessel} (Ø ${auxCalc.vesselDiameterMm} mm)
   - Sludge Filter Press: ${auxCalc.filterPressVolLiters} Liters (${auxCalc.pressChambersCount} Plates)
   - Pump Power: ${auxCalc.pumpPowerKw} kW (${auxCalc.pumpPowerHP} HP)
   - Sodium Hypochlorite: ${auxCalc.hypoDosingLitersPerDay} L/day
=========================================
CPCB / SPCB Standard Compliant • Designed by AquaTerra Solutions
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 4000);
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/90 text-slate-900">
      
      {/* 1. Header Banner & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <Calculator className="w-5 h-5" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Interactive Hydraulic & Sizing Engine
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time reactive engineering formulas for STP, ETP, Industrial RO, Filtration Vessels, and Smart Gardening.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">Quick Presets:</span>
          <button
            type="button"
            onClick={() => handleApplyPreset('RESIDENTIAL_100')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-medium transition-all border border-slate-200 cursor-pointer"
          >
            Villa / 120 P
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('COMMERCIAL_HOTEL')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-medium transition-all border border-slate-200 cursor-pointer"
          >
            Hotel / 350 P
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('CAR_WASH_HUB')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 text-xs font-medium transition-all border border-slate-200 cursor-pointer"
          >
            Car Wash ETP
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('SCHOOL_CAMPUS')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-medium transition-all border border-slate-200 cursor-pointer"
          >
            School / 600 P
          </button>
        </div>
      </div>

      {/* 2. Navigation Module Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-6 pb-6">
        {[
          { id: 'STP', label: '1. STP (Sewage Plant)', icon: Droplets, color: 'text-blue-600', activeBg: 'bg-blue-600 text-white' },
          { id: 'ETP', label: '2. ETP (Effluent Plant)', icon: Factory, color: 'text-amber-600', activeBg: 'bg-amber-600 text-white' },
          { id: 'RO', label: '3. RO Membrane Unit', icon: Cpu, color: 'text-cyan-600', activeBg: 'bg-cyan-600 text-white' },
          { id: 'GARDEN', label: '4. Smart Gardening', icon: Leaf, color: 'text-emerald-600', activeBg: 'bg-emerald-600 text-white' },
          { id: 'AUX', label: '5. Aux & Vessels (DMF/Press)', icon: Layers, color: 'text-indigo-600', activeBg: 'bg-indigo-600 text-white' },
          { id: 'FORMULAS', label: '6. Formulas Reference', icon: FileSpreadsheet, color: 'text-slate-600', activeBg: 'bg-slate-900 text-white' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                isActive
                  ? `${tab.activeBg} border-transparent shadow-md scale-[1.02]`
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Copy Toast Alert */}
      {copiedNotification && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-950 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 border border-emerald-500/50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Complete Engineering Spec Sheet copied to clipboard!</span>
          </div>
          <button
            type="button"
            onClick={() => setCopiedNotification(false)}
            className="text-emerald-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ==========================================
          TAB 1: STP SIZING ENGINE
          ========================================== */}
      {activeTab === 'STP' && (
        <div className="space-y-8 animate-in fade-in">
          
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left Column: Editable STP Parameters (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <span>Occupancy / Population Load (Persons)</span>
                  </label>
                  <span className="font-mono font-extrabold text-blue-700 bg-[var(--color-surface)] px-3 py-0.5 rounded-lg border border-blue-200 text-sm">
                    {stpPersons} Users
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={1000}
                  step={10}
                  value={stpPersons}
                  onChange={(e) => setStpPersons(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                  <span>10 Persons</span>
                  <span>500 Persons</span>
                  <span>1,000 Persons</span>
                </div>
              </div>

              {/* Primary Dual Inputs */}
              <div className="grid sm:grid-cols-2 gap-4">
                
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    LPCD (Liters Per Capita / Day)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={stpLPCD}
                      onChange={(e) => setStpLPCD(Number(e.target.value))}
                      className="w-full p-2 bg-[var(--color-surface)] border border-slate-300 rounded-lg text-sm font-mono font-bold"
                    />
                    <span className="text-xs text-slate-500 font-mono">L/day</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">IS 1172: 135 L (Standard) / 45 L (Day School)</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Sewage Factor (Q_STP / Q_Raw)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step={0.05}
                      min={0.5}
                      max={1.0}
                      value={stpSewageFactor}
                      onChange={(e) => setStpSewageFactor(Number(e.target.value))}
                      className="w-full p-2 bg-[var(--color-surface)] border border-slate-300 rounded-lg text-sm font-mono font-bold"
                    />
                    <span className="text-xs text-slate-500 font-mono">Factor</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">CPHEEO Norm: 0.80 (80% converted to sewage)</span>
                </div>

              </div>

              {/* Advanced STP Tuning Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedParams(!showAdvancedParams)}
                  className="flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{showAdvancedParams ? 'Hide Advanced Process Kinetics' : 'Edit Advanced Kinetics (HRT, BOD, TSS, OTE)'}</span>
                  {showAdvancedParams ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showAdvancedParams && (
                  <div className="mt-4 p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-4 border border-slate-800 animate-in fade-in">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400">
                      Process Retention & Quality Kinetics (CPCB Norms)
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">Equalization HRT (Hours)</label>
                        <input
                          type="number"
                          value={stpHrtEqHours}
                          onChange={(e) => setStpHrtEqHours(Number(e.target.value))}
                          className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">MBBR Aeration HRT (Hours)</label>
                        <input
                          type="number"
                          value={stpHrtAerationHours}
                          onChange={(e) => setStpHrtAerationHours(Number(e.target.value))}
                          className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Raw BOD In (mg/L)</label>
                        <input
                          type="number"
                          value={stpBODin}
                          onChange={(e) => setStpBODin(Number(e.target.value))}
                          className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Treated BOD Out Target (mg/L)</label>
                        <input
                          type="number"
                          value={stpBODout}
                          onChange={(e) => setStpBODout(Number(e.target.value))}
                          className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mathematical Equation Breakdown Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Substituted Engineering Equations:</span>
                </div>
                <div className="font-mono text-slate-600 bg-[var(--color-surface)] p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <div>Q_STP = {stpPersons} × {stpLPCD} LPCD × {stpSewageFactor} = {stpCalc.dailySewageLiters.toLocaleString()} L/day → <strong>{stpCalc.kld} KLD</strong></div>
                  <div>V_EQ = ({stpCalc.kld} / 24) × {stpHrtEqHours} hrs = <strong>{stpCalc.eqTankVolM3} m³</strong></div>
                  <div>V_MBBR = ({stpCalc.kld} / 24) × {stpHrtAerationHours} hrs = <strong>{stpCalc.aerationTankVolM3} m³</strong></div>
                </div>
              </div>

            </div>

            {/* Right Column: STP Engineering Results Sheet (5 Cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
              
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs uppercase font-mono text-cyan-400 font-bold">STP Sizing Deliverables</span>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/40 text-[10px]">MBBR / SBR</Badge>
                </div>

                <div className="mt-4 space-y-4">
                  
                  {/* Primary Capacity Callout */}
                  <div className="p-4 rounded-2xl bg-[var(--color-surface)]/5 border border-white/10">
                    <span className="text-xs text-slate-400 block">Recommended Plant Capacity</span>
                    <div className="text-3xl font-extrabold text-white mt-1">
                      {stpCalc.kld} <span className="text-lg font-normal text-cyan-300">KLD (kL/Day)</span>
                    </div>
                    <span className="text-[11px] text-slate-300">Hourly Flow: ~{stpCalc.hourlyFlowLPH} LPH</span>
                  </div>

                  {/* Equalization Tank Volume */}
                  <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                    <span className="text-slate-300">Equalization Tank (V_EQ):</span>
                    <span className="font-mono font-bold text-cyan-300">{stpCalc.eqTankVolM3} m³ ({stpCalc.eqTankVolLiters.toLocaleString()} L)</span>
                  </div>

                  {/* MBBR Aeration Tank Volume */}
                  <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                    <span className="text-slate-300">MBBR Aeration Tank (V_Aeration):</span>
                    <span className="font-mono font-bold text-cyan-300">{stpCalc.aerationTankVolM3} m³</span>
                  </div>

                  {/* Air Blower Requirement */}
                  <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                    <span className="text-slate-300">Air Blower Delivery:</span>
                    <span className="font-mono font-bold text-amber-300">{stpCalc.airFlowM3PerHr} m³/hr ({stpCalc.airFlowCFM} CFM)</span>
                  </div>

                  {/* Recycled Water for Landscape */}
                  <div className="flex items-center justify-between py-2 text-xs">
                    <span className="text-slate-300">Daily Recycled for Lawn:</span>
                    <span className="font-mono font-bold text-emerald-400">{stpCalc.treatedWaterAvailableLiters.toLocaleString()} L/day</span>
                  </div>

                  {/* Garden Coverage Potential */}
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs flex items-center justify-between">
                    <span className="text-emerald-200">Lawn Area Supported:</span>
                    <span className="font-mono font-extrabold text-emerald-300 text-sm">{stpCalc.lawnCoveredSqM.toLocaleString()} sq.m</span>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => onRequestBOQ?.(`STP Sizing Spec: ${stpCalc.kld} KLD with ${stpCalc.eqTankVolM3} m3 Eq Tank, ${stpCalc.aerationTankVolM3} m3 MBBR, ${stpCalc.airFlowCFM} CFM Blower`)}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Generate STP BOQ & Equipment Schedule
                </button>
                <button
                  type="button"
                  onClick={handleCopySpec}
                  className="w-full py-2 bg-[var(--color-surface)]/10 hover:bg-[var(--color-surface)]/20 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-white/15"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy STP Sizing Spec Sheet
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          TAB 2: ETP SIZING ENGINE (EFFLUENT / CAR WASH)
          ========================================== */}
      {activeTab === 'ETP' && (
        <div className="space-y-8 animate-in fade-in">
          
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left Column: ETP Inputs (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Factory className="w-4 h-4 text-amber-600" />
                    <span>Daily Vehicles / Car Wash Throughput</span>
                  </label>
                  <span className="font-mono font-extrabold text-amber-700 bg-[var(--color-surface)] px-3 py-0.5 rounded-lg border border-amber-200 text-sm">
                    {etpCarsPerDay} Vehicles / Day
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={300}
                  step={5}
                  value={etpCarsPerDay}
                  onChange={(e) => setEtpCarsPerDay(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                  <span>10 Cars</span>
                  <span>150 Cars</span>
                  <span>300 Cars</span>
                </div>
              </div>

              {/* Dual Secondary Inputs */}
              <div className="grid sm:grid-cols-2 gap-4">
                
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Water Usage Per Wash (Liters)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={etpLitersPerWash}
                      onChange={(e) => setEtpLitersPerWash(Number(e.target.value))}
                      className="w-full p-2 bg-[var(--color-surface)] border border-slate-300 rounded-lg text-sm font-mono font-bold"
                    />
                    <span className="text-xs text-slate-500 font-mono">L/car</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Typical: 120–180 L for high pressure jet</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Recycle Target Recovery (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={50}
                      max={95}
                      value={etpRecyclePercent}
                      onChange={(e) => setEtpRecyclePercent(Number(e.target.value))}
                      className="w-full p-2 bg-[var(--color-surface)] border border-slate-300 rounded-lg text-sm font-mono font-bold"
                    />
                    <span className="text-xs text-slate-500 font-mono">%</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">ZLD Standard: 80% to 85% closed loop</span>
                </div>

              </div>

              {/* Chemical Coagulation Inputs */}
              <div className="p-4 bg-amber-950/10 border border-amber-500/20 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-700" />
                  <span>Chemical Dosing Dosage (DAF & Tube Settler)</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 block mb-1 font-medium">PAC Coagulant (PPM / mg/L)</label>
                    <input
                      type="number"
                      value={etpPacPPM}
                      onChange={(e) => setEtpPacPPM(Number(e.target.value))}
                      className="w-full p-2 bg-[var(--color-surface)] border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1 font-medium">Polyelectrolyte Flocculant (PPM)</label>
                    <input
                      type="number"
                      step={0.5}
                      value={etpPolyPPM}
                      onChange={(e) => setEtpPolyPPM(Number(e.target.value))}
                      className="w-full p-2 bg-[var(--color-surface)] border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: ETP Deliverables Card (5 Cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-amber-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
              
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs uppercase font-mono text-amber-400 font-bold">ETP Sizing Deliverables</span>
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/40 text-[10px]">DAF + DUAL MEDIA</Badge>
                </div>

                <div className="mt-4 space-y-4">
                  
                  {/* Capacity */}
                  <div className="p-4 rounded-2xl bg-[var(--color-surface)]/5 border border-white/10">
                    <span className="text-xs text-slate-400 block">Recommended ETP Capacity</span>
                    <div className="text-3xl font-extrabold text-white mt-1">
                      {etpCalc.kld} <span className="text-lg font-normal text-amber-300">KLD</span>
                    </div>
                    <span className="text-[11px] text-slate-300">Raw Effluent: {etpCalc.dailyRawEffluentLiters.toLocaleString()} L/day</span>
                  </div>

                  {/* Recycled Wash Water */}
                  <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                    <span className="text-slate-300">Recycled for Washing:</span>
                    <span className="font-mono font-bold text-emerald-400">{etpCalc.recycledWaterLiters.toLocaleString()} L/day ({etpRecyclePercent}%)</span>
                  </div>

                  {/* PAC Coagulant Need */}
                  <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                    <span className="text-slate-300">PAC Dosing Requirement:</span>
                    <span className="font-mono font-bold text-amber-300">{etpCalc.pacDosingKgPerDay} kg / day</span>
                  </div>

                  {/* Poly Dosing Need */}
                  <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                    <span className="text-slate-300">Polyelectrolyte Flocculant:</span>
                    <span className="font-mono font-bold text-amber-300">{etpCalc.polyDosingKgPerDay} kg / day</span>
                  </div>

                  {/* Reject / Sludge Output */}
                  <div className="flex items-center justify-between py-2 text-xs">
                    <span className="text-slate-300">Sludge Drain / Reject:</span>
                    <span className="font-mono font-bold text-rose-300">{etpCalc.rejectWaterLiters.toLocaleString()} L/day</span>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => onRequestBOQ?.(`ETP Sizing: ${etpCalc.kld} KLD for ${etpCarsPerDay} cars/day, PAC ${etpCalc.pacDosingKgPerDay} kg/d`)}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Generate ETP BOQ & Layout Drawing
                </button>
                <button
                  type="button"
                  onClick={handleCopySpec}
                  className="w-full py-2 bg-[var(--color-surface)]/10 hover:bg-[var(--color-surface)]/20 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-white/15"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy ETP Sizing Spec
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          TAB 3: RO MEMBRANE SIZING ENGINE
          ========================================== */}
      {activeTab === 'RO' && (
        <div className="space-y-8 animate-in fade-in">
          
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left Column: RO Inputs (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="p-4 bg-cyan-50/60 border border-cyan-100 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-600" />
                    <span>RO Required Permeate Volume (kL/day)</span>
                  </label>
                  <span className="font-mono font-extrabold text-cyan-700 bg-[var(--color-surface)] px-3 py-0.5 rounded-lg border border-cyan-200 text-sm">
                    {roCapacityKLD} KLD Feed
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={100}
                  step={1}
                  value={roCapacityKLD}
                  onChange={(e) => setRoCapacityKLD(Number(e.target.value))}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                  <span>2 KLD</span>
                  <span>50 KLD</span>
                  <span>100 KLD</span>
                </div>
              </div>

              {/* Multi-parameter Grid */}
              <div className="grid sm:grid-cols-3 gap-4">
                
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={24}
                    value={roOperatingHours}
                    onChange={(e) => setRoOperatingHours(Number(e.target.value))}
                    className="w-full p-2 bg-[var(--color-surface)] border border-slate-300 rounded-lg text-sm font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Standard: 8 to 16 hrs</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Membrane Recovery
                  </label>
                  <input
                    type="number"
                    min={40}
                    max={85}
                    value={roRecoveryPercent}
                    onChange={(e) => setRoRecoveryPercent(Number(e.target.value))}
                    className="w-full p-2 bg-[var(--color-surface)] border border-slate-300 rounded-lg text-sm font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">BWRO: 60–70%</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Feed Pressure (Bar)
                  </label>
                  <input
                    type="number"
                    min={8}
                    max={30}
                    value={roOperatingPressureBar}
                    onChange={(e) => setRoOperatingPressureBar(Number(e.target.value))}
                    className="w-full p-2 bg-[var(--color-surface)] border border-slate-300 rounded-lg text-sm font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">12–16 bar for Brackish</span>
                </div>

              </div>

              {/* Formula card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs font-mono">
                <div className="font-bold text-slate-800">High-Pressure Pump Power Formula:</div>
                <div className="text-slate-600 bg-[var(--color-surface)] p-2.5 rounded-xl border border-slate-200">
                  P_RO = ({roCalc.feedFlowM3PerHr} m³/hr × {roOperatingPressureBar} bar × 10) / (36 × {roPumpEfficiency}) = <strong>{roCalc.pumpPowerKw} kW ({roCalc.pumpPowerHP} HP)</strong>
                </div>
              </div>

            </div>

            {/* Right Column: RO Deliverables Card (5 Cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-cyan-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
              
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs uppercase font-mono text-cyan-400 font-bold">RO Plant Hydraulics</span>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/40 text-[10px]">TFC 8040 / 4040</Badge>
                </div>

                <div className="mt-4 space-y-4">
                  
                  {/* Flow Rate */}
                  <div className="p-4 rounded-2xl bg-[var(--color-surface)]/5 border border-white/10">
                    <span className="text-xs text-slate-400 block">RO Feed Pump Flow Rate</span>
                    <div className="text-3xl font-extrabold text-white mt-1">
                      {roCalc.feedFlowLPH.toLocaleString()} <span className="text-lg font-normal text-cyan-300">LPH</span>
                    </div>
                    <span className="text-[11px] text-slate-300">{roCalc.feedFlowM3PerHr} m³/hr continuous rate</span>
                  </div>

                  {/* Permeate Pure Water */}
                  <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                    <span className="text-slate-300">Permeate (Pure Water Output):</span>
                    <span className="font-mono font-bold text-emerald-400">{roCalc.permeateFlowLPH.toLocaleString()} LPH ({roCalc.dailyPermeateLiters.toLocaleString()} L/day)</span>
                  </div>

                  {/* Reject Water */}
                  <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                    <span className="text-slate-300">RO Reject / Brine Stream:</span>
                    <span className="font-mono font-bold text-amber-300">{roCalc.rejectFlowLPH.toLocaleString()} LPH ({roCalc.dailyRejectLiters.toLocaleString()} L/day)</span>
                  </div>

                  {/* High Pressure Pump Power */}
                  <div className="flex items-center justify-between py-2 text-xs">
                    <span className="text-slate-300">HP Pump Motor Rating:</span>
                    <span className="font-mono font-bold text-cyan-300">{roCalc.pumpPowerKw} kW ({roCalc.pumpPowerHP} HP)</span>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => onRequestBOQ?.(`RO Sizing: ${roCalc.feedFlowLPH} LPH Feed, Permeate ${roCalc.permeateFlowLPH} LPH, Pump ${roCalc.pumpPowerHP} HP`)}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Generate RO Skid BOQ & Membrane Array
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          TAB 4: SMART GARDENING & IRRIGATION
          ========================================== */}
      {activeTab === 'GARDEN' && (
        <div className="space-y-8 animate-in fade-in">
          
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left Column: Garden Inputs (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    <span>Lawn / Landscape Garden Area (sq. meters)</span>
                  </label>
                  <span className="font-mono font-extrabold text-emerald-700 bg-[var(--color-surface)] px-3 py-0.5 rounded-lg border border-emerald-200 text-sm">
                    {gardenLawnAreaSqM.toLocaleString()} sq.m
                  </span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={10000}
                  step={100}
                  value={gardenLawnAreaSqM}
                  onChange={(e) => setGardenLawnAreaSqM(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                  <span>100 sq.m</span>
                  <span>5,000 sq.m</span>
                  <span>10,000 sq.m</span>
                </div>
              </div>

              {/* Dual Inputs */}
              <div className="grid sm:grid-cols-2 gap-4">
                
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Evapotranspiration Discharge Rate
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step={0.5}
                      value={gardenEvapoRateLPerSqM}
                      onChange={(e) => setGardenEvapoRateLPerSqM(Number(e.target.value))}
                      className="w-full p-2 bg-[var(--color-surface)] border border-slate-300 rounded-lg text-sm font-mono font-bold"
                    />
                    <span className="text-xs text-slate-500 font-mono">L/m²/day</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Lawn: 4–6 L/sq.m • Trees/Shrubs: 2–3 L/sq.m</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Number of Installed Drippers / Emitters
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={gardenDrippersCount}
                      onChange={(e) => setGardenDrippersCount(Number(e.target.value))}
                      className="w-full p-2 bg-[var(--color-surface)] border border-slate-300 rounded-lg text-sm font-mono font-bold"
                    />
                    <span className="text-xs text-slate-500 font-mono">Pcs</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">@ {gardenDripperRatingLPH} LPH pressure-compensated</span>
                </div>

              </div>

              {/* STP Recycled Water Loop Integration */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2 text-xs">
                <div className="font-bold text-teal-900 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-teal-600" />
                  <span>Closed-Loop STP Recycling Self-Sufficiency</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-600">STP Recycled Water Available:</span>
                  <span className="font-mono font-bold text-teal-800">{stpCalc.treatedWaterAvailableLiters.toLocaleString()} L/day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Daily Garden Water Needed:</span>
                  <span className="font-mono font-bold text-slate-800">{gardenCalc.dailyWaterRequiredLiters.toLocaleString()} L/day</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${
                      gardenCalc.stpCoveragePercent >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, gardenCalc.stpCoveragePercent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>Self Sufficiency: {gardenCalc.stpCoveragePercent}%</span>
                  <span>{gardenCalc.stpCoveragePercent >= 100 ? '100% Net Zero Discharge' : 'Supplemental Harvesting Needed'}</span>
                </div>
              </div>

            </div>

            {/* Right Column: Garden Deliverables (5 Cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
              
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs uppercase font-mono text-emerald-400 font-bold">Smart Irrigation Sizing</span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/40 text-[10px]">SOLENOID AUTOMATED</Badge>
                </div>

                <div className="mt-4 space-y-4">
                  
                  {/* Daily Water Requirement */}
                  <div className="p-4 rounded-2xl bg-[var(--color-surface)]/5 border border-white/10">
                    <span className="text-xs text-slate-400 block">Daily Garden Water Consumption</span>
                    <div className="text-3xl font-extrabold text-white mt-1">
                      {gardenCalc.dailyWaterRequiredLiters.toLocaleString()} <span className="text-lg font-normal text-emerald-300">Liters / Day</span>
                    </div>
                    <span className="text-[11px] text-slate-300">{gardenLawnAreaSqM.toLocaleString()} sq.m @ {gardenEvapoRateLPerSqM} L/m²</span>
                  </div>

                  {/* Zone Discharge */}
                  <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                    <span className="text-slate-300">Drip Network Flow Rate:</span>
                    <span className="font-mono font-bold text-cyan-300">{gardenCalc.irrigationZoneDischargeLPH.toLocaleString()} LPH</span>
                  </div>

                  {/* Run Time */}
                  <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                    <span className="text-slate-300">Automated Run Time:</span>
                    <span className="font-mono font-bold text-amber-300">{gardenCalc.irrigationRunTimeHours} Hours ({gardenCalc.irrigationRunTimeMinutes} mins)</span>
                  </div>

                  {/* Net Zero Discharge Badge */}
                  <div className="p-3 bg-emerald-900/60 border border-emerald-500/30 rounded-xl text-xs">
                    <span className="text-emerald-200 font-bold block mb-1">Zero Liquid Discharge (ZLD) Compliance:</span>
                    <span className="text-[11px] text-slate-300">Treated STP water is 100% absorbed by soil root-zones with zero municipal drain run-off.</span>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => onRequestBOQ?.(`Smart Irrigation: ${gardenLawnAreaSqM} sq.m, Daily Need ${gardenCalc.dailyWaterRequiredLiters} L/day, Drip Run Time ${gardenCalc.irrigationRunTimeMinutes} mins`)}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Generate Irrigation BOQ & Solenoid Manifold
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          TAB 5: AUXILIARY PLANT SIZING (DMF/ACF, SLUDGE PRESS, PUMP, CHLORINE)
          ========================================== */}
      {activeTab === 'AUX' && (
        <div className="space-y-8 animate-in fade-in">
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. DMF / ACF Vessel Sizing Card */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 hover:shadow-md transition">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <Layers className="w-4 h-4" />
                <span>1. DMF / ACF Vessel Sizing</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Filter Flow Rate:</span>
                  <span className="font-mono font-bold text-slate-800">{auxCalc.filterFlowM3PerHr} m³/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Calculated Diameter:</span>
                  <span className="font-mono font-bold text-indigo-700">{auxCalc.vesselDiameterMm} mm ({auxCalc.vesselDiameterInches}&quot;)</span>
                </div>
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 font-bold text-xs mt-3">
                  Recommended Model: {auxCalc.recommendedVessel}
                </div>
              </div>
            </div>

            {/* 2. Sludge Production & Filter Press */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 hover:shadow-md transition">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <Gauge className="w-4 h-4" />
                <span>2. Sludge & Filter Press</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Dry Sludge Output:</span>
                  <span className="font-mono font-bold text-slate-800">{auxCalc.drySludgeKgPerDay} kg/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Press Sludge Volume:</span>
                  <span className="font-mono font-bold text-amber-700">{auxCalc.filterPressVolLiters} Liters</span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-900 font-bold text-xs mt-3">
                  Press Recommendation: {auxCalc.pressChambersCount} Chamber Recessed Plate
                </div>
              </div>
            </div>

            {/* 3. Pumping Power (kW) */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 hover:shadow-md transition">
              <div className="flex items-center gap-2 text-cyan-700 font-bold text-sm">
                <Zap className="w-4 h-4" />
                <span>3. Feed & Transfer Pump Power</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Operating Head:</span>
                  <span className="font-mono font-bold text-slate-800">{pumpHeadMeters} Meters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Motor Power:</span>
                  <span className="font-mono font-bold text-cyan-700">{auxCalc.pumpPowerKw} kW</span>
                </div>
                <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-xl text-cyan-900 font-bold text-xs mt-3">
                  Pump Motor Rating: {auxCalc.pumpPowerHP} HP (Centrifugal)
                </div>
              </div>
            </div>

            {/* 4. Sodium Hypochlorite Dosing */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 hover:shadow-md transition">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                <Droplets className="w-4 h-4" />
                <span>4. Chlorine Disinfection Dosing</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Dosing PPM:</span>
                  <span className="font-mono font-bold text-slate-800">{hypoDosingPPM} mg/L (PPM)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hypo Liquid Needed:</span>
                  <span className="font-mono font-bold text-teal-700">{auxCalc.hypoDosingLitersPerDay} L / day</span>
                </div>
                <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-teal-900 font-bold text-xs mt-3">
                  10% Commercial NaOCl Liquid Feed
                </div>
              </div>
            </div>

          </div>

          <div className="p-6 bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Full Auxiliary & Equipment Schedule Ready</h4>
              <p className="text-xs text-slate-400">Complete hydraulic sizing for DMF, ACF, Softeners, Sludge Filter Press, and Dosing Skids.</p>
            </div>
            <button
              type="button"
              onClick={() => onRequestBOQ?.(`Full Auxiliary Equipment Schedule: DMF ${auxCalc.recommendedVessel}, Sludge Press ${auxCalc.filterPressVolLiters}L, Pump ${auxCalc.pumpPowerHP} HP`)}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap"
            >
              Export Complete BOQ Matrix
            </button>
          </div>

        </div>
      )}

      {/* ==========================================
          TAB 6: ENGINEERING FORMULAS REFERENCE TABLE
          ========================================== */}
      {activeTab === 'FORMULAS' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="bg-slate-900 text-white p-4 font-mono font-bold text-xs flex items-center justify-between">
              <span>Standard Environmental & Hydraulic Formulas Matrix</span>
              <span className="text-teal-400">CPHEEO & CPCB Certified</span>
            </div>

            <div className="divide-y divide-slate-200 text-xs">
              
              {/* STP Sewage Formula */}
              <div className="p-4 grid md:grid-cols-3 gap-3 bg-[var(--color-surface)]">
                <div className="font-bold text-slate-900 font-mono">
                  1. STP Daily Sewage Volume (Q_STP)
                </div>
                <div className="font-mono text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-100 font-bold">
                  Q_STP = Persons × LPCD × 0.80
                </div>
                <div className="text-slate-500">
                  Standard CPHEEO per capita sewage generation (80% of raw domestic consumption).
                </div>
              </div>

              {/* Equalization Tank */}
              <div className="p-4 grid md:grid-cols-3 gap-3 bg-slate-50/50">
                <div className="font-bold text-slate-900 font-mono">
                  2. Equalization Tank Volume (V_EQ)
                </div>
                <div className="font-mono text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-100 font-bold">
                  V_EQ = (Q_STP / 24) × HRT (6 to 8 hrs)
                </div>
                <div className="text-slate-500">
                  Hydraulic retention time to balance diurnal flow peaks and organic load fluctuations.
                </div>
              </div>

              {/* Aeration Air Flow */}
              <div className="p-4 grid md:grid-cols-3 gap-3 bg-[var(--color-surface)]">
                <div className="font-bold text-slate-900 font-mono">
                  3. Blower Air Flow (CFM / m³/hr)
                </div>
                <div className="font-mono text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-100 font-bold">
                  Air Flow = (BOD Load × 1.5) / (OTE × 0.23 × 1.2)
                </div>
                <div className="text-slate-500">
                  Calculates twin lobe rotary air blower capacity based on dissolved oxygen transfer kinetics.
                </div>
              </div>

              {/* ETP Effluent Formula */}
              <div className="p-4 grid md:grid-cols-3 gap-3 bg-slate-50/50">
                <div className="font-bold text-slate-900 font-mono">
                  4. ETP Effluent Volume (Q_ETP)
                </div>
                <div className="font-mono text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100 font-bold">
                  Q_ETP = Cars/day × Liters/wash × 0.90
                </div>
                <div className="text-slate-500">
                  90% collection recovery factor accounting for splash and evaporation loss.
                </div>
              </div>

              {/* RO High Pressure Pump */}
              <div className="p-4 grid md:grid-cols-3 gap-3 bg-[var(--color-surface)]">
                <div className="font-bold text-slate-900 font-mono">
                  5. RO HP Pump Power (P_RO in kW)
                </div>
                <div className="font-mono text-cyan-700 bg-cyan-50 p-2 rounded-lg border border-cyan-100 font-bold">
                  P_RO (kW) = [Q (m³/hr) × Pressure (bar) × 10] / (36 × η)
                </div>
                <div className="text-slate-500">
                  Hydraulic power calculation for multi-stage vertical centrifugal pumps.
                </div>
              </div>

              {/* Landscape Irrigation Area */}
              <div className="p-4 grid md:grid-cols-3 gap-3 bg-slate-50/50">
                <div className="font-bold text-slate-900 font-mono">
                  6. Maximum Garden Lawn Area
                </div>
                <div className="font-mono text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100 font-bold">
                  Max Area (sq.m) = Treated Water (L/day) / 5 L/sq.m
                </div>
                <div className="text-slate-500">
                  Lawn root-zone saturation requirement under Indian tropical climate zones.
                </div>
              </div>

              {/* DMF Vessel Diameter */}
              <div className="p-4 grid md:grid-cols-3 gap-3 bg-[var(--color-surface)]">
                <div className="font-bold text-slate-900 font-mono">
                  7. DMF/ACF Vessel Diameter (D in mm)
                </div>
                <div className="font-mono text-indigo-700 bg-indigo-50 p-2 rounded-lg border border-indigo-100 font-bold">
                  D = √[(4 × Area) / π] × 1000, Area = Q_F / Velocity
                </div>
                <div className="text-slate-500">
                  Based on 10–15 m/hr linear filtration velocity through quartz sand and activated carbon bed.
                </div>
              </div>

              {/* Sludge Production */}
              <div className="p-4 grid md:grid-cols-3 gap-3 bg-slate-50/50">
                <div className="font-bold text-slate-900 font-mono">
                  8. Dry Sludge Generation (W_sludge in kg/day)
                </div>
                <div className="font-mono text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100 font-bold">
                  W_sludge = Q(kL) × [(TSS_in - TSS_out) + 0.5 × (BOD_in - BOD_out)] / 1000
                </div>
                <div className="text-slate-500">
                  Total dry solids generated per day to size sludge drying beds or recessed plate filter presses.
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* 3. Bottom Quick Navigation Bar */}
      <div className="pt-6 mt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>All formulas adhere to CPCB, SPCB, and CPHEEO Manual on Sewerage & Treatment Systems.</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopySpec}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copy Full Spec</span>
          </button>
          <button
            type="button"
            onClick={() => onRequestConsultation?.(`Chartered Engineering Consultation for ${stpCalc.kld} KLD STP / ${etpCalc.kld} KLD ETP`)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-xs cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Book DPR Consultation</span>
          </button>
        </div>
      </div>

    </div>
  );
};
