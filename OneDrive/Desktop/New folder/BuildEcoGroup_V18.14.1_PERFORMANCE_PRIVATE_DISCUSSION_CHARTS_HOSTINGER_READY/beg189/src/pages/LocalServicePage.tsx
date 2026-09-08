import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Building2, 
  Landmark, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  FileSpreadsheet, 
  HardHat, 
  PhoneCall, 
  Compass,
  Users,
  Building
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ROUTES } from '../lib/routes';
import { UniversalCaseIntakeModal } from '../components/common/UniversalCaseIntakeModal';

interface CityData {
  name: string;
  state: string;
  tagline: string;
  authority: string;
  masterPlan: string;
  localOffice: string;
  phone: string;
  avgCostPerSqFt: string;
  primeAreas: string[];
  geotechNotes: string;
  projectsCount: number;
}

const CITIES: Record<string, CityData> = {
  lucknow: {
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    tagline: 'Capital Hub for Land Development, LDA Approvals & Smart Construction Controls',
    authority: 'Lucknow Development Authority (LDA)',
    masterPlan: 'LDA Master Plan 2031 (Zoning & FAR Compliant)',
    localOffice: 'Shaheed Path / Gomti Nagar Extension, Lucknow - 226010',
    phone: '+91-522-894002',
    avgCostPerSqFt: '₹1,650 - ₹2,200 / sq ft',
    primeAreas: [
      'Gomti Nagar Extension',
      'Shaheed Path & Amar Shaheed Path',
      'Sushant Golf City (Hi-Tech Township)',
      'Vrindavan Yojna (Sector 5 - 18)',
      'Jankipuram Extension',
      'Faizabad Road Corridor & Kisan Path',
      'IIM Road & Sultanpur Road Corridor'
    ],
    geotechNotes: 'Gangetic alluvial silty clay. Groundwater table varies from 6m to 12m. Seismic Zone III detailing mandatory under IS 1893:2016.',
    projectsCount: 142
  },
  gorakhpur: {
    name: 'Gorakhpur',
    state: 'Uttar Pradesh',
    tagline: 'Eastern UP Regional Command for Land Feasibility, GDA Approvals & Turnkey Construction',
    authority: 'Gorakhpur Development Authority (GDA)',
    masterPlan: 'GDA Master Plan 2031 (Ramgarh Tal & Industrial Zone)',
    localOffice: 'Taramandal / Medical Road, Gorakhpur - 273001',
    phone: '+91-551-840112',
    avgCostPerSqFt: '₹1,550 - ₹2,050 / sq ft',
    primeAreas: [
      'Ramgarh Tal Lakefront Corridor',
      'Taramandal & Siddharth Enclave',
      'Medical College Road & BRD Area',
      'Rapti Nagar Phase 1-4',
      'Rustampur & Deoria Bypass',
      'Gorakhnath & Bargadwa Industrial Belt',
      'AIIMS Gorakhpur Corridor'
    ],
    geotechNotes: 'High moisture riverine silt & sand lenses. Deep foundation checks and specialized anti-capillary plinth waterproofing required.',
    projectsCount: 89
  }
};

export const LocalServicePage: React.FC<{ cityKeyOverride?: 'lucknow' | 'gorakhpur' }> = ({ cityKeyOverride }) => {
  const { city } = useParams<{ city?: string }>();
  const cityKey = cityKeyOverride || (city?.toLowerCase() === 'gorakhpur' ? 'gorakhpur' : 'lucknow');
  const cityInfo = CITIES[cityKey] || CITIES.lucknow;

  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [modalObjective, setModalObjective] = useState(`Project Inquiry in ${cityInfo.name}`);

  const handleOpenIntake = (objective: string) => {
    setModalObjective(`${objective} (${cityInfo.name})`);
    setIsIntakeOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      
      {/* 1. Regional Hero Section */}
      <section className="pt-10 pb-16 bg-gradient-to-b from-[#FFFFFF] to-[#EAF6FB] border-b border-[var(--color-border)]">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="inline-flex items-center gap-2">
            <Badge variant="primary" size="md" icon={<MapPin className="w-3.5 h-3.5" />}>
              Regional Operations Hub
            </Badge>
            <span className="text-xs font-mono font-bold text-[var(--color-brand-brown)] bg-[#EAF7FC] px-2.5 py-1 rounded-full border border-[#C6DEE8]">
              {cityInfo.name}, {cityInfo.state}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-text)] tracking-tight leading-tight">
                Land Feasibility, BOQ & Construction Management in <br className="hidden sm:inline" />
                <span className="text-[var(--color-primary)]">{cityInfo.name}</span>
              </h1>
              
              <p className="text-base text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
                {cityInfo.tagline}. We connect landowners, home builders, and commercial developers with verified CoA architects, chartered structural engineers, and milestone-governed contractors.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleOpenIntake(`Start Project in ${cityInfo.name}`)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Start Project in {cityInfo.name}
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => handleOpenIntake(`Talk to ${cityInfo.name} Regional Engineer`)}
                  leftIcon={<PhoneCall className="w-4 h-4 text-[var(--color-primary)]" />}
                >
                  Talk to Local Team
                </Button>
              </div>
            </div>

            {/* Quick Regional Benchmark Card */}
            <div className="lg:col-span-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0F2EC] pb-3">
                <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">{cityInfo.name} Market Norms</span>
                <span className="text-[10px] font-mono text-[var(--color-primary)] font-bold bg-[var(--color-primary-subtle)] px-2 py-0.5 rounded-full">2026 BENCHMARK</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Standard Construction Cost:</span>
                  <span className="font-bold text-[var(--color-primary)]">{cityInfo.avgCostPerSqFt}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Municipal Authority:</span>
                  <span className="font-bold text-[var(--color-text)]">{cityInfo.authority}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Master Plan Zoning:</span>
                  <span className="font-bold text-[var(--color-text)]">2031 Vision Plan</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Active Case IDs:</span>
                  <span className="font-bold text-[var(--color-brand-brown)]">{cityInfo.projectsCount}+ Projects</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F0F2EC] text-[11px] text-[var(--color-text-subtle)] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                <span>Local Office: {cityInfo.localOffice}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Key Micro-Markets & Local Technical Nuances */}
      <section className="py-14 sm:py-20 max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Micro-markets covered */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--color-text)]">Prime Micro-Markets Covered in {cityInfo.name}</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Full coverage for residential, commercial, and plotted development.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
              {cityInfo.primeAreas.map(area => (
                <div key={area} className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)]">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                  <span className="font-medium text-[var(--color-text)]">{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Local Geotech & Regulatory Insights */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF7FC] text-[var(--color-brand-brown)] flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--color-text)]">Soil & Bye-Law Specifications ({cityInfo.name})</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Regional engineering parameters applied to all BuildEco calculations.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[var(--color-text-muted)] leading-relaxed pt-2">
              <p>
                <strong>Geotechnical Profile:</strong> {cityInfo.geotechNotes}
              </p>
              <p>
                <strong>Municipal Approvals:</strong> Strict alignment with {cityInfo.authority} guidelines for setbacks, ground coverage (up to 65%), and rainwater harvesting pit mandates for plots over 300 sq. meters.
              </p>
              <p>
                <strong>Solar Net Metering:</strong> Coordinated directly with DISCOM (Madhyanchal MVVNL / Purvanchal PuVVNL) with UP NEDA subsidy approvals.
              </p>
            </div>
          </div>

        </div>

        {/* 3 City Action Hub */}
        <div className="p-8 rounded-3xl bg-[var(--color-primary)] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold">Building in {cityInfo.name}? Get a Transparent Estimate</h3>
            <p className="text-xs sm:text-sm text-[#B9DDEA] max-w-xl">
              Get an itemized, CPWD-normalized BOQ and connect with top-rated local consultants verified by BuildEco.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => handleOpenIntake(`Request Local BOQ in ${cityInfo.name}`)}
              rightIcon={<ArrowRight className="w-4 h-4 text-[var(--color-primary)]" />}
              className="bg-[var(--color-surface)] text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)] font-bold"
            >
              Get {cityInfo.name} Cost Estimate
            </Button>
          </div>
        </div>

      </section>

      {/* Universal Case Intake Modal */}
      <UniversalCaseIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        defaultObjective={modalObjective}
        defaultCategory="Local Project Management"
      />
    </div>
  );
};
