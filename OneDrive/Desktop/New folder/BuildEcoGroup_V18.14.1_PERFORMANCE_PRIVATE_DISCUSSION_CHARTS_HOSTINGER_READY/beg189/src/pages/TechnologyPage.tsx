import React from 'react';
import { PageContainer } from '../components/ui/PageContainer';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { 
  Sparkles, 
  Globe, 
  SunMedium, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Cpu 
} from 'lucide-react';

export const TechnologyPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 space-y-16">
      <PageContainer>
        
        {/* Header Intro */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2">
            <Badge variant="primary" size="md">
              Pillar 05 • Technology & Innovation
            </Badge>
            <Badge variant="brown" size="md">
              Climate-Tech & Spatial Tools
            </Badge>
          </div>
          <h1 className="text-h1 text-[var(--color-text)]">
            Technology Orchestration & Startup Gateway
          </h1>
          <p className="text-body-large text-[var(--color-text-muted)] leading-relaxed">
            BuildEcoGroup acts as an objective technology bridge—connecting progressive developers and homeowners with tested climate-tech solutions, GIS mapping engines, and clean microgrid simulations.
          </p>
        </div>

        {/* 4 Core Technology Modules */}
        <div className="space-y-10 pt-8">
          
          {/* Module 1: Land GIS */}
          <div id="gis" className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-10 shadow-sm space-y-6 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center font-bold">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-mono-code text-xs font-bold text-[var(--color-brand-brown)] uppercase">
                    Module TECH-01
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">
                    Land GIS & Spatial Analysis
                  </h2>
                </div>
              </div>
              <Badge variant="primary" size="md">
                Spatial Engine
              </Badge>
            </div>

            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
              Integrates multi-layered spatial data: satellite imagery, digital elevation contours, flood basin risks, microclimate wind corridors, and local municipal master plan zoning.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs space-y-1">
                <span className="font-bold text-[var(--color-primary)] block">Satellite Overlay</span>
                <span className="text-[var(--color-text-muted)]">High-resolution satellite imagery with survey parcel demarcation.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs space-y-1">
                <span className="font-bold text-[var(--color-primary)] block">Contour Analysis</span>
                <span className="text-[var(--color-text-muted)]">0.5m interval contour mapping and slope gradient categorization.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs space-y-1">
                <span className="font-bold text-[var(--color-primary)] block">Flood Risk Models</span>
                <span className="text-[var(--color-text-muted)]">Hydrological watershed flow simulations and drainage points.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs space-y-1">
                <span className="font-bold text-[var(--color-primary)] block">Solar Path Angle</span>
                <span className="text-[var(--color-text-muted)]">Solar azimuth and shadow casting across seasonal variations.</span>
              </div>
            </div>
          </div>

          {/* Module 2: Solar Microgrid */}
          <div id="solar" className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-10 shadow-sm space-y-6 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#EAF4F8] text-[var(--color-brand-brown)] flex items-center justify-center font-bold">
                  <SunMedium className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-mono-code text-xs font-bold text-[var(--color-brand-brown)] uppercase">
                    Module TECH-02
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">
                    Solar PV & Clean Microgrid Modeling
                  </h2>
                </div>
              </div>
              <Badge variant="brown" size="md">
                Renewable Intelligence
              </Badge>
            </div>

            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
              Photovoltaic capacity sizing based on verified rooftop unobstructed irradiation, battery energy storage (BESS) optimization, and net-metering ROI projections.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs space-y-1">
                <span className="font-bold text-[var(--color-brand-brown)] block">Rooftop Irradiance Study</span>
                <span className="text-[var(--color-text-muted)]">Shadow-loss calculation accounting for parapets and adjacent buildings.</span>
              </div>
              <div className="p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs space-y-1">
                <span className="font-bold text-[var(--color-brand-brown)] block">Microgrid Storage Sizing</span>
                <span className="text-[var(--color-text-muted)]">Hybrid inverter and battery bank capacity for critical load autonomy.</span>
              </div>
              <div className="p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs space-y-1">
                <span className="font-bold text-[var(--color-brand-brown)] block">Normalized Vendor Comparison</span>
                <span className="text-[var(--color-text-muted)]">Side-by-side tier-1 panel, inverter, and BOS component audits.</span>
              </div>
            </div>
          </div>

          {/* Module 3: Drone LiDAR */}
          <div id="lidar" className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-10 shadow-sm space-y-6 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center font-bold">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-mono-code text-xs font-bold text-[var(--color-brand-brown)] uppercase">
                    Module TECH-03
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">
                    Drone Photogrammetry & LiDAR Site Audits
                  </h2>
                </div>
              </div>
              <Badge variant="primary" size="md">
                Site Verification
              </Badge>
            </div>

            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
              Orthomosaic drone flights generating sub-centimeter point clouds for pre-construction earthwork calculations, structural progress verification, and as-built reality capture.
            </p>
          </div>

        </div>

        {/* Startup Gateway Card */}
        <div className="bg-[var(--color-primary)] text-white rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#B9DDEA] font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Climate-Tech Startup Gateway</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Are you developing novel low-carbon materials or smart site tech?
            </h3>
            <p className="text-xs sm:text-sm text-[#B9DDEA] leading-relaxed">
              Submit your technical test reports for evaluation by our empanelment board and introduce your solutions into real developer project briefs.
            </p>
          </div>

          <Link to={`${ROUTES.CONTACT}?mode=startup-gateway`} className="shrink-0">
            <Button
              variant="secondary"
              size="md"
              className="bg-[var(--color-surface)] text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)] border-none font-bold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Submit Innovation Brief
            </Button>
          </Link>
        </div>

      </PageContainer>
    </div>
  );
};
