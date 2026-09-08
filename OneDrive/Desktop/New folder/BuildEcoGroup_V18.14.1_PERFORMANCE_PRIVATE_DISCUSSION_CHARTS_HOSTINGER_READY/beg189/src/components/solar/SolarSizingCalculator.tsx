import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  Calendar,
  Download,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AppIcon } from '../ui/AppIcon';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { 
  STATE_SUBSIDY_DATABASE, 
  calculateSolarSystem 
} from '../../lib/solarRegistry';
import { SolarCustomerType, RoofType } from '../../types/solar';

interface SolarSizingCalculatorProps {
  onOpenQuickQuote: () => void;
  onOpenSubsidyChecker: () => void;
  onOpenSiteSurvey: () => void;
  onOpenDPRModal?: (calcResult: any) => void;
}

export const SolarSizingCalculator: React.FC<SolarSizingCalculatorProps> = ({
  onOpenQuickQuote,
  onOpenSubsidyChecker,
  onOpenSiteSurvey,
  onOpenDPRModal
}) => {
  // Input parameters state
  const [customerType, setCustomerType] = useState<SolarCustomerType>('Residential');
  const [monthlyBill, setMonthlyBill] = useState<number>(4500);
  const [selectedState, setSelectedState] = useState<string>('UP');
  const [tariffRate, setTariffRate] = useState<number>(7.5);
  const [availableRoofArea, setAvailableRoofArea] = useState<number>(650);
  const [roofType, setRoofType] = useState<RoofType>('RCC Slab');
  const [activeTab, setActiveTab] = useState<'financial' | 'roof_mapping' | 'cashflow'>('financial');

  // Sync default tariff on customerType change
  const handleCustomerTypeChange = (type: SolarCustomerType) => {
    setCustomerType(type);
    if (type === 'Residential') {
      setTariffRate(7.5);
      if (monthlyBill > 20000) setMonthlyBill(5500);
    } else if (type === 'Commercial' || type === 'Industrial') {
      setTariffRate(9.5);
      if (monthlyBill < 15000) setMonthlyBill(35000);
    } else {
      setTariffRate(5.0);
      setMonthlyBill(8000);
    }
  };

  // Perform calculations
  const result = useMemo(() => {
    return calculateSolarSystem(
      customerType,
      monthlyBill,
      selectedState,
      tariffRate,
      availableRoofArea,
      roofType
    );
  }, [customerType, monthlyBill, selectedState, tariffRate, availableRoofArea, roofType]);

  const stateRule = STATE_SUBSIDY_DATABASE.find(s => s.stateCode === selectedState) || STATE_SUBSIDY_DATABASE[0];

  return (
    <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] shadow-sm overflow-hidden">
      
      {/* Top Banner Header */}
      <div className="px-6 py-5 bg-[var(--color-background)] border-b border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
            <span className="text-[11px] font-bold text-[var(--color-brand-brown)] uppercase tracking-wider">
              Mathematical Sizing Engine • CUF 17.5% • 4.2 Sun Hours
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--color-text)]">
            Real-Time Solar Sizing & 25-Year ROI Forecast
          </h2>
        </div>

        {/* Premise Switcher */}
        <div className="flex bg-[#D6E8F0]/60 p-1 rounded-2xl">
          {(['Residential', 'Commercial', 'Industrial', 'Agricultural'] as SolarCustomerType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleCustomerTypeChange(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                customerType === type
                  ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        
        {/* LEFT COLUMN: Interactive Parameter Inputs */}
        <div className="lg:col-span-5 p-6 sm:p-7 border-b lg:border-b-0 lg:border-r border-[var(--color-border)] space-y-6 bg-[#FCFDFB]">
          
          <div className="space-y-4">
            <div className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center justify-between">
              <span>Input Parameters</span>
              <button
                type="button"
                onClick={() => {
                  setMonthlyBill(customerType === 'Residential' ? 4500 : 35000);
                  setTariffRate(customerType === 'Residential' ? 7.5 : 9.5);
                  setSelectedState('UP');
                }}
                className="text-[11px] text-[#7A837C] hover:text-[var(--color-primary)] flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* 1. Monthly Electricity Bill */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-[var(--color-text)]">Monthly Electricity Bill</label>
                <span className="font-extrabold text-sm text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-0.5 rounded-md border border-[#D4E8DC]">
                  ₹{monthlyBill.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={customerType === 'Residential' ? 1000 : 10000}
                max={customerType === 'Residential' ? 30000 : 500000}
                step={customerType === 'Residential' ? 500 : 5000}
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(Number(e.target.value))}
                className="w-full accent-[#1697C4]"
              />
              <div className="flex justify-between text-[10px] text-[#7A837C]">
                <span>₹{customerType === 'Residential' ? '1,000' : '10,000'}</span>
                <span>Est. ~{result.monthlyUnits} Units / month</span>
                <span>₹{customerType === 'Residential' ? '30,000+' : '5,00,000+'}</span>
              </div>
            </div>

            {/* 2. State Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[var(--color-text)]">Installation State & Grid Policy</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden bg-[var(--color-surface)] shadow-2xs"
              >
                {STATE_SUBSIDY_DATABASE.map((s) => (
                  <option key={s.stateCode} value={s.stateCode}>
                    {s.stateName} ({s.stateCode})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Tariff & Roof Area in Two Columns */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[var(--color-text)]">Average Tariff (₹/unit)</label>
                <input
                  type="number"
                  step="0.1"
                  min="3.0"
                  max="16.0"
                  value={tariffRate}
                  onChange={(e) => setTariffRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden bg-[var(--color-surface)]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[var(--color-text)]">Available Roof (Sq.Ft)</label>
                <input
                  type="number"
                  step="50"
                  min="100"
                  value={availableRoofArea}
                  onChange={(e) => setAvailableRoofArea(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden bg-[var(--color-surface)]"
                />
              </div>
            </div>

            {/* 4. Roof Type */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[var(--color-text)]">Roof Structure Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['RCC Slab', 'Tin Shed / Metal Sheet', 'Ground / Open Plot'] as RoofType[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoofType(r)}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      roofType === r
                        ? 'bg-[var(--color-primary)] text-white border-[#1697C4]'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border-strong)] hover:border-[#1697C4]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* State Subsidy Info Callout */}
            <div className="p-3 bg-[var(--color-primary-subtle)] rounded-2xl border border-[#D4E8DC] text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[var(--color-primary)]">
                <ShieldCheck className="w-4 h-4" />
                <span>{stateRule.stateName} Subsidy Slab</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] leading-tight">
                {stateRule.specialIncentives}
              </p>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Sizing Outputs & Tabs */}
        <div className="lg:col-span-7 p-6 sm:p-7 space-y-6 flex flex-col justify-between">
          
          <div className="space-y-6">
            
            {/* Nav Tabs */}
            <div className="flex border-b border-[var(--color-border)] pb-2 gap-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('financial')}
                className={`pb-2 border-b-2 transition-all ${
                  activeTab === 'financial'
                    ? 'border-[#1697C4] text-[var(--color-primary)]'
                    : 'border-transparent text-[#7A837C] hover:text-[var(--color-text)]'
                }`}
              >
                Financial & System Sizing
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cashflow')}
                className={`pb-2 border-b-2 transition-all ${
                  activeTab === 'cashflow'
                    ? 'border-[#1697C4] text-[var(--color-primary)]'
                    : 'border-transparent text-[#7A837C] hover:text-[var(--color-text)]'
                }`}
              >
                25-Year Cumulative Yield
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('roof_mapping')}
                className={`pb-2 border-b-2 transition-all ${
                  activeTab === 'roof_mapping'
                    ? 'border-[#1697C4] text-[var(--color-primary)]'
                    : 'border-transparent text-[#7A837C] hover:text-[var(--color-text)]'
                }`}
              >
                Rooftop Solar Area Simulator
              </button>
            </div>

            {/* TAB 1: FINANCIAL & SIZING */}
            {activeTab === 'financial' && (
              <div className="space-y-5">
                
                {/* Hero Metric Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)]">
                    <div className="text-[11px] font-bold text-[#7A837C] uppercase tracking-wider">
                      Recommended System
                    </div>
                    <div className="text-2xl font-extrabold text-[var(--color-primary)] mt-1">
                      {result.requiredKWp} <span className="text-sm font-semibold">kWp</span>
                    </div>
                    <div className="text-[10px] text-[var(--color-text-muted)] mt-1">
                      Req. Area: ~{result.minRoofRequiredSqFt} sq.ft
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)]">
                    <div className="text-[11px] font-bold text-[#7A837C] uppercase tracking-wider">
                      Net Customer Cost
                    </div>
                    <div className="text-2xl font-extrabold text-[var(--color-text)] mt-1">
                      ₹{(result.netCustomerCost / 100000).toFixed(2)} <span className="text-sm font-semibold">Lakh</span>
                    </div>
                    <div className="text-[10px] text-[var(--color-primary)] font-bold mt-1">
                      Gross: ₹{result.estimatedEPCPrice.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-4 bg-[#FAF6EE] rounded-2xl border border-[#C6DEE8] col-span-2 sm:col-span-1">
                    <div className="text-[11px] font-bold text-[var(--color-brand-brown)] uppercase tracking-wider">
                      Total Subsidy (CFA+State)
                    </div>
                    <div className="text-2xl font-extrabold text-[#F59E0B] mt-1">
                      ₹{result.totalSubsidy.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-[var(--color-brand-brown)] font-semibold mt-1">
                      Central: ₹{result.cfaSubsidy.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Detailed Line Breakdown */}
                <div className="p-4 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] text-xs space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-text-muted)]">Monthly Solar Generation (Units):</span>
                    <span className="font-extrabold text-[var(--color-text)]">{result.monthlyGenerationUnits} kWh / month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-text-muted)]">Estimated Annual Electricity Savings:</span>
                    <span className="font-extrabold text-[var(--color-primary)]">₹{result.annualSavings.toLocaleString('en-IN')} / year</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-text-muted)]">Simple Payback Period:</span>
                    <span className="font-extrabold text-[var(--color-text)]">{result.paybackPeriodYears} Years</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-text-muted)]">25-Year Net Lifetime Returns:</span>
                    <span className="font-extrabold text-[var(--color-primary)]">₹{result.lifetime25YearSavings.toLocaleString('en-IN')}</span>
                  </div>

                  {result.adFirstYearBenefit && (
                    <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)] text-[var(--color-brand-brown)] font-bold">
                      <span>40% Accelerated Depreciation (AD) Year 1 Tax Shield:</span>
                      <span>₹{result.adFirstYearBenefit.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* ESG Environmental Impact */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[var(--color-primary-subtle)] rounded-2xl border border-[#D4E8DC] text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[var(--color-primary)]">Green Carbon Offset</div>
                      <div className="text-[11px] text-[var(--color-text-muted)]">
                        {result.co2OffsetTonsPerYear} Tons of CO₂ saved per year
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-[var(--color-primary)] bg-[var(--color-surface)] px-2.5 py-1 rounded-lg border border-[#D4E8DC] inline-flex items-center gap-1.5">
                    <AppIcon name="verified" size="xs" decorative />
                    Equivalent to {result.treesEquivalent} Mature Trees
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: 25-YEAR CASHFLOW */}
            {activeTab === 'cashflow' && (
              <div className="space-y-4 text-xs">
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  Solar is a capital asset that generates continuous recurring energy dividends. After amortizing your net investment in <strong>{result.paybackPeriodYears} years</strong>, the remaining 20+ years deliver virtually free electricity.
                </p>

                <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[var(--color-background)] text-[var(--color-text)] font-bold border-b border-[var(--color-border)]">
                      <tr>
                        <th className="p-2.5">Timeline</th>
                        <th className="p-2.5">Annual Units (kWh)</th>
                        <th className="p-2.5">Yearly Tariff Saving</th>
                        <th className="p-2.5">Cumulative Net Wealth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D6E8F0] text-[var(--color-text-secondary)]">
                      <tr>
                        <td className="p-2.5 font-bold">Year 1</td>
                        <td className="p-2.5">{result.monthlyGenerationUnits * 12}</td>
                        <td className="p-2.5">₹{result.annualSavings.toLocaleString('en-IN')}</td>
                        <td className="p-2.5 text-red-600 font-bold">- ₹{(result.netCustomerCost - result.annualSavings).toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">Year 3 (Breakeven Zone)</td>
                        <td className="p-2.5">{Math.round(result.monthlyGenerationUnits * 12 * 0.99)}</td>
                        <td className="p-2.5">₹{Math.round(result.annualSavings * 1.05).toLocaleString('en-IN')}</td>
                        <td className="p-2.5 text-[var(--color-primary)] font-bold">+ ₹{Math.round(result.annualSavings * 0.8).toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">Year 10</td>
                        <td className="p-2.5">{Math.round(result.monthlyGenerationUnits * 12 * 0.955)}</td>
                        <td className="p-2.5">₹{Math.round(result.annualSavings * 1.35).toLocaleString('en-IN')}</td>
                        <td className="p-2.5 text-[var(--color-primary)] font-bold">+ ₹{Math.round(result.annualSavings * 8.5).toLocaleString('en-IN')}</td>
                      </tr>
                      <tr className="bg-[var(--color-primary-subtle)]/50">
                        <td className="p-2.5 font-bold text-[var(--color-primary)]">Year 25 (End of Warranty)</td>
                        <td className="p-2.5 font-semibold">{Math.round(result.monthlyGenerationUnits * 12 * 0.88)}</td>
                        <td className="p-2.5 font-semibold">₹{Math.round(result.annualSavings * 1.95).toLocaleString('en-IN')}</td>
                        <td className="p-2.5 text-[var(--color-primary)] font-extrabold text-sm">+ ₹{result.lifetime25YearSavings.toLocaleString('en-IN')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: ROOF AREA SIMULATOR */}
            {activeTab === 'roof_mapping' && (
              <div className="space-y-4">
                <div className="p-6 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center mx-auto">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--color-text)]">Rooftop Layout & Shadow Polygon Simulator</h4>
                    <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto mt-1">
                      Our engineering field teams use satellite GIS photogrammetry & solar pathfinder meters to map exact shadows from trees and parapet walls.
                    </p>
                  </div>

                  <div className="p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] text-xs max-w-sm mx-auto space-y-1 text-left">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">Total Available Area:</span>
                      <span className="font-bold">{availableRoofArea} sq.ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">Calculated Solar Array Footprint:</span>
                      <span className="font-bold text-[var(--color-primary)]">{result.minRoofRequiredSqFt} sq.ft ({Math.round((result.minRoofRequiredSqFt / availableRoofArea) * 100)}% utilization)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">Roof Type Assessment:</span>
                      <span className="font-bold">{roofType}</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onOpenSiteSurvey}
                    leftIcon={<Calendar className="w-3.5 h-3.5" />}
                    className="bg-[var(--color-primary)] font-bold text-xs"
                  >
                    Schedule Physical 3D Roof Survey
                  </Button>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Action Ribbon */}
          <div className="pt-4 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={onOpenSubsidyChecker}
              className="text-xs font-bold border-[var(--color-border-strong)]"
              leftIcon={<ShieldCheck className="w-4 h-4 text-[var(--color-brand-brown)]" />}
            >
              Verify Discom Slabs
            </Button>

            <div className="flex gap-2 flex-1 sm:flex-initial">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  if (onOpenDPRModal) {
                    onOpenDPRModal(result);
                  } else {
                    onOpenQuickQuote();
                  }
                }}
                className="flex-1 sm:flex-initial text-xs font-bold text-[var(--color-primary)] border-[#1697C4]/30 hover:bg-[var(--color-primary-subtle)]"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Instant Proposal DPR
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={onOpenQuickQuote}
                className="flex-1 sm:flex-initial bg-[var(--color-primary)] text-xs font-bold"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Get Free Quote
              </Button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
