import React from 'react';
import { 
  X, 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  Sun, 
  Building2, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Zap,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { AppIcon } from '../ui/AppIcon';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SolarCalculationResult, SolarCustomerType } from '../../types/solar';

interface SolarProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData?: {
    clientName?: string;
    phone?: string;
    pincode?: string;
    propertyType?: SolarCustomerType;
    calculation: SolarCalculationResult;
  } | null;
}

export const SolarProposalModal: React.FC<SolarProposalModalProps> = ({
  isOpen,
  onClose,
  reportData
}) => {
  if (!isOpen || !reportData) return null;

  const { clientName = 'Valued Client', phone = '+91 98765 43210', pincode = '226010', propertyType = 'Residential', calculation } = reportData;

  const docketNumber = `BEG-DPR-${Math.floor(100000 + Math.random() * 900000)}`;
  const proposalDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const moduleCount = Math.ceil((calculation.requiredKWp * 1000) / 580);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-[var(--color-surface)] rounded-3xl shadow-2xl border border-[var(--color-border)] my-6 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-background)] border-b border-[var(--color-border)] print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[var(--color-brand-brown)] uppercase tracking-wider">
                Engineering Document Engine
              </span>
              <h3 className="text-sm font-extrabold text-[var(--color-text)]">
                Techno-Commercial Solar DPR Proposal
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs font-bold"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print / Save as PDF
            </Button>
            <button 
              onClick={onClose}
              className="p-1.5 text-[#7A837C] hover:text-[var(--color-text)] hover:bg-[#D6E8F0]/50 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE PROPOSAL CONTENT */}
        <div className="p-6 sm:p-10 space-y-8 max-h-[80vh] overflow-y-auto bg-[var(--color-surface)] text-[var(--color-text)]" id="printableSolarDPR">
          
          {/* Header Brand & Docket */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b-2 border-[#1697C4]">
            <div className="space-y-1">
              <div className="text-2xl font-black text-[var(--color-primary)] tracking-tight">
                BuildEcoGroup <span className="text-[var(--color-brand-brown)] font-light">Solar EPC</span>
              </div>
              <div className="text-xs text-[var(--color-text-muted)]">
                MNRE Channel Partner • ISO 9001:2015 Certified • DISCOM Empanelled
              </div>
            </div>

            <div className="text-left sm:text-right space-y-0.5 text-xs font-mono">
              <div className="text-[10px] text-[#7A837C] uppercase font-bold">Docket Reference:</div>
              <div className="text-sm font-bold text-[var(--color-primary)]">{docketNumber}</div>
              <div className="text-[var(--color-text-muted)]">Generated: {proposalDate}</div>
            </div>
          </div>

          {/* Client & System Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] text-xs">
            <div className="space-y-1.5">
              <span className="font-bold text-[var(--color-brand-brown)] uppercase text-[10px]">Client Details</span>
              <div className="text-sm font-bold text-[var(--color-text)]">{clientName}</div>
              <div className="text-[var(--color-text-muted)]">Phone: {phone}</div>
              <div className="text-[var(--color-text-muted)]">Pincode / Location: {pincode}</div>
              <div className="text-[var(--color-text-muted)]">Category: <span className="font-bold text-[var(--color-primary)]">{propertyType}</span></div>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-[var(--color-brand-brown)] uppercase text-[10px]">Engineered Capacity</span>
              <div className="text-sm font-bold text-[var(--color-primary)]">{calculation.requiredKWp} kWp Grid-Tie Solar PV</div>
              <div className="text-[var(--color-text-muted)]">Recommended Module: <span className="font-bold">{moduleCount} × 580Wp TOPCon Bifacial</span></div>
              <div className="text-[var(--color-text-muted)]">Required Shadow-Free Roof: ~{calculation.minRoofRequiredSqFt} Sq.Ft</div>
              <div className="text-[var(--color-text-muted)]">Estimated Generation: ~{calculation.monthlyGenerationUnits} kWh / month</div>
            </div>
          </div>

          {/* Sizing & Financial Matrix */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A837C]">
              Financial Investment & Subsidy Reconciliation
            </h4>

            <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[var(--color-background)] text-[var(--color-text)] font-bold border-b border-[var(--color-border)]">
                  <tr>
                    <th className="p-3">Financial Item</th>
                    <th className="p-3">Calculation Basis</th>
                    <th className="p-3 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D6E8F0] text-[var(--color-text-secondary)]">
                  <tr>
                    <td className="p-3 font-bold">Estimated Turnkey EPC Package</td>
                    <td className="p-3">{calculation.requiredKWp} kWp @ benchmark engineering rates</td>
                    <td className="p-3 text-right font-bold">₹{calculation.estimatedEPCPrice.toLocaleString('en-IN')}</td>
                  </tr>
                  {calculation.cfaSubsidy > 0 && (
                    <tr className="text-[var(--color-primary)]">
                      <td className="p-3 font-semibold">Less: Central CFA Subsidy (PM Surya Ghar)</td>
                      <td className="p-3">Direct DBT to Consumer Bank Account</td>
                      <td className="p-3 text-right font-bold">- ₹{calculation.cfaSubsidy.toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  {calculation.stateSubsidy > 0 && (
                    <tr className="text-[var(--color-primary)]">
                      <td className="p-3 font-semibold">Less: State Govt Top-Up Subsidy</td>
                      <td className="p-3">Direct State NEDA transfer</td>
                      <td className="p-3 text-right font-bold">- ₹{calculation.stateSubsidy.toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  <tr className="bg-[var(--color-primary-subtle)]/60 text-sm font-extrabold text-[var(--color-primary)]">
                    <td className="p-3.5">Net Out-of-Pocket Customer Investment</td>
                    <td className="p-3.5 text-xs font-normal">All-inclusive turnkey execution</td>
                    <td className="p-3.5 text-right">₹{calculation.netCustomerCost.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[var(--color-text)]">Estimated Annual Electricity Savings</td>
                    <td className="p-3">Based on ₹{calculation.averageTariff}/unit current DISCOM tariff</td>
                    <td className="p-3 text-right font-bold text-[var(--color-primary)]">₹{calculation.annualSavings.toLocaleString('en-IN')} / yr</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[var(--color-text)]">Simple Capital Payback Period</td>
                    <td className="p-3">Net Cost ÷ Annual Savings</td>
                    <td className="p-3 text-right font-bold text-[var(--color-text)]">{calculation.paybackPeriodYears} Years</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[var(--color-text)]">25-Year Cumulative Net Financial Return</td>
                    <td className="p-3">Factoring 0.5% module degradation curve</td>
                    <td className="p-3 text-right font-extrabold text-[var(--color-primary)]">₹{calculation.lifetime25YearSavings.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Itemized Bill of Quantities (BOQ) */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A837C]">
              Itemized Bill of Quantities (BOQ) Specifications
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { label: 'Solar PV Modules', val: 'Tier-1 N-Type TOPCon Dual-Glass Bifacial (580Wp+), 30-Yr Warranty' },
                { label: 'String Inverter', val: 'Multi-MPPT On-Grid Inverter with Wi-Fi Telemetry & Class-II SPD' },
                { label: 'Mounting Structure', val: 'Hot-Dip Galvanized (80 Micron) / Anodized Aluminum rated for 150 km/h wind' },
                { label: 'DC & AC Cabling', val: '4/6 sq.mm Annealed Tinned Copper UV-resistant Solar Cables (Polycab/Siechem)' },
                { label: 'Earthing & Lightning', val: 'Dual Chemical Copper-Bonded Gel Earthing + ESE Lightning Arrester' },
                { label: 'Net Metering Approval', val: 'End-to-end DISCOM sanction, meter testing, and sync commissioning' }
              ].map((item, i) => (
                <div key={i} className="p-3 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] space-y-0.5">
                  <div className="font-bold text-[var(--color-text)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>{item.label}</span>
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)] pl-5">{item.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental Impact */}
          <div className="p-4 bg-[var(--color-primary-subtle)] rounded-2xl border border-[#D4E8DC] flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-[var(--color-primary)]">Lifetime Carbon Emission Abatement</span>
              <div className="text-[11px] text-[var(--color-text-muted)]">
                This solar generator will offset <strong>{(calculation.co2OffsetTonsPerYear * 25).toFixed(1)} Tons of CO₂</strong> over 25 years.
              </div>
            </div>
            <div className="font-extrabold text-[var(--color-primary)] text-sm inline-flex items-center gap-1.5">
              <AppIcon name="verified" size="xs" decorative />
              {calculation.treesEquivalent * 25} Trees Equivalent
            </div>
          </div>

          {/* Footer Signature & Engineering Seal */}
          <div className="pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-xs">
            <div className="space-y-1 text-[var(--color-text-muted)]">
              <div className="font-bold text-[var(--color-text)]">BuildEcoGroup Clean Energy Engineering Services</div>
              <div>Direct Support: +91 70072 54932 • info@buildecogroup.com</div>
              <div>National Solar Mission & UP NEDA Empanelled Partner</div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="w-32 h-10 border-b border-[#191C1A] mb-1 flex items-end justify-center sm:justify-end text-[10px] font-mono text-[#7A837C]">
                [Digital Verified]
              </div>
              <div className="font-bold text-[var(--color-primary)]">Certified Solar Solution Architect</div>
              <div className="text-[10px] text-[#7A837C]">BuildEcoGroup Technical Directorate</div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions (Hidden on print) */}
        <div className="px-6 py-4 bg-[var(--color-background)] border-t border-[var(--color-border)] flex justify-end gap-3 print:hidden">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            className="text-xs"
          >
            Close
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handlePrint}
            className="bg-[var(--color-primary)] text-xs font-bold"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Print / Save DPR (PDF)
          </Button>
        </div>

      </div>
    </div>
  );
};
