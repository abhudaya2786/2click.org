import React, { useState } from 'react';
import { 
  Zap, 
  Sun, 
  BatteryCharging, 
  Calculator, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  FileCheck,
  TrendingDown,
  Building2,
  Sparkles,
  MapPin,
  CheckCircle,
  Eye,
  Layers,
  Droplet,
  Globe,
  Download,
  Calendar,
  Phone,
  HelpCircle,
  Scale,
  Award,
  Cpu
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageContainer } from '../components/ui/PageContainer';
import { PageHeroMedia } from '../components/ui/ResponsiveMedia';
import { UniversalCaseIntakeModal } from '../components/common/UniversalCaseIntakeModal';
import { SolarCalculator } from '../components/solar/SolarCalculator';
import { SolarSizingCalculator } from '../components/solar/SolarSizingCalculator';
import { SolarTopologiesSection } from '../components/solar/SolarTopologiesSection';
import { SolarCatalog } from '../components/solar/SolarCatalog';
import { HardwareDirectorySection } from '../components/solar/HardwareDirectorySection';
import { GovernmentSchemesHub } from '../components/solar/GovernmentSchemesHub';
import { 
  InstantQuickQuoteModal, 
  SubsidyEligibilityCheckerModal, 
  CIEterpriseRFQModal, 
  SiteSurveyBookingModal 
} from '../components/solar/SolarModals';
import { SolarProposalModal } from '../components/solar/SolarProposalModal';
import { SolarSystemTopology, SolarProductItem } from '../types/solar';

export const SolarUtilityPage: React.FC = () => {
  // Modal Triggers State
  const [isQuickQuoteOpen, setIsQuickQuoteOpen] = useState(false);
  const [isSubsidyCheckerOpen, setIsSubsidyCheckerOpen] = useState(false);
  const [isCiRfqOpen, setIsCiRfqOpen] = useState(false);
  const [isSiteSurveyOpen, setIsSiteSurveyOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalReportData, setProposalReportData] = useState<any>(null);

  // Universal Case Intake Modal State
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [intakeObjective, setIntakeObjective] = useState('PM Surya Ghar Solar Installation');
  const [calculatorView, setCalculatorView] = useState<'wizard' | 'quick'>('wizard');

  const handleOpenIntake = (objective: string, category: string = 'solar') => {
    setIntakeObjective(objective);
    setIsIntakeOpen(true);
  };

  const handleOpenDPR = (calcResult: any) => {
    setProposalReportData({
      clientName: 'Valued Client',
      phone: '+91 70072 54932',
      pincode: '226010',
      propertyType: 'Residential',
      calculation: calcResult
    });
    setIsProposalModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] space-y-16 py-8 sm:py-12">
      <PageContainer>
        
        {/* =========================================================================
            1. HERO SECTION & LIVE SOLAR PERFORMANCE METRICS
           ========================================================================= */}
        <section className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] p-6 sm:p-10 shadow-xs space-y-8">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
            <div className="inline-flex items-center gap-2">
              <Badge variant="primary" size="md" icon={<Sun className="w-3.5 h-3.5" />}>
                BuildEcoGroup Solar EPC & Aggregator Platform
              </Badge>
              <span className="text-xs font-mono font-bold text-[var(--color-brand-brown)] bg-[#FAF6EE] px-2.5 py-1 rounded-full border border-[#C6DEE8]">
                National PM Surya Ghar Portal Synced
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)]">
              <ShieldCheck className="w-4 h-4" />
              <span>DISCOM Empanelled • ALMM Verified • ISO 9001:2015</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-text)] tracking-tight leading-tight">
                Enterprise Solar EPC, <br className="hidden sm:inline" />
                <span className="text-[var(--color-primary)]">BESS Microgrids & Net Metering</span>
              </h1>
              
              <p className="text-sm sm:text-base text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
                Seamless digital solar journey for Residential, Commercial & Industrial (C&I), and Agricultural clients. Precision rooftop sizing, guaranteed central/state subsidies up to ₹1,08,000, 40% Accelerated Depreciation tax shields, and 25-year performance warranties.
              </p>

              {/* Primary Action Trigger Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsQuickQuoteOpen(true)}
                  className="bg-[var(--color-primary)] font-bold text-xs shadow-md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Get Instant Free Quote & PDF Report
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsSiteSurveyOpen(true)}
                  className="text-xs font-bold border-[var(--color-border-strong)] hover:border-[#1697C4]"
                  leftIcon={<Calendar className="w-4 h-4 text-[var(--color-brand-brown)]" />}
                >
                  Book Free Site Survey
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsCiRfqOpen(true)}
                  className="text-xs font-bold text-[var(--color-brand-brown)] border-[#C6DEE8] bg-[#FAF6EE] hover:bg-[#F3EDE2]"
                  leftIcon={<Building2 className="w-4 h-4" />}
                >
                  C&I Enterprise RFQ
                </Button>
              </div>
            </div>

            {/* Quick Live Performance Banner */}
            <div className="lg:col-span-4 space-y-4">
              <PageHeroMedia assetKey="solar_residential_rooftop" className="rounded-2xl" />
            <div className="bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-border)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">
                  National Subsidy Matrix 2026
                </span>
                <span className="text-[10px] font-mono text-[var(--color-primary)] font-bold bg-[var(--color-primary-subtle)] px-2 py-0.5 rounded-full">
                  DBT APPROVED
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">PM Surya Ghar Central CFA:</span>
                  <span className="font-bold text-[var(--color-primary)]">Up to ₹78,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">State Top-Up (e.g. UP NEDA):</span>
                  <span className="font-bold text-[var(--color-primary)]">Up to ₹30,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Combined Residential Subsidy:</span>
                  <span className="font-extrabold text-[#F59E0B]">₹1,08,000 Flat</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">C&I Accelerated Depreciation:</span>
                  <span className="font-bold text-[var(--color-text)]">40% Year 1 Write-off</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Green Open Access Limit:</span>
                  <span className="font-bold text-[var(--color-primary)]">100 kW Threshold</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-subtle)] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                <span>Tier-1 TopCon & Inverter 25-30 Year Linear Power Guarantee</span>
              </div>
            </div>
            </div>

          </div>

          {/* Quick Pillar Stat Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[var(--color-border)] text-center">
            <div className="p-3 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)]">
              <div className="text-xl sm:text-2xl font-black text-[var(--color-primary)]">45+ MWp</div>
              <div className="text-[11px] text-[var(--color-text-muted)] font-semibold">Engineered & Commissioned</div>
            </div>
            <div className="p-3 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)]">
              <div className="text-xl sm:text-2xl font-black text-[var(--color-brand-brown)]">₹1.08 L</div>
              <div className="text-[11px] text-[var(--color-text-muted)] font-semibold">Max Residential Subsidy</div>
            </div>
            <div className="p-3 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)]">
              <div className="text-xl sm:text-2xl font-black text-[var(--color-primary)]">2.8 Yrs</div>
              <div className="text-[11px] text-[var(--color-text-muted)] font-semibold">Average C&I Payback</div>
            </div>
            <div className="p-3 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)]">
              <div className="text-xl sm:text-2xl font-black text-[var(--color-text)]">100%</div>
              <div className="text-[11px] text-[var(--color-text-muted)] font-semibold">ALMM Tier-1 Verified BOM</div>
            </div>
          </div>

        </section>

        {/* =========================================================================
            2. REAL-TIME SOLAR SIZING & 25-YEAR ROI CALCULATOR WIZARD
           ========================================================================= */}
        <section id="calculator" className="scroll-mt-20 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--color-surface)] p-3 sm:px-6 sm:py-3.5 rounded-2xl border border-[var(--color-border)] shadow-2xs">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-xs font-extrabold text-[var(--color-text)]">Calculator Interface Mode:</span>
            </div>

            <div className="flex bg-[#D6E8F0]/60 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setCalculatorView('wizard')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  calculatorView === 'wizard'
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Multi-Step Sizing Wizard</span>
              </button>

              <button
                type="button"
                onClick={() => setCalculatorView('quick')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  calculatorView === 'quick'
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Single-Screen Quick Sliders</span>
              </button>
            </div>
          </div>

          {calculatorView === 'wizard' ? (
            <SolarCalculator
              onOpenDPRModal={handleOpenDPR}
              onOpenSiteSurvey={() => setIsSiteSurveyOpen(true)}
              onOpenIntake={handleOpenIntake}
            />
          ) : (
            <SolarSizingCalculator
              onOpenQuickQuote={() => setIsQuickQuoteOpen(true)}
              onOpenSubsidyChecker={() => setIsSubsidyCheckerOpen(true)}
              onOpenSiteSurvey={() => setIsSiteSurveyOpen(true)}
              onOpenDPRModal={handleOpenDPR}
            />
          )}
        </section>

        {/* =========================================================================
            3. SIX PROJECT TOPOLOGIES & ENGINEERING ARCHITECTURES
           ========================================================================= */}
        <section id="topologies" className="scroll-mt-20">
          <SolarTopologiesSection
            onSelectTopology={(topo) => {
              // Smooth scroll to calculator
              const el = document.getElementById('calculator');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenIntake={handleOpenIntake}
          />
        </section>

        {/* =========================================================================
            4. SOLAR HARDWARE CATALOG & PARAMETRIC BENCHMARKING
           ========================================================================= */}
        <section id="hardware" className="scroll-mt-20">
          <SolarCatalog
            onSelectProductForQuote={(prod) => {
              const brand = prod.brand || prod.brandName;
              const model = prod.model || prod.modelNumber;
              handleOpenIntake(`Solar Equipment Selection: ${brand} ${model} (${prod.capacityRating})`, 'solar');
            }}
            onOpenUniversalIntake={handleOpenIntake}
          />
        </section>

        {/* =========================================================================
            5. GOVERNMENT SCHEMES, SUBSIDIES & C&I TAX INCENTIVES
           ========================================================================= */}
        <section id="schemes" className="scroll-mt-20">
          <GovernmentSchemesHub
            onOpenSubsidyChecker={() => setIsSubsidyCheckerOpen(true)}
            onOpenQuickQuote={() => setIsQuickQuoteOpen(true)}
          />
        </section>

        {/* =========================================================================
            6. CTA BANNER FOR UNIFIED PROJECT INTAKE
           ========================================================================= */}
        <section className="bg-gradient-to-r from-[#1697C4] to-[#1E3F20] text-white rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <Badge variant="outline" size="sm" className="text-white border-white/30 bg-[var(--color-surface)]/10">
              Direct Technical Desk Assignment
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Solarize Your Facility or Home?
            </h3>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Every solar project is assigned a dedicated Principal Solar Solution Architect with end-to-end DISCOM sanctioning, CEIG clearance, and 5-year preventive O&M.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsSiteSurveyOpen(true)}
              className="w-full sm:w-auto bg-[var(--color-surface)]/10 text-white border-white/30 hover:bg-[var(--color-surface)]/20 text-xs font-bold"
              leftIcon={<Calendar className="w-4 h-4" />}
            >
              Book Site Survey
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleOpenIntake('Turnkey Solar EPC Project Requirement', 'solar')}
              className="w-full sm:w-auto bg-[var(--color-surface)] text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)] text-xs font-bold shadow-md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start New Project Intake
            </Button>
          </div>
        </section>

        {/* =========================================================================
            7. POP-UP MODALS & DIALOGS
           ========================================================================= */}
        
        {/* Modal 1: Instant Quick Quote */}
        <InstantQuickQuoteModal
          isOpen={isQuickQuoteOpen}
          onClose={() => setIsQuickQuoteOpen(false)}
          onOpenProposalReport={(data) => {
            setProposalReportData(data);
            setIsProposalModalOpen(true);
          }}
        />

        {/* Modal 2: Subsidy Eligibility Checker */}
        <SubsidyEligibilityCheckerModal
          isOpen={isSubsidyCheckerOpen}
          onClose={() => setIsSubsidyCheckerOpen(false)}
        />

        {/* Modal 3: C&I Enterprise RFQ */}
        <CIEterpriseRFQModal
          isOpen={isCiRfqOpen}
          onClose={() => setIsCiRfqOpen(false)}
        />

        {/* Modal 4: Free Engineering Site Visit */}
        <SiteSurveyBookingModal
          isOpen={isSiteSurveyOpen}
          onClose={() => setIsSiteSurveyOpen(false)}
        />

        {/* Techno-Commercial DPR Proposal Modal */}
        <SolarProposalModal
          isOpen={isProposalModalOpen}
          onClose={() => setIsProposalModalOpen(false)}
          reportData={proposalReportData}
        />

        {/* BuildEcoGroup Universal Intake Modal */}
        <UniversalCaseIntakeModal
          isOpen={isIntakeOpen}
          onClose={() => setIsIntakeOpen(false)}
          defaultObjective={intakeObjective}
          defaultServiceId="solar"
          defaultCategory="SOLAR"
        />

      </PageContainer>
    </div>
  );
};
