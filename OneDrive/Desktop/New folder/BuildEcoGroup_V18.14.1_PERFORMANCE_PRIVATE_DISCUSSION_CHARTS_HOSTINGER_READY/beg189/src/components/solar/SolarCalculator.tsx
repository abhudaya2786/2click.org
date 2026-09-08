import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Sun, 
  MapPin, 
  Zap, 
  Layers, 
  ShieldCheck, 
  DollarSign, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  RotateCcw, 
  Download, 
  Building2, 
  Home, 
  Leaf, 
  FileText, 
  Phone, 
  Sparkles, 
  Info, 
  Check, 
  ChevronRight, 
  TrendingUp, 
  BatteryCharging, 
  Droplet, 
  Send, 
  Share2, 
  Printer,
  Calendar,
  Percent,
  Sliders,
  Scale
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { 
  STATE_SUBSIDY_DATABASE, 
  calculateSolarSystem, 
  SOLAR_TOPOLOGIES 
} from '../../lib/solarRegistry';
import { SolarCustomerType, RoofType, SolarCalculationResult } from '../../types/solar';
import { saveUniversalForm } from '../../lib/queryStorage';
import { useAuth } from '../../contexts/AuthContext';

export interface SolarCalculatorProps {
  initialCustomerType?: SolarCustomerType;
  initialStateCode?: string;
  initialMonthlyBill?: number;
  initialRoofArea?: number;
  onOpenDPRModal?: (calcResult: any) => void;
  onOpenSiteSurvey?: (prefill: any) => void;
  onOpenIntake?: (objective: string, category: string) => void;
  className?: string;
}

export const SolarCalculator: React.FC<SolarCalculatorProps> = ({
  initialCustomerType = 'Residential',
  initialStateCode = 'UP',
  initialMonthlyBill = 4500,
  initialRoofArea = 650,
  onOpenDPRModal,
  onOpenSiteSurvey,
  onOpenIntake,
  className = ''
}) => {
  const { user } = useAuth();

  // Multi-Step Wizard:
  // Step 1: User Inputs (Bill, Roof Area, Location)
  // Step 2: System Sizing Engine Calculation
  // Step 3: Financial & Subsidy Engine Integration
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // ==========================================
  // STEP 1 STATE: USER INPUTS
  // ==========================================
  const [customerType, setCustomerType] = useState<SolarCustomerType>(initialCustomerType);
  const [selectedState, setSelectedState] = useState<string>(initialStateCode);
  const [selectedDiscom, setSelectedDiscom] = useState<string>('');
  const [city, setCity] = useState<string>((user as any)?.city || 'Lucknow');
  const [pincode, setPincode] = useState<string>('226010');

  // Electricity Bill & Tariff
  const [monthlyBill, setMonthlyBill] = useState<number>(initialMonthlyBill);
  const [tariffRate, setTariffRate] = useState<number>(7.5);
  const [sanctionedLoad, setSanctionedLoad] = useState<number>(5);

  // Roof Area & Characteristics
  const [availableRoofArea, setAvailableRoofArea] = useState<number>(initialRoofArea);
  const [roofType, setRoofType] = useState<RoofType>('RCC Slab');
  const [shadowFreePercentage, setShadowFreePercentage] = useState<number>(90);
  const [structureMounting, setStructureMounting] = useState<'Standard Elevated' | 'Flush Tin Clamp' | 'High-Rise Gazebo'>('Standard Elevated');

  // ==========================================
  // STEP 3 STATE: FINANCIAL ENGINE & LEAD CAPTURE
  // ==========================================
  const [financialTab, setFinancialTab] = useState<'overview' | 'subsidy' | 'cashflow' | 'loan'>('overview');
  const [loanTenureYears, setLoanTenureYears] = useState<number>(5);
  const [loanInterestRatePct, setLoanInterestRatePct] = useState<number>(7.0); // 7.0% PM Surya Ghar Concessional Loan
  const [downPaymentPct, setDownPaymentPct] = useState<number>(10);

  // Lead Generation form
  const [leadName, setLeadName] = useState<string>(user?.fullName || '');
  const [leadPhone, setLeadPhone] = useState<string>(user?.phone || '');
  const [leadEmail, setLeadEmail] = useState<string>(user?.email || '');
  const [leadNotes, setLeadNotes] = useState<string>('');
  const [isSubmittingLead, setIsSubmittingLead] = useState<boolean>(false);
  const [submittedFormId, setSubmittedFormId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // ==========================================
  // DERIVED DATA & COMPUTATIONS
  // ==========================================
  const currentStateRule = useMemo(() => {
    return STATE_SUBSIDY_DATABASE.find(s => s.stateCode === selectedState) || STATE_SUBSIDY_DATABASE[0];
  }, [selectedState]);

  // Sync Discom default
  useMemo(() => {
    if (currentStateRule.discoms.length > 0 && (!selectedDiscom || !currentStateRule.discoms.includes(selectedDiscom))) {
      setSelectedDiscom(currentStateRule.discoms[0]);
    }
  }, [currentStateRule, selectedDiscom]);

  // Sizing Calculation via Mathematical Engine
  const result: SolarCalculationResult = useMemo(() => {
    const usableRoof = Math.round(availableRoofArea * (shadowFreePercentage / 100));
    return calculateSolarSystem(
      customerType,
      monthlyBill,
      selectedState,
      tariffRate,
      usableRoof,
      roofType
    );
  }, [customerType, monthlyBill, selectedState, tariffRate, availableRoofArea, shadowFreePercentage, roofType]);

  // Hardware Details
  const panelWattage = 580; // Wp TOPCon Bifacial
  const panelCount = Math.ceil((result.requiredKWp * 1000) / panelWattage);
  const estimatedRoofOccupied = Math.round(result.requiredKWp * 80);
  const roofUtilizationPct = Math.min(100, Math.round((estimatedRoofOccupied / Math.max(1, availableRoofArea)) * 100));

  // Inverter Configuration
  const inverterSpecification = useMemo(() => {
    if (result.requiredKWp <= 3.3) return `${result.requiredKWp} kW Single-Phase Grid-Tie String Inverter`;
    if (result.requiredKWp <= 10) return `${result.requiredKWp} kW Three-Phase Dual-MPPT Inverter (Wi-Fi)`;
    if (result.requiredKWp <= 50) return `${result.requiredKWp} kW Commercial Multi-MPPT Inverter (IP66)`;
    return `${result.requiredKWp} kW Industrial C&I Inverter Array with SCADA Gateway`;
  }, [result.requiredKWp]);

  // Loan EMI Calculations (Monthly compounding)
  const loanMetrics = useMemo(() => {
    const principal = result.netCustomerCost * (1 - downPaymentPct / 100);
    const monthlyRate = loanInterestRatePct / (12 * 100);
    const months = loanTenureYears * 12;
    
    if (monthlyRate === 0) {
      const emi = principal / months;
      return { principal, emi: Math.round(emi), totalPayment: principal, totalInterest: 0 };
    }
    
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    return {
      principal: Math.round(principal),
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      monthlyNetBillWithSolarAndEmi: Math.max(0, (monthlyBill * 0.1) + emi) // ~90% bill reduction + EMI
    };
  }, [result.netCustomerCost, downPaymentPct, loanInterestRatePct, loanTenureYears, monthlyBill]);

  // Category switch helper
  const handleCustomerTypeChange = (type: SolarCustomerType) => {
    setCustomerType(type);
    if (type === 'Residential') {
      setTariffRate(7.5);
      if (monthlyBill > 25000) setMonthlyBill(4500);
      setSanctionedLoad(5);
    } else if (type === 'Commercial' || type === 'Industrial') {
      setTariffRate(9.5);
      if (monthlyBill < 15000) setMonthlyBill(45000);
      setSanctionedLoad(25);
    } else {
      setTariffRate(5.0);
      setMonthlyBill(8000);
      setSanctionedLoad(10);
    }
  };

  // Quick Preset Handlers
  const billPresets = useMemo(() => {
    if (customerType === 'Residential') return [2000, 4500, 7500, 12000, 18000, 25000];
    if (customerType === 'Commercial' || customerType === 'Industrial') return [25000, 50000, 100000, 250000, 500000];
    return [5000, 10000, 20000, 40000];
  }, [customerType]);

  const roofPresets = useMemo(() => {
    if (customerType === 'Residential') return [300, 500, 800, 1200, 2000, 3500];
    if (customerType === 'Commercial' || customerType === 'Industrial') return [2000, 5000, 10000, 25000, 50000];
    return [1000, 2500, 5000, 10000];
  }, [customerType]);

  // Lead Submission
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) return;

    setIsSubmittingLead(true);
    try {
      const formPayload = {
        formType: 'SOLAR_ASSESSMENT' as const,
        category: 'SOLAR' as const,
        title: `${result.requiredKWp} kWp ${customerType} Solar Sizing (${selectedState})`,
        location: `${city}, ${currentStateRule.stateName}`,
        city: city || 'Lucknow',
        pincode: pincode || '226010',
        clientName: leadName,
        clientPhone: leadPhone,
        clientEmail: leadEmail || undefined,
        preferredContact: 'WHATSAPP' as const,
        urgency: 'HIGH' as const,
        details: {
          customerType,
          state: currentStateRule.stateName,
          discom: selectedDiscom,
          monthlyBill,
          tariffRate,
          sanctionedLoad,
          availableRoofArea,
          roofType,
          shadowFreePercentage,
          systemSizeKWp: result.requiredKWp,
          panelCount,
          estimatedCost: result.estimatedEPCPrice,
          totalSubsidy: result.totalSubsidy,
          netCost: result.netCustomerCost,
          annualSavings: result.annualSavings,
          paybackYears: result.paybackPeriodYears,
          lifetime25YearSavings: result.lifetime25YearSavings,
          userNotes: leadNotes
        }
      };

      const saved = saveUniversalForm(formPayload as any);
      setSubmittedFormId(saved.id);
    } catch (err) {
      console.error('Failed to submit solar inquiry:', err);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleShareOrCopy = () => {
    const summary = `☀️ BuildEcoGroup Solar Sizing Report:
• System Capacity: ${result.requiredKWp} kWp (${customerType})
• Gross EPC Cost: ₹${result.estimatedEPCPrice.toLocaleString('en-IN')}
• Eligible Govt Subsidy: ₹${result.totalSubsidy.toLocaleString('en-IN')} (PM Surya Ghar + ${currentStateRule.stateName})
• Net Out-Of-Pocket: ₹${result.netCustomerCost.toLocaleString('en-IN')}
• Annual Energy Savings: ₹${result.annualSavings.toLocaleString('en-IN')}/year
• Payback Period: ${result.paybackPeriodYears} Years
• 25-Year Net Profit: ₹${result.lifetime25YearSavings.toLocaleString('en-IN')}
Consult with BuildEcoGroup Technical Cell.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const wizardSteps = [
    { number: 1, title: 'User Inputs', desc: 'Bill, Roof & Location' },
    { number: 2, title: 'System Sizing', desc: 'Capacity & Engineering' },
    { number: 3, title: 'Financial & Subsidy', desc: 'Govt Grants & ROI' },
  ];

  return (
    <div className={`bg-[var(--color-surface)] rounded-3xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      
      {/* =========================================================================
          HERO BANNER & MULTI-STEP PROGRESS HEADER
         ========================================================================= */}
      <div className="bg-[#0F172A] p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] text-xs font-mono font-bold uppercase tracking-wider">
                <Sun className="w-3.5 h-3.5" />
                <span>BuildEcoGroup Solar Sizing Engine v4.2</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                Rooftop Solar Sizing & Financial Subsidy Engine
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Simulate optimal PV capacity, central PM Surya Ghar & state subsidies, 25-year levelized cashflows, and zero-downpayment bank EMIs.
              </p>
            </div>

            {/* Quick Summary Pill on Step 2 or 3 */}
            {currentStep > 1 && (
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 px-4 text-right shrink-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Recommended Sizing</span>
                <div className="text-xl font-black text-[#10B981]">{result.requiredKWp} kWp</div>
                <span className="text-[10px] text-slate-300">Net: ₹{(result.netCustomerCost / 100000).toFixed(2)} Lakhs</span>
              </div>
            )}
          </div>

          {/* 3-Step Wizard Navigation Stepper */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
            {wizardSteps.map((step) => {
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;
              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setCurrentStep(step.number as any)}
                  className={`p-3 rounded-2xl text-left transition-all border ${
                    isCurrent
                      ? 'bg-slate-800 border-[#10B981] text-white shadow-md'
                      : isCompleted
                      ? 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800/40'
                      : 'bg-slate-900/30 border-slate-800/80 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isCurrent
                        ? 'bg-[#10B981] text-slate-950'
                        : isCompleted
                        ? 'bg-emerald-900/80 text-[#10B981]'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {isCompleted ? '✓' : step.number}
                    </span>
                    <span className="text-xs font-black truncate">{step.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 hidden sm:block truncate">{step.desc}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Subtle background glow */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* =========================================================================
          MAIN MULTI-STEP WORKSPACE CONTENT
         ========================================================================= */}
      <div className="p-6 sm:p-8 bg-[#F8FAFC]">
        
        {/* =========================================================================
            STEP 1: USER INPUTS (BILL, ROOF AREA, LOCATION)
           ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Customer Segment Tabs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#10B981]" />
                  <span>1. Select Consumer Category & Grid Tariff</span>
                </label>
                <span className="text-xs text-slate-500">Determines CFA Subsidy & Tax Benefit Eligibility</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { type: 'Residential', label: 'Residential Home / Villa', badge: 'Max ₹78,000 CFA', icon: Home },
                  { type: 'Commercial', label: 'Commercial & Office', badge: '40% Accelerated Depr.', icon: Building2 },
                  { type: 'Industrial', label: 'Industrial Shed / Mill', badge: 'High HT Tariffs', icon: Zap },
                  { type: 'Agricultural', label: 'Agricultural (KUSUM)', badge: 'Up to 60% Subsidy', icon: Droplet },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = customerType === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => handleCustomerTypeChange(item.type as SolarCustomerType)}
                      className={`p-4 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'bg-[#0F172A] text-white border-[#10B981] shadow-md'
                          : 'bg-[var(--color-surface)] text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-[#10B981]' : 'text-slate-400'}`} />
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-[#10B981] text-slate-950' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                      <div className="text-xs font-black">{item.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Grid: Location & Energy Bill */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Box A: Location, State & Discom Grid */}
              <Card className="p-6 rounded-3xl bg-[var(--color-surface)] border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#10B981]" />
                    <span>Location & DISCOM Grid Policy</span>
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    {currentStateRule.stateName}
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">State / Union Territory *</label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[var(--color-surface)] font-bold text-slate-900 focus:border-[#10B981] focus:outline-hidden"
                    >
                      {STATE_SUBSIDY_DATABASE.map((s) => (
                        <option key={s.stateCode} value={s.stateCode}>
                          {s.stateName} ({s.stateCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Distribution Utility (DISCOM) *</label>
                    <select
                      value={selectedDiscom}
                      onChange={(e) => setSelectedDiscom(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[var(--color-surface)] font-bold text-slate-900 focus:border-[#10B981] focus:outline-hidden"
                    >
                      {currentStateRule.discoms.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">City / District</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Lucknow"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-[var(--color-surface)] font-bold text-slate-900 focus:border-[#10B981] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">PIN Code</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="e.g. 226010"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-[var(--color-surface)] font-bold text-slate-900 focus:border-[#10B981] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* State Rule Highlight Callout */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-[11px] text-emerald-950 leading-relaxed flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">State Subsidy Notification: </strong>
                      {currentStateRule.specialIncentives}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Box B: Monthly Electricity Bill & Tariff */}
              <Card className="p-6 rounded-3xl bg-[var(--color-surface)] border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#10B981]" />
                    <span>Average Monthly Electricity Bill</span>
                  </h3>
                  <span className="text-xs font-black text-slate-900">
                    ₹{monthlyBill.toLocaleString('en-IN')} / mo
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between font-bold text-slate-600">
                      <span>Adjust Monthly Bill (INR):</span>
                      <span className="text-slate-900 font-extrabold text-sm">
                        ₹{monthlyBill.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={customerType === 'Residential' ? 1000 : 10000}
                      max={customerType === 'Residential' ? 35000 : 1000000}
                      step={customerType === 'Residential' ? 500 : 5000}
                      value={monthlyBill}
                      onChange={(e) => setMonthlyBill(Number(e.target.value))}
                      className="w-full accent-[#10B981] cursor-pointer"
                    />
                  </div>

                  {/* Quick Bill Presets */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500">Quick Bill Presets:</span>
                    <div className="flex flex-wrap gap-2">
                      {billPresets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setMonthlyBill(preset)}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                            monthlyBill === preset
                              ? 'bg-[#0F172A] text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          ₹{(preset >= 100000 ? `${preset / 100000}L` : preset.toLocaleString('en-IN'))}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tariff & Sanctioned Load Inputs */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Grid Tariff Rate (₹/Unit)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={tariffRate}
                        onChange={(e) => setTariffRate(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-[var(--color-surface)] font-bold text-slate-900 focus:border-[#10B981] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Sanctioned Load (kW)</label>
                      <input
                        type="number"
                        value={sanctionedLoad}
                        onChange={(e) => setSanctionedLoad(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-[var(--color-surface)] font-bold text-slate-900 focus:border-[#10B981] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between">
                    <span>Estimated Monthly Consumption:</span>
                    <strong className="text-slate-900">{result.monthlyUnits} Units (kWh) / month</strong>
                  </div>
                </div>
              </Card>

            </div>

            {/* Box C: Rooftop Characteristics & Usable Space */}
            <Card className="p-6 rounded-3xl bg-[var(--color-surface)] border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#10B981]" />
                  <span>Rooftop Surface Area & Mounting Structure</span>
                </h3>
                <span className="text-xs font-black text-slate-900">
                  {availableRoofArea.toLocaleString('en-IN')} Sq.Ft Total
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                
                {/* Roof Area Slider & Presets */}
                <div className="space-y-3 lg:col-span-2">
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>Available Rooftop Footprint:</span>
                    <span className="text-slate-900 font-extrabold text-sm">
                      {availableRoofArea.toLocaleString('en-IN')} Sq.Ft (~{Math.round(availableRoofArea / 9)} Sq.Yards)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={customerType === 'Residential' ? 200 : 1000}
                    max={customerType === 'Residential' ? 10000 : 200000}
                    step={customerType === 'Residential' ? 100 : 1000}
                    value={availableRoofArea}
                    onChange={(e) => setAvailableRoofArea(Number(e.target.value))}
                    className="w-full accent-[#10B981] cursor-pointer"
                  />

                  <div className="flex flex-wrap gap-2 pt-1">
                    {roofPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAvailableRoofArea(preset)}
                        className={`px-3 py-1 rounded-xl font-extrabold text-xs transition-all ${
                          availableRoofArea === preset
                            ? 'bg-[#0F172A] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {preset >= 10000 ? `${preset / 1000}k sq.ft` : `${preset} sq.ft`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Roof Type & Shadow Factor */}
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Roof Material & Surface</label>
                    <select
                      value={roofType}
                      onChange={(e) => setRoofType(e.target.value as RoofType)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[var(--color-surface)] font-bold text-slate-900 focus:border-[#10B981] focus:outline-hidden"
                    >
                      <option value="RCC Slab">Flat RCC Concrete Slab</option>
                      <option value="Metal Sheet">Industrial Trapezoidal Metal Shed</option>
                      <option value="Asbestos Sheet">Asbestos / Fiber Sheet</option>
                      <option value="Tiled Roof">Sloped Mangalore Tile Roof</option>
                      <option value="Ground Mount">Open Barren Land (Ground Mount)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Shadow-Free Sunlight Area: <span className="text-[#10B981]">{shadowFreePercentage}%</span>
                    </label>
                    <input
                      type="range"
                      min={50}
                      max={100}
                      step={5}
                      value={shadowFreePercentage}
                      onChange={(e) => setShadowFreePercentage(Number(e.target.value))}
                      className="w-full accent-[#10B981] cursor-pointer"
                    />
                  </div>
                </div>

              </div>
            </Card>

            {/* Step 1 CTA Button */}
            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setCurrentStep(2)}
                className="bg-[#0F172A] hover:bg-slate-800 text-white font-black text-xs px-8 shadow-md"
                rightIcon={<ArrowRight className="w-4 h-4 text-[#10B981]" />}
              >
                Proceed to System Sizing Engine (Step 2 of 3)
              </Button>
            </div>

          </div>
        )}

        {/* =========================================================================
            STEP 2: SYSTEM SIZING ENGINE CALCULATION
           ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Sizing Hero Display Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Capacity Card */}
              <Card className="p-6 rounded-3xl bg-[#0F172A] text-white space-y-2 border-0 shadow-lg relative overflow-hidden">
                <span className="text-[10px] font-mono text-[#10B981] font-bold uppercase tracking-widest block">
                  Recommended System Sizing
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white">
                  {result.requiredKWp} <span className="text-lg text-slate-400 font-normal">kWp</span>
                </div>
                <p className="text-xs text-slate-300 pt-1">
                  Engineered to offset 100% of your monthly {result.monthlyUnits} kWh electricity consumption.
                </p>
                <div className="absolute right-4 bottom-4 opacity-10">
                  <Sun className="w-24 h-24 text-white" />
                </div>
              </Card>

              {/* Hardware Count Card */}
              <Card className="p-6 rounded-3xl bg-[var(--color-surface)] border border-slate-200 shadow-xs space-y-2">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest block">
                  Module & Hardware Matrix
                </span>
                <div className="text-3xl sm:text-4xl font-black text-slate-900">
                  {panelCount} <span className="text-lg text-slate-500 font-normal">Panels</span>
                </div>
                <p className="text-xs text-slate-600 pt-1">
                  580Wp N-Type Bifacial TOPCon Tier-1 Modules with dual-glass high albedo gain.
                </p>
              </Card>

              {/* Monthly Generation Card */}
              <Card className="p-6 rounded-3xl bg-[var(--color-surface)] border border-slate-200 shadow-xs space-y-2">
                <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase tracking-widest block">
                  Estimated Clean Generation
                </span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-800">
                  {result.monthlyGenerationUnits} <span className="text-lg text-slate-500 font-normal">Units / mo</span>
                </div>
                <p className="text-xs text-slate-600 pt-1">
                  ~{(result.monthlyGenerationUnits * 12).toLocaleString('en-IN')} kWh units per year (4.2 peak sun hours).
                </p>
              </Card>

            </div>

            {/* Technical BOS & Structural Feasibility Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Technical Bill of Materials (BOS) */}
              <div className="lg:col-span-7 bg-[var(--color-surface)] rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  <span>Technical Balance of System (BOS) Architecture</span>
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div>
                      <div className="font-extrabold text-slate-900">PV Module Technology</div>
                      <div className="text-slate-500 text-[11px]">N-Type Glass-Glass TOPCon (22.5%+ Efficiency)</div>
                    </div>
                    <span className="font-mono font-bold text-slate-800">{panelCount} × 580Wp</span>
                  </div>

                  <div className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div>
                      <div className="font-extrabold text-slate-900">Grid-Tie String Inverter</div>
                      <div className="text-slate-500 text-[11px]">Multi-MPPT High Yield with Wi-Fi Cloud Telemetry</div>
                    </div>
                    <span className="font-mono font-bold text-emerald-800">{inverterSpecification}</span>
                  </div>

                  <div className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div>
                      <div className="font-extrabold text-slate-900">Mounting Structure</div>
                      <div className="text-slate-500 text-[11px]">Hot-Dip Galvanized (80μm HDG) / Anodized Al</div>
                    </div>
                    <span className="font-bold text-slate-800">{structureMounting}</span>
                  </div>

                  <div className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div>
                      <div className="font-extrabold text-slate-900">Surge & Grounding Protection</div>
                      <div className="text-slate-500 text-[11px]">Class-II Type-2 SPD + Chemical Earthing + Lightning Arrester</div>
                    </div>
                    <span className="font-bold text-emerald-800">IS 3043 / IEC 62305</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Rooftop Space Feasibility Gauge */}
              <div className="lg:col-span-5 bg-[var(--color-surface)] rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Sliders className="w-4 h-4 text-[#10B981]" />
                    <span>Rooftop Footprint & Utilization</span>
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">Space Needed for {result.requiredKWp} kWp:</span>
                      <span className="text-slate-900 font-extrabold">{estimatedRoofOccupied} Sq.Ft</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          roofUtilizationPct <= 75 ? 'bg-[#10B981]' : roofUtilizationPct <= 95 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, roofUtilizationPct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Occupying {roofUtilizationPct}% of your {availableRoofArea} sq.ft roof</span>
                      <span>{availableRoofArea - estimatedRoofOccupied} sq.ft remaining</span>
                    </div>
                  </div>

                  {/* Environmental Footprint Box */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2 text-xs">
                    <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                      <Leaf className="w-4 h-4 text-[#10B981]" />
                      <span>Environmental ESG Impact</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">CO₂ Emissions Offset:</span>
                        <strong className="text-emerald-900 text-sm font-black">{result.co2OffsetTonsPerYear} MT / yr</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Trees Planted Equivalent:</span>
                        <strong className="text-emerald-900 text-sm font-black">{result.treesEquivalent} Trees / yr</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 block text-center">
                    All sizing follows MNRE ALMM List-I & CEA Grid Connectivity Regulations.
                  </span>
                </div>
              </div>

            </div>

            {/* Step Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-bold border-slate-300"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to User Inputs
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={() => setCurrentStep(3)}
                className="bg-[#0F172A] hover:bg-slate-800 text-white font-black text-xs px-8 shadow-md"
                rightIcon={<ArrowRight className="w-4 h-4 text-[#10B981]" />}
              >
                Proceed to Financial & Subsidy Engine (Step 3 of 3)
              </Button>
            </div>

          </div>
        )}

        {/* =========================================================================
            STEP 3: FINANCIAL & SUBSIDY ENGINE INTEGRATION
           ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Financial Overview Hero Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Gross EPC Price */}
              <Card className="p-5 rounded-3xl bg-[var(--color-surface)] border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">
                  Gross Turnkey EPC Cost
                </span>
                <div className="text-2xl font-black text-slate-900">
                  ₹{result.estimatedEPCPrice.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-slate-400 block">Supply, Installation & Net Metering</span>
              </Card>

              {/* Total Govt Subsidy */}
              <Card className="p-5 rounded-3xl bg-emerald-50 border border-emerald-100 shadow-xs space-y-1">
                <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold tracking-wider">
                  Total Eligible Subsidy
                </span>
                <div className="text-2xl font-black text-emerald-800">
                  -₹{result.totalSubsidy.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-emerald-700 block">
                  PM Surya Ghar + {currentStateRule.stateName}
                </span>
              </Card>

              {/* Net Investment */}
              <Card className="p-5 rounded-3xl bg-[#0F172A] text-white border-0 shadow-lg space-y-1">
                <span className="text-[10px] font-mono text-[#10B981] uppercase font-bold tracking-wider">
                  Net Customer Out-Of-Pocket
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  ₹{result.netCustomerCost.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-slate-400 block">After Direct DBT Subsidy Credit</span>
              </Card>

              {/* Payback Period */}
              <Card className="p-5 rounded-3xl bg-amber-50 border border-amber-100 shadow-xs space-y-1">
                <span className="text-[10px] font-mono text-amber-800 uppercase font-bold tracking-wider">
                  Estimated Payback Period
                </span>
                <div className="text-2xl font-black text-amber-900">
                  {result.paybackPeriodYears} <span className="text-sm font-normal text-slate-600">Years</span>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Annual Savings: ₹{result.annualSavings.toLocaleString('en-IN')}/yr
                </span>
              </Card>

            </div>

            {/* Financial Breakdown Navigation Tabs */}
            <div className="bg-[var(--color-surface)] rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Financial Summary & ROI', icon: TrendingUp },
                  { id: 'subsidy', label: 'Government Subsidy Split', icon: ShieldCheck },
                  { id: 'loan', label: 'Zero-Down Green Loan EMI', icon: DollarSign },
                  { id: 'cashflow', label: '25-Year Cumulative Savings', icon: Calendar },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = financialTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFinancialTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                        isActive
                          ? 'bg-[#0F172A] text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#10B981]' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: OVERVIEW */}
              {financialTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                      Yield & Investment Metrics
                    </h4>

                    <div className="space-y-2">
                      <div className="flex justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-600">Monthly Bill Reduction:</span>
                        <strong className="text-slate-900 font-extrabold">~90% to 100%</strong>
                      </div>
                      <div className="flex justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-600">First Year Electricity Bill Savings:</span>
                        <strong className="text-emerald-800 font-extrabold">₹{result.annualSavings.toLocaleString('en-IN')} / year</strong>
                      </div>
                      <div className="flex justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-600">25-Year Lifetime Net Profit:</span>
                        <strong className="text-slate-900 font-black">₹{result.lifetime25YearSavings.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-600">Levelized Cost of Solar Energy (LCOE):</span>
                        <strong className="text-emerald-800 font-extrabold">₹2.40 / Unit (vs ₹{tariffRate} Grid)</strong>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                      Action & Next Steps
                    </h4>
                    
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <p className="text-slate-600 leading-relaxed">
                        BuildEcoGroup manages end-to-end DISCOM net metering sanction, PM Surya Ghar portal subsidy filing, and structural engineering installation with a 25-year performance warranty.
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleShareOrCopy}
                          className="text-xs font-bold border-slate-300"
                          leftIcon={<Share2 className="w-3.5 h-3.5" />}
                        >
                          {copiedLink ? 'Copied to Clipboard!' : 'Share Sizing Report'}
                        </Button>

                        {onOpenDPRModal && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onOpenDPRModal(result)}
                            className="bg-[#0F172A] text-white text-xs font-bold"
                            leftIcon={<FileText className="w-3.5 h-3.5 text-[#10B981]" />}
                          >
                            View Full DPR Proposal
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SUBSIDY BREAKDOWN */}
              {financialTab === 'subsidy' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-950 space-y-1">
                    <div className="font-black text-sm">PM Surya Ghar: Muft Bijli Yojana & State Grants</div>
                    <p className="text-[11px] text-emerald-800">
                      Central government DBT subsidies are credited directly into your Aadhaar-linked bank account within 30 days of net-meter commissioning.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Central CFA Subsidy</span>
                      <div className="text-xl font-black text-slate-900">₹{result.cfaSubsidy.toLocaleString('en-IN')}</div>
                      <span className="text-[10px] text-slate-400 block">PM Surya Ghar National Portal</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">State Top-Up Subsidy</span>
                      <div className="text-xl font-black text-emerald-800">₹{result.stateSubsidy.toLocaleString('en-IN')}</div>
                      <span className="text-[10px] text-slate-400 block">{currentStateRule.stateName} State Portal</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1">
                      <span className="text-[10px] text-[#10B981] font-bold uppercase">Total Subsidy Benefit</span>
                      <div className="text-xl font-black text-white">₹{result.totalSubsidy.toLocaleString('en-IN')}</div>
                      <span className="text-[10px] text-slate-400 block">Total Grant Amount</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: GREEN SOLAR LOAN EMI */}
              {financialTab === 'loan' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                  <div className="lg:col-span-6 space-y-4">
                    <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                      Concessional Solar Loan Simulator (7% p.a.)
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between font-bold text-slate-600 mb-1">
                          <span>Down Payment (%):</span>
                          <span className="text-slate-900">{downPaymentPct}% (₹{Math.round(result.netCustomerCost * (downPaymentPct / 100)).toLocaleString('en-IN')})</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={50}
                          step={5}
                          value={downPaymentPct}
                          onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                          className="w-full accent-[#10B981] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-slate-600 mb-1">
                          <span>Loan Tenure (Years):</span>
                          <span className="text-slate-900">{loanTenureYears} Years ({loanTenureYears * 12} Months)</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          step={1}
                          value={loanTenureYears}
                          onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                          className="w-full accent-[#10B981] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-slate-600 mb-1">
                          <span>Interest Rate (% per annum):</span>
                          <span className="text-slate-900">{loanInterestRatePct}%</span>
                        </div>
                        <input
                          type="range"
                          min={6.0}
                          max={12.0}
                          step={0.25}
                          value={loanInterestRatePct}
                          onChange={(e) => setLoanInterestRatePct(Number(e.target.value))}
                          className="w-full accent-[#10B981] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 bg-slate-900 text-white p-5 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono text-[#10B981] uppercase font-bold tracking-wider">
                        Monthly EMI vs Current Power Bill
                      </span>

                      <div className="text-3xl font-black text-white">
                        ₹{loanMetrics.emi.toLocaleString('en-IN')} <span className="text-xs text-slate-400 font-normal">/ month</span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800 pt-3">
                        <div className="flex justify-between">
                          <span>Loan Principal:</span>
                          <strong className="text-white">₹{loanMetrics.principal.toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Your Current Monthly Power Bill:</span>
                          <strong className="text-rose-400">₹{monthlyBill.toLocaleString('en-IN')} / mo</strong>
                        </div>
                        <div className="flex justify-between font-extrabold text-[#10B981] pt-1">
                          <span>Net Monthly Cash Savings During Loan:</span>
                          <span>+₹{Math.max(0, monthlyBill - loanMetrics.emi).toLocaleString('en-IN')} / mo</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-tight">
                      * Concessional collateral-free loan provided by SBI, PNB, Canara Bank, and IREDA under PM Surya Ghar.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: 25-YEAR CASHFLOW */}
              {financialTab === 'cashflow' && (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                      25-Year Long-Term Financial Horizon
                    </h4>
                    <span className="text-slate-500">Factoring 0.5% module degradation/yr</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: '5-Year Cumulative Savings', value: Math.round(result.annualSavings * 5 * 0.98) },
                      { label: '10-Year Cumulative Savings', value: Math.round(result.annualSavings * 10 * 0.96) },
                      { label: '15-Year Cumulative Savings', value: Math.round(result.annualSavings * 15 * 0.94) },
                      { label: '25-Year Net Lifetime Wealth', value: result.lifetime25YearSavings },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold block">{item.label}</span>
                        <div className="text-base font-black text-slate-900">
                          ₹{(item.value / 100000).toFixed(2)} Lakhs
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* =========================================================================
                LEAD CAPTURE & SITE SURVEY DISPATCH
               ========================================================================= */}
            <div className="bg-[var(--color-surface)] rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    <span>Lock In Your Govt Subsidy & Book Feasibility Survey</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Our certified solar engineers will conduct shadow 3D Drone analysis and process your DISCOM net-meter application.
                  </p>
                </div>
              </div>

              {submittedFormId ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2 text-xs">
                  <div className="font-black text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    <span>Solar Sizing Dossier Successfully Dispatched!</span>
                  </div>
                  <p className="text-slate-700">
                    Your assessment reference is <strong className="font-mono">{submittedFormId}</strong>. An assigned technical EPC consultant will reach out via WhatsApp to confirm the site survey date in {city}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        placeholder="e.g. Shrinet Yadav"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-[var(--color-surface)] focus:border-[#10B981] font-bold text-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mobile / WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        value={leadPhone}
                        onChange={(e) => setLeadPhone(e.target.value)}
                        placeholder="e.g. +91 94150 12345"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-[var(--color-surface)] focus:border-[#10B981] font-bold text-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email Address (For PDF Proposal)</label>
                      <input
                        type="email"
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        placeholder="e.g. name@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-[var(--color-surface)] focus:border-[#10B981] font-bold text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                      <span>Zero Spam Guarantee • Direct Dedicated Solar Consultant</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="submit"
                        disabled={isSubmittingLead}
                        variant="primary"
                        size="md"
                        className="bg-[#0F172A] hover:bg-slate-800 text-white font-black text-xs px-6 shadow-md"
                        rightIcon={<Send className="w-3.5 h-3.5 text-[#10B981]" />}
                      >
                        {isSubmittingLead ? 'Registering...' : 'Book Free Site Survey & Lock Subsidy'}
                      </Button>

                      <a
                        href={`https://wa.me/917007254932?text=${encodeURIComponent(
                          `Hello BuildEcoGroup Solar Team, I just sized a ${result.requiredKWp} kWp (${customerType}) solar plant in ${city}, ${currentStateRule.stateName}. Monthly bill: ₹${monthlyBill}. Estimated cost: ₹${result.netCustomerCost}. I would like to schedule a site inspection.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#1EBE5D] transition-colors shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Step Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(2)}
                className="text-xs font-bold border-slate-300"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Sizing Engine
              </Button>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-xs font-bold text-[#10B981] hover:underline"
              >
                Start New Sizing Calculation ↑
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default SolarCalculator;
