import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Landmark, 
  Compass, 
  MapPin, 
  FileCheck, 
  ShieldCheck, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  TrendingUp,
  Download,
  Calendar,
  Sparkles,
  PhoneCall,
  CheckCircle,
  Eye
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ROUTES } from '../lib/routes';
import { UniversalCaseIntakeModal } from '../components/common/UniversalCaseIntakeModal';
import { getMediaAsset } from '../lib/mediaAssets';
import { PageHeroMedia, ResponsiveMedia } from '../components/ui/ResponsiveMedia';

export const LandDevelopmentPage: React.FC = () => {
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [modalObjective, setModalObjective] = useState('Land Feasibility & Due Diligence');
  const [selectedLandAssetKey, setSelectedLandAssetKey] = useState<string>('land_gis_drone_survey');

  const handleOpenIntake = (objective: string) => {
    setModalObjective(objective);
    setIsIntakeOpen(true);
  };

  const landAssetItems = [
    {
      key: 'land_gis_drone_survey',
      title: 'Drone Photogrammetry & 3D Contours',
      category: 'GIS & Elevation',
      desc: '0.5m interval contour mapping, natural drain slope detection, and cut & fill earthwork calculations.'
    },
    {
      key: 'land_cadastral_map',
      title: 'Cadastral Khasra & Master Plan Overlay',
      category: 'Zoning Alignment',
      desc: 'LDA / GDA 2031 master plan alignment, green belt buffers, and mandatory road widening setbacks.'
    },
    {
      key: 'land_clear_parcel',
      title: 'Plotted Residential Demarcation',
      category: 'Title Verified',
      desc: 'Demarcated clear-title residential land parcels ready for immediate boundary construction.'
    },
    {
      key: 'land_agricultural_acreage',
      title: 'Agricultural Acreage for Township',
      category: 'Section 143 Conversion',
      desc: 'Multi-acre agricultural parcels evaluated for institutional or township zoning conversion.'
    },
    {
      key: 'land_survey_team',
      title: 'Total Station & DGPS Ground Pegging',
      category: 'Boundary Pegging',
      desc: 'High-precision on-ground survey team establishing true physical geodetic coordinates.'
    },
    {
      key: 'land_jv_discussion',
      title: 'Joint Development (JDA) Structuring',
      category: 'Landowner & Developer JV',
      desc: 'Fair revenue-share modeling, legal escrow structuring, and bankable development agreements.'
    }
  ];

  const currentAsset = getMediaAsset(selectedLandAssetKey) ?? getMediaAsset('land_gis_drone_survey')!;

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      
      {/* 1. Hero Banner */}
      <section className="pt-10 pb-16 bg-gradient-to-b from-[#FFFFFF] to-[#EAF6FB] border-b border-[var(--color-border)]">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="inline-flex items-center gap-2">
            <Badge variant="primary" size="md" icon={<Landmark className="w-3.5 h-3.5" />}>
              Core Engine 01
            </Badge>
            <span className="text-xs font-mono font-bold text-[var(--color-brand-brown)] bg-[#EAF7FC] px-2.5 py-1 rounded-full border border-[#C6DEE8]">
              Land to Project Architecture
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-text)] tracking-tight leading-tight">
                Land Feasibility, Due Diligence & <br className="hidden sm:inline" />
                <span className="text-[var(--color-primary)]">Development Intelligence</span>
              </h1>
              
              <p className="text-base text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
                Transform raw plots, un-demarcated parcels, and agricultural acreage into bankable, master-planned residential, institutional, or commercial assets with 8-stage feasibility audits.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleOpenIntake('Order 8-Stage Land Feasibility Audit')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Order Feasibility Audit
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => handleOpenIntake('GIS Slope & Boundary Overlay Inquiry')}
                  leftIcon={<Compass className="w-4 h-4 text-[var(--color-primary)]" />}
                >
                  GIS Contour & Slope Analysis
                </Button>
              </div>
            </div>

            {/* Quick Score Card */}
            <div className="lg:col-span-4 space-y-4">
              <PageHeroMedia assetKey="hero_plotted_land" className="rounded-2xl" />
            <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0F2EC] pb-3">
                <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">Feasibility Benchmark</span>
                <span className="text-[10px] font-mono text-[var(--color-primary)] font-bold bg-[var(--color-primary-subtle)] px-2 py-0.5 rounded-full">AUDIT REPORT</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Average Audit Turnaround:</span>
                  <span className="font-bold text-[var(--color-text)]">48 - 72 Hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Geotech Standard:</span>
                  <span className="font-bold text-[var(--color-text)]">IS 1892 / IS 2131</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Zoning Validation:</span>
                  <span className="font-bold text-[var(--color-primary)]">LDA / GDA / UPSIDA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Title Check Horizon:</span>
                  <span className="font-bold text-[var(--color-text)]">30 Years Search</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F0F2EC] text-[11px] text-[var(--color-text-subtle)] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                <span>Audited by Chartered Structural & Geotechnical Engineers.</span>
              </div>
            </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. VISUAL LAND ARCHITECTURE & GIS SHOWCASE */}
      <section className="py-14 sm:py-20 max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="brown" size="sm">Real Contextual Intelligence</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)]">
            Land Typologies, Drone GIS & Field Demarcation
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
            Every land parcel has unique slope, access, soil, and legal characteristics. Select an area below to view real field methodologies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Visual Display */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-3xl overflow-hidden aspect-16/10 bg-[var(--color-surface-muted)] border border-[var(--color-border)] shadow-sm group">
              <ResponsiveMedia
                asset={currentAsset}
                className="h-full rounded-none border-0"
                imageClassName="h-full"
                showBadge={false}
                overlay={
                  <>
                    <div className="absolute top-4 left-4 bg-[#191C1A]/80 backdrop-blur-xs text-white text-xs font-mono font-bold px-3 py-1 rounded-full border border-white/20">
                      {currentAsset.badge || 'Field Audited'}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-[var(--color-surface)]/95 backdrop-blur-xs border border-[var(--color-border)] shadow-lg">
                      <h4 className="font-bold text-sm text-[var(--color-text)]">{currentAsset.title}</h4>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">{currentAsset.caption || currentAsset.altText}</p>
                    </div>
                  </>
                }
              />
            </div>
          </div>

          {/* Asset Selection Grid */}
          <div className="lg:col-span-5 space-y-2.5">
            {landAssetItems.map(item => (
              <button
                key={item.key}
                onClick={() => setSelectedLandAssetKey(item.key)}
                className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                  selectedLandAssetKey === item.key
                    ? 'bg-[var(--color-surface)] border-[#1697C4] shadow-sm ring-1 ring-[#1697C4]'
                    : 'bg-[var(--color-background)] border-[var(--color-border)] hover:bg-[var(--color-surface)] hover:border-[#C8D1C7]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-brand-brown)]">
                    {item.category}
                  </span>
                  {selectedLandAssetKey === item.key && (
                    <span className="text-[10px] font-bold bg-[var(--color-primary-subtle)] text-[var(--color-primary)] px-2 py-0.5 rounded-full">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs text-[var(--color-text)] mt-1">{item.title}</div>
                <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-snug">{item.desc}</div>
              </button>
            ))}
          </div>

        </div>

      </section>

      {/* 3. The 8-Stage Land Feasibility Engine */}
      <section className="py-14 sm:py-20 max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 border-t border-[var(--color-border)]">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="brown" size="sm">The 8 Pillars of Land Diligence</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)]">
            Comprehensive Technical & Legal Vetting
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Every land parcel evaluated on our platform goes through a structured 8-stage audit before architectural planning begins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              num: '01',
              title: 'Title & Ownership Vetting',
              desc: '30-year non-encumbrance registry verification, Revenue Khatauni search, mutation scrutiny, and land ceiling check.',
              icon: <FileCheck className="w-5 h-5 text-[var(--color-primary)]" />
            },
            {
              num: '02',
              title: 'Zoning & Master Plan Compliance',
              desc: 'LDA / GDA Master Plan 2031 alignment, land use zoning (Residential, Mixed, Green Belt), and mandatory setback ratios.',
              icon: <Landmark className="w-5 h-5 text-[var(--color-primary)]" />
            },
            {
              num: '03',
              title: 'GIS Contour & Slope Modeling',
              desc: 'Drone-assisted elevation mapping, natural slope drainage analysis, cut & fill volume estimates, and road access widths.',
              icon: <Compass className="w-5 h-5 text-[var(--color-brand-brown)]" />
            },
            {
              num: '04',
              title: 'Geotechnical Soil Capacity',
              desc: 'Standard Penetration Test (SPT N-values), soil bearing capacity (kN/m²), liquefaction susceptibility, and foundation design.',
              icon: <Layers className="w-5 h-5 text-[var(--color-brand-brown)]" />
            },
            {
              num: '05',
              title: 'Hydrology & Flood Risk Index',
              desc: '100-year high flood level (HFL) assessment, seasonal waterlogging vulnerability, and rainwater recharge permeability.',
              icon: <TrendingUp className="w-5 h-5 text-[var(--color-primary)]" />
            },
            {
              num: '06',
              title: 'Utility Ingress Feasibility',
              desc: 'Grid electrical connectivity (MVVNL / UPPCL substation load), potable water access, sewer outfall, and telecom fiber path.',
              icon: <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
            },
            {
              num: '07',
              title: 'Yield Optimization & Master Layout',
              desc: 'Plotting efficiency calculations (salable vs road vs green ratio), bioclimatic building orientations, and FAR maximization.',
              icon: <Building className="w-5 h-5 text-[var(--color-brand-brown)]" />
            },
            {
              num: '08',
              title: 'Financial Model & JV Valuation',
              desc: 'Cash flow projection, infrastructure CAPEX estimation, joint development agreement (JDA) revenue share models.',
              icon: <ShieldCheck className="w-5 h-5 text-[var(--color-brand-brown)]" />
            },
          ].map(stage => (
            <div key={stage.num} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[#1697C4] transition-all space-y-3 shadow-2xs group">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-muted)] flex items-center justify-center">
                  {stage.icon}
                </div>
                <span className="text-xs font-mono font-bold text-[var(--color-brand-brown)]">STAGE {stage.num}</span>
              </div>
              <h3 className="font-bold text-sm text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                {stage.title}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                {stage.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Strip */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--color-primary)] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold">Have a land parcel in Lucknow or Eastern UP?</h3>
            <p className="text-xs text-[#B9DDEA]">
              Submit your Khasra number or coordinates for an instant preliminary GIS screening.
            </p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => handleOpenIntake('Submit Khasra / Land Coordinates for Screening')}
            rightIcon={<ArrowRight className="w-4 h-4 text-[var(--color-primary)]" />}
            className="bg-[var(--color-surface)] text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)] font-bold"
          >
            Submit Land for Screening
          </Button>
        </div>

      </section>

      {/* Universal Case Intake Modal */}
      <UniversalCaseIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        defaultObjective={modalObjective}
        defaultCategory="Land to Project"
      />
    </div>
  );
};
