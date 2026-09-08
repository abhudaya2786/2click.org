import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  BarChart3, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  Download, 
  Info,
  ArrowRight,
  PieChart
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { calculateCapexBreakEven } from '../../lib/propertyData';
import { CapexCalculatorInputs } from '../../types/property';

interface FitOutCapexCalculatorProps {
  onOpenJvInquiry?: () => void;
  className?: string;
}

export const FitOutCapexCalculator: React.FC<FitOutCapexCalculatorProps> = ({
  onOpenJvInquiry,
  className = ''
}) => {
  // Input State
  const [initialFitoutCapex, setInitialFitoutCapex] = useState<number>(1500000); // 15 Lakhs
  const [expectedMonthlyGrossRent, setExpectedMonthlyGrossRent] = useState<number>(120000); // 1.2 Lakhs
  const [expectedOccupancyRatePct, setExpectedOccupancyRatePct] = useState<number>(90); // 90%
  const [landownerRevenueSharePct, setLandownerRevenueSharePct] = useState<number>(65); // 65% Landowner
  const [monthlyOperatingExpenses, setMonthlyOperatingExpenses] = useState<number>(12000); // 12k opex
  const [annualRentEscalationPct, setAnnualRentEscalationPct] = useState<number>(5); // 5% annual escalation

  const inputs: CapexCalculatorInputs = {
    initialFitoutCapex,
    expectedMonthlyGrossRent,
    expectedOccupancyRatePct,
    landownerRevenueSharePct,
    monthlyOperatingExpenses,
    annualRentEscalationPct
  };

  const results = useMemo(() => {
    return calculateCapexBreakEven(inputs);
  }, [inputs]);

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Header Banner */}
      <div className="bg-[#0F172A] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] text-xs font-mono font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Financial Engineering Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Fit-Out Capex Break-Even & Landowner Yield Modeling
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Simulate revenue-sharing dynamics between landowners and operators. Model initial fit-out capital expenditures, recurring operating expenses, rental escalations, and calculate exact cash-on-cash payback timelines.
          </p>
        </div>

        {/* Ambient background glow */}
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Calculator Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Parameters & Sliders */}
        <div className="lg:col-span-7 bg-[var(--color-surface)] rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#10B981]" />
              <span>Commercial Parameters</span>
            </h3>
            <span className="text-xs text-slate-400">Dynamic Adjustments</span>
          </div>

          <div className="space-y-5 text-xs">
            
            {/* Slider 1: Fitout Capex */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700">Initial Fit-Out Capex (INR):</span>
                <span className="text-slate-900 font-extrabold text-sm">
                  ₹{(initialFitoutCapex / 100000).toFixed(2)} Lakhs
                </span>
              </div>
              <input
                type="range"
                min={100000}
                max={10000000}
                step={50000}
                value={initialFitoutCapex}
                onChange={(e) => setInitialFitoutCapex(Number(e.target.value))}
                className="w-full accent-[#10B981] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹1 Lakh (Basic Furnishing)</span>
                <span>₹1 Crore (High-End Corporate/Retail)</span>
              </div>
            </div>

            {/* Slider 2: Expected Monthly Gross Rent */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700">Projected 100% Monthly Gross Rental:</span>
                <span className="text-slate-900 font-extrabold text-sm">
                  ₹{expectedMonthlyGrossRent.toLocaleString('en-IN')} / mo
                </span>
              </div>
              <input
                type="range"
                min={20000}
                max={1500000}
                step={10000}
                value={expectedMonthlyGrossRent}
                onChange={(e) => setExpectedMonthlyGrossRent(Number(e.target.value))}
                className="w-full accent-[#10B981] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹20,000 / mo</span>
                <span>₹15 Lakh / mo</span>
              </div>
            </div>

            {/* Two Column Sliders: Occupancy & Landowner Share */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              
              {/* Occupancy */}
              <div className="space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">Projected Occupancy:</span>
                  <span className="text-[#065F46] font-extrabold">{expectedOccupancyRatePct}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={5}
                  value={expectedOccupancyRatePct}
                  onChange={(e) => setExpectedOccupancyRatePct(Number(e.target.value))}
                  className="w-full accent-[#10B981] cursor-pointer"
                />
              </div>

              {/* Landowner Share */}
              <div className="space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">Landowner Revenue Share:</span>
                  <span className="text-amber-700 font-extrabold">{landownerRevenueSharePct}%</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={85}
                  step={5}
                  value={landownerRevenueSharePct}
                  onChange={(e) => setLandownerRevenueSharePct(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Operator gets {100 - landownerRevenueSharePct}% to amortize capex
                </span>
              </div>

            </div>

            {/* Two Column Numbers: Opex & Annual Escalation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Monthly Operating Expenses (Opex)
                </label>
                <input
                  type="number"
                  value={monthlyOperatingExpenses}
                  onChange={(e) => setMonthlyOperatingExpenses(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[var(--color-surface)] text-xs font-bold text-slate-900 focus:border-[#10B981] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Annual Rent Escalation (% per year)
                </label>
                <input
                  type="number"
                  value={annualRentEscalationPct}
                  onChange={(e) => setAnnualRentEscalationPct(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[var(--color-surface)] text-xs font-bold text-slate-900 focus:border-[#10B981] focus:outline-hidden"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Calculated Yield & Payback Metrics */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          {/* Main Metric Cards */}
          <div className="bg-[var(--color-surface)] rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
              <span>Investment Return Metrics</span>
            </h3>

            {/* Break-even Hero Display */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-1 shadow-md">
              <span className="text-[10px] font-mono text-[#10B981] uppercase font-bold tracking-widest block">
                Capex Break-Even Payback Period
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white">
                {results.breakEvenYearsDisplay}
              </div>
              <span className="text-xs text-slate-400 block pt-1">
                Approx. {results.breakEvenMonths} operational months to 100% principal recovery
              </span>
            </div>

            {/* Metric Split */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1">
                <span className="text-[10px] text-[#065F46] font-bold block">Annualized Unlevered ROI:</span>
                <span className="text-xl font-black text-emerald-800">{results.unleveredRoiPct}%</span>
                <span className="text-[10px] text-slate-500 block">Operator Net Yield</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 space-y-1">
                <span className="text-[10px] text-amber-800 font-bold block">Landowner Monthly Share:</span>
                <span className="text-xl font-black text-amber-900">₹{results.landownerMonthlyShare.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-slate-500 block">Passive Escrow Payout</span>
              </div>
            </div>

            {/* Monthly Breakdown Rows */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Effective Occupancy Revenue:</span>
                <span className="font-extrabold text-slate-900">₹{results.effectiveMonthlyGross.toLocaleString('en-IN')} / mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operator Net Cashflow (Post Opex):</span>
                <span className="font-black text-emerald-800">₹{results.operatorMonthlyCashflow.toLocaleString('en-IN')} / mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Annual Net Operator Profit:</span>
                <span className="font-extrabold text-slate-900">₹{results.annualNetOperatorProfit.toLocaleString('en-IN')} / yr</span>
              </div>
            </div>

          </div>

          {/* Action Trigger Card */}
          <div className="bg-[#F8FAFC] rounded-3xl border border-slate-200 p-5 flex flex-col justify-between gap-3">
            <div className="text-xs">
              <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>Ready to Monetize Under Joint Venture?</span>
              </div>
              <p className="text-slate-500 mt-1">
                BuildEcoGroup funds up to 100% of the fit-out capex for eligible prime locations under verified revenue-share agreements.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={onOpenJvInquiry}
              className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs"
              rightIcon={<ArrowRight className="w-4 h-4 text-[#10B981]" />}
            >
              Submit Property for JV Feasibility Audit
            </Button>
          </div>

        </div>

      </div>

      {/* =========================================================================
          5-YEAR CASHFLOW PROJECTION TABLE
         ========================================================================= */}
      <div className="bg-[var(--color-surface)] rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#10B981]" />
              <span>5-Year Cumulative Cash Flow Projections</span>
            </h3>
            <span className="text-xs text-slate-500">
              Includes {annualRentEscalationPct}% annual rental escalation & 3% opex inflation
            </span>
          </div>

          <div className="text-xs text-slate-500">
            Initial Capex Invested: <strong className="text-slate-900">₹{(initialFitoutCapex).toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Timeline</th>
                <th className="p-3">Gross Collected</th>
                <th className="p-3">Landowner Escrow Payout</th>
                <th className="p-3">Operating Expenses</th>
                <th className="p-3">Operator Annual Net</th>
                <th className="p-3 text-right">Cumulative Net Cashflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.projections5Year.map((proj) => (
                <tr key={proj.year} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-extrabold text-slate-900">
                    Year {proj.year}
                  </td>
                  <td className="p-3 font-bold text-slate-800">
                    ₹{proj.grossRentCollected.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 font-semibold text-amber-700">
                    ₹{proj.landownerPayout.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-slate-500">
                    ₹{proj.operatingExpenses.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 font-bold text-emerald-800">
                    ₹{proj.operatorNetCashflow.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right">
                    <span className={`font-black text-xs px-2.5 py-1 rounded-lg ${
                      proj.cumulativeCashflow >= 0
                        ? 'bg-emerald-100 text-[#065F46]'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {proj.cumulativeCashflow >= 0 ? '+' : ''}₹{proj.cumulativeCashflow.toLocaleString('en-IN')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
