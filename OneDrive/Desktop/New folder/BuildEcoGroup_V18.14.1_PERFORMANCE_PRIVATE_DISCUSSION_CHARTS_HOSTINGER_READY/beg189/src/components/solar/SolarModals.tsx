import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sun, 
  FileText, 
  Calendar, 
  Clock, 
  Phone, 
  Building2, 
  Download, 
  MapPin, 
  Sparkles,
  Zap,
  HelpCircle,
  Lock,
  DollarSign
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { STATE_SUBSIDY_DATABASE, calculateSolarSystem } from '../../lib/solarRegistry';
import { SolarCustomerType, RoofType } from '../../types/solar';

interface SolarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMonthlyBill?: number;
  initialState?: string;
  initialCapacityKw?: number;
  onOpenProposalReport?: (reportData: any) => void;
}

// =========================================================================
// MODAL 1: INSTANT QUICK QUOTE (Multi-Step with OTP simulation & PDF hook)
// =========================================================================
export const InstantQuickQuoteModal: React.FC<SolarModalProps> = ({
  isOpen,
  onClose,
  initialMonthlyBill = 4500,
  initialState = 'UP',
  onOpenProposalReport
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [pincode, setPincode] = useState('226010');
  const [monthlyBill, setMonthlyBill] = useState<number>(initialMonthlyBill);
  const [propertyType, setPropertyType] = useState<SolarCustomerType>('Residential');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const calculation = calculateSolarSystem(propertyType, monthlyBill, initialState);

  const handleSendOtp = () => {
    if (mobileNumber.length >= 10) {
      setIsOtpSent(true);
      setStep(3);
    }
  };

  const handleVerifyAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(4);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-[var(--color-surface)] rounded-3xl shadow-2xl border border-[var(--color-border)] overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-background)] border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-brown)]">
                Instant Solar Sizing Engine
              </div>
              <div className="text-sm font-extrabold text-[var(--color-text)]">
                Get Free Customized Solar Report (PDF)
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[#7A837C] hover:text-[var(--color-text)] hover:bg-[#D6E8F0]/50 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#D6E8F0] h-1">
          <div 
            className="bg-[var(--color-primary)] h-1 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text)]">Step 1 of 3: Electricity & Location</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Enter your average monthly bill to calculate ideal kW capacity and subsidy.</p>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Pincode / Location</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 226010, 400001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-[var(--color-text)]">Average Monthly Electricity Bill (₹)</label>
                    <span className="text-xs font-extrabold text-[var(--color-primary)]">₹{monthlyBill.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="500"
                    value={monthlyBill}
                    onChange={(e) => setMonthlyBill(Number(e.target.value))}
                    className="w-full accent-[#1697C4]"
                  />
                </div>

                {/* Sizing Preview Box */}
                <div className="p-3.5 bg-[var(--color-primary-subtle)] rounded-2xl border border-[#D4E8DC] text-xs flex justify-between items-center">
                  <div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">Estimated Recommended Size:</div>
                    <div className="text-sm font-extrabold text-[var(--color-primary)]">{calculation.requiredKWp} kW System</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[var(--color-text-muted)]">Max Govt Subsidy:</div>
                    <div className="text-sm font-extrabold text-[#F59E0B]">₹{calculation.totalSubsidy.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center bg-[var(--color-primary)] font-bold text-xs"
                  onClick={() => setStep(2)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Property Details
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text)]">Step 2 of 3: Property & Contact Info</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Select premise type and provide name for custom DPR preparation.</p>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">Premise Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Residential', 'Commercial', 'Industrial', 'Agricultural'] as SolarCustomerType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPropertyType(type)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                          propertyType === type
                            ? 'bg-[var(--color-primary)] text-white border-[#1697C4]'
                            : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border-strong)] hover:border-[#1697C4]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Mobile Number (For WhatsApp PDF Report)</label>
                  <div className="flex gap-2">
                    <span className="px-3 py-2.5 bg-[var(--color-background)] border border-[var(--color-border-strong)] rounded-xl text-xs font-bold text-[var(--color-text-muted)] flex items-center">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-1/3 justify-center text-xs"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-2/3 justify-center bg-[var(--color-primary)] font-bold text-xs"
                    onClick={handleSendOtp}
                    disabled={!fullName || mobileNumber.length < 10}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Verify & Get Quote
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleVerifyAndSubmit} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text)]">Step 3 of 3: Instant Mobile Verification</h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Enter 4-digit code sent to <span className="font-bold text-[var(--color-text)]">+91 {mobileNumber}</span> (or enter 2026 for demo).
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Enter Verification OTP</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 2026"
                    className="w-full text-center tracking-widest text-lg font-mono font-bold px-3.5 py-2.5 rounded-xl border border-[#1697C4] focus:outline-hidden bg-[var(--color-background)]"
                  />
                  <div className="text-[11px] text-[#7A837C] text-center mt-1">
                    Auto-verification token enabled for rapid PDF generation.
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full justify-center bg-[var(--color-primary)] font-bold text-xs"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Generating Engineering DPR...' : 'Download Custom Solar Report (PDF)'}
                </Button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 bg-[var(--color-primary-subtle)] text-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-[var(--color-text)]">Solar Proposal Ready!</h3>
                <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
                  Your customized DPR has been generated for {fullName}. A summary has been dispatched to +91 {mobileNumber}.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-4 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Recommended Solar Capacity:</span>
                  <span className="font-extrabold text-[var(--color-primary)]">{calculation.requiredKWp} kW TOPCon</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Total Estimated Cost:</span>
                  <span className="font-bold">₹{calculation.estimatedEPCPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#F59E0B] font-bold">
                  <span>Eligible PM Surya Subsidy:</span>
                  <span>- ₹{calculation.totalSubsidy.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--color-border)] text-sm font-extrabold text-[var(--color-primary)]">
                  <span>Net Payable Cost:</span>
                  <span>₹{calculation.netCustomerCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[var(--color-text-muted)]">
                  <span>Estimated Payback Period:</span>
                  <span className="font-bold text-[var(--color-text)]">{calculation.paybackPeriodYears} Years</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1 justify-center bg-[var(--color-primary)] font-bold text-xs"
                  onClick={() => {
                    if (onOpenProposalReport) {
                      onOpenProposalReport({
                        clientName: fullName || 'Valued Client',
                        phone: mobileNumber,
                        calculation,
                        propertyType,
                        pincode
                      });
                    }
                    onClose();
                  }}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  View / Print Full DPR
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1 justify-center text-xs"
                  onClick={onClose}
                >
                  Close Window
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// MODAL 2: SUBSIDY ELIGIBILITY CHECKER (PM Surya Ghar & State Subsidies)
// =========================================================================
export const SubsidyEligibilityCheckerModal: React.FC<SolarModalProps> = ({
  isOpen,
  onClose,
  initialState = 'UP'
}) => {
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedDiscom, setSelectedDiscom] = useState('');
  const [consumerNumber, setConsumerNumber] = useState('');
  const [sanctionedLoadKw, setSanctionedLoadKw] = useState<number>(3);
  const [isRoofOwner, setIsRoofOwner] = useState(true);
  const [isEvaluated, setIsEvaluated] = useState(false);

  if (!isOpen) return null;

  const stateRule = STATE_SUBSIDY_DATABASE.find(s => s.stateCode === selectedState) || STATE_SUBSIDY_DATABASE[0];

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluated(true);
  };

  const calculatedSystem = calculateSolarSystem('Residential', sanctionedLoadKw * 1000, selectedState);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-3xl shadow-2xl border border-[var(--color-border)] overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-background)] border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-brown)]">
                National Subsidy Portal Sync
              </div>
              <div className="text-sm font-extrabold text-[var(--color-text)]">
                PM Surya Ghar Subsidy Eligibility Slabs
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[#7A837C] hover:text-[var(--color-text)] hover:bg-[#D6E8F0]/50 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!isEvaluated ? (
            <form onSubmit={handleEvaluate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Select State / Region</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedDiscom('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden bg-[var(--color-surface)]"
                >
                  {STATE_SUBSIDY_DATABASE.map(s => (
                    <option key={s.stateCode} value={s.stateCode}>{s.stateName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Electricity Distribution Company (DISCOM)</label>
                <select
                  value={selectedDiscom}
                  onChange={(e) => setSelectedDiscom(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden bg-[var(--color-surface)]"
                >
                  <option value="">-- Select Your Discom --</option>
                  {stateRule.discoms.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Sanctioned Load (kW)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={sanctionedLoadKw}
                    onChange={(e) => setSanctionedLoadKw(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Consumer Account No. (Opt.)</label>
                  <input
                    type="text"
                    value={consumerNumber}
                    onChange={(e) => setConsumerNumber(e.target.value)}
                    placeholder="e.g. 1029384756"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="roofOwner"
                  checked={isRoofOwner}
                  onChange={(e) => setIsRoofOwner(e.target.checked)}
                  className="rounded-md accent-[#1697C4] w-4 h-4"
                />
                <label htmlFor="roofOwner" className="text-xs text-[var(--color-text-secondary)]">
                  I confirm ownership or clear legal access to rooftop / terrace area.
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center bg-[var(--color-primary)] font-bold text-xs"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Check Approved Subsidy Slabs
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-[var(--color-primary-subtle)] rounded-2xl border border-[#D4E8DC] space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="primary" size="sm">
                    {stateRule.stateName} Direct Benefit Transfer
                  </Badge>
                  <span className="text-[10px] font-bold text-[var(--color-primary)]">100% ELIGIBLE</span>
                </div>

                <div className="text-xl font-extrabold text-[var(--color-primary)]">
                  Total Approved Subsidy: ₹{calculatedSystem.totalSubsidy.toLocaleString('en-IN')}
                </div>

                <div className="space-y-1.5 text-xs text-[var(--color-text-secondary)] border-t border-[var(--color-border-strong)]/50 pt-2">
                  <div className="flex justify-between">
                    <span>Central CFA Subsidy (PM Surya Ghar):</span>
                    <span className="font-bold">₹{calculatedSystem.cfaSubsidy.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>State Top-Up Subsidy ({stateRule.stateName}):</span>
                    <span className="font-bold">₹{calculatedSystem.stateSubsidy.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-brand-brown)]">
                    <span>Eligible Capacity:</span>
                    <span className="font-bold">{sanctionedLoadKw} kWp System</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-[var(--color-text-muted)] bg-[var(--color-background)] p-3 rounded-xl border border-[var(--color-border)]">
                <div className="font-bold text-[var(--color-text)] mb-1">State Scheme Note:</div>
                {stateRule.specialIncentives}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="md"
                  className="w-1/2 justify-center text-xs"
                  onClick={() => setIsEvaluated(false)}
                >
                  Change Input
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="w-1/2 justify-center bg-[var(--color-primary)] font-bold text-xs"
                  onClick={onClose}
                >
                  Apply via BuildEcoGroup
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// MODAL 3: C&I ENTERPRISE RFQ & TECHNO-COMMERCIAL DPR BUILDER
// =========================================================================
export const CIEterpriseRFQModal: React.FC<SolarModalProps> = ({
  isOpen,
  onClose
}) => {
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [connectedLoadKva, setConnectedLoadKva] = useState<string>('150');
  const [monthlyBillLakhs, setMonthlyBillLakhs] = useState<string>('2.5');
  const [roofAreaSqFt, setRoofAreaSqFt] = useState<string>('15000');
  const [financialModel, setFinancialModel] = useState<'CAPEX' | 'OPEX_RESCO' | 'OPEN_ACCESS'>('CAPEX');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-[var(--color-surface)] rounded-3xl shadow-2xl border border-[var(--color-border)] overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#191C1A] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#F59E0B]">
                Enterprise EPC Pipeline
              </div>
              <div className="text-sm font-extrabold text-white">
                Request C&I Techno-Commercial DPR (Detailed Project Report)
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[var(--color-surface)]/10 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Company / Enterprise Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Industrial Solutions Ltd."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="e.g. 09AAACB1234D1Z2"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Connected Load (kVA/HT)</label>
                  <input
                    type="number"
                    value={connectedLoadKva}
                    onChange={(e) => setConnectedLoadKva(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Avg Monthly Bill (₹ Lakhs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={monthlyBillLakhs}
                    onChange={(e) => setMonthlyBillLakhs(e.target.value)}
                    placeholder="e.g. 2.5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Rooftop / Shed Area (Sq.Ft)</label>
                  <input
                    type="number"
                    value={roofAreaSqFt}
                    onChange={(e) => setRoofAreaSqFt(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">Preferred Investment & Energy Model</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CAPEX', label: '100% CAPEX (Own & Save)', sub: '40% Tax AD Write-off' },
                    { id: 'OPEX_RESCO', label: 'OPEX / RESCO (Zero Capex)', sub: 'Pay-per-unit PPA model' },
                    { id: 'OPEN_ACCESS', label: 'Open Access (>100kW)', sub: 'Off-site solar procurement' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setFinancialModel(m.id as any)}
                      className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                        financialModel === m.id
                          ? 'bg-[var(--color-primary)] text-white border-[#1697C4]'
                          : 'bg-[var(--color-background)] text-[var(--color-text-secondary)] border-[var(--color-border-strong)]'
                      }`}
                    >
                      <div className="font-bold">{m.label}</div>
                      <div className="text-[10px] opacity-80">{m.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Key Account Contact Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Vice President Infrastructure"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Direct Phone / Mobile</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center bg-[var(--color-primary)] font-bold text-xs"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Request Techno-Commercial DPR (24-Hour SLA)
              </Button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-[var(--color-primary-subtle)] text-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[var(--color-text)]">Enterprise DPR Request Confirmed</h3>
                <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto mt-1">
                  Assigned Senior EPC Principal Architect to <span className="font-bold text-[var(--color-text)]">{companyName}</span>. Your high-priority commercial feasibility study is being generated.
                </p>
              </div>
              <div className="p-3 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] text-xs inline-block">
                Reference Docket: <span className="font-mono font-bold text-[var(--color-primary)]">BEG-CI-DPR-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div>
                <Button
                  variant="outline"
                  size="md"
                  onClick={onClose}
                  className="text-xs"
                >
                  Close & Continue Browsing
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// MODAL 4: FREE ENGINEERING SITE SURVEY BOOKING (Calendar & Slot Sync)
// =========================================================================
export const SiteSurveyBookingModal: React.FC<SolarModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-09-05');
  const [selectedSlot, setSelectedSlot] = useState<'Morning (09:00 AM - 01:00 PM)' | 'Afternoon (02:00 PM - 06:00 PM)'>('Morning (09:00 AM - 01:00 PM)');
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isBooked, setIsBooked] = useState(false);

  if (!isOpen) return null;

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-3xl shadow-2xl border border-[var(--color-border)] overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-background)] border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-brown)]">
                Physical Roof Audit & Shadow Analysis
              </div>
              <div className="text-sm font-extrabold text-[var(--color-text)]">
                Book Free Technical Site Visit
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[#7A837C] hover:text-[var(--color-text)] hover:bg-[#D6E8F0]/50 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!isBooked ? (
            <form onSubmit={handleBook} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Time Slot</label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden bg-[var(--color-surface)]"
                  >
                    <option value="Morning (09:00 AM - 01:00 PM)">Morning (09:00 AM - 01:00 PM)</option>
                    <option value="Afternoon (02:00 PM - 06:00 PM)">Afternoon (02:00 PM - 06:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Full Site Address & Landmark</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot/House No., Colony, Near Landmark, City..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] space-y-1">
                <div className="font-bold text-[var(--color-text)]">What is included in the Free Site Visit:</div>
                <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>3D Digital Shadow Analysis with Solar Pathfinder</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>Structural Load-bearing RCC / Metal Sheet assessment</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>DISCOM Metering & Single-Line Earthing plan</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center bg-[var(--color-primary)] font-bold text-xs"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Confirm Free Engineering Site Visit
              </Button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-[var(--color-primary-subtle)] text-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[var(--color-text)]">Site Visit Confirmed!</h3>
                <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto mt-1">
                  Our certified Solar Field Engineer has been scheduled for <span className="font-bold text-[var(--color-text)]">{selectedDate} ({selectedSlot})</span>.
                </p>
              </div>
              <div className="p-3 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] text-xs">
                Engineer Assigned: <span className="font-bold text-[var(--color-primary)]">Er. Vivek Verma (Field Supervisor - BuildEcoGroup)</span>
              </div>
              <div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={onClose}
                  className="bg-[var(--color-primary)] text-xs font-bold"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
