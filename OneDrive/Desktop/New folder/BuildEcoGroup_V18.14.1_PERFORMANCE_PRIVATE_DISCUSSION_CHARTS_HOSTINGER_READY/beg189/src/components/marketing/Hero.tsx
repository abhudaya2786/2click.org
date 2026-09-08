import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { ASSETS, APP_CONFIG } from '../../lib/constants';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  ArrowRight, 
  Send, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Compass, 
  FolderGit2,
  FileCheck2,
  Building
} from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-6 pb-14 sm:pt-10 sm:pb-20 lg:pt-14 lg:pb-24 overflow-hidden bg-gradient-to-b from-[#F4FAFD] via-[#EAF6FB]/60 to-[#F4FAFD]">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            {/* Category / Positioning Tag */}
            <div className="inline-flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="md" icon={<Layers className="w-3.5 h-3.5" />}>
                Project Services & Technology Orchestration Platform
              </Badge>
              <Badge variant="brown" size="md">
                Independent Professional Empanelment
              </Badge>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-display text-[var(--color-text)]">
                Plan Better. <br className="hidden sm:inline" />
                <span className="text-[var(--color-primary)]">Connect Smarter.</span> <br />
                Deliver Better.
              </h1>
              
              <p className="text-body-large text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
                {APP_CONFIG.positioningSummary}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link to={ROUTES.SUBMIT_REQUIREMENT}>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Submit Your Requirement
                </Button>
              </Link>

              <a href="#how-it-works">
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  leftIcon={<Compass className="w-4 h-4 text-[var(--color-brand-brown)]" />}
                >
                  How It Works
                </Button>
              </a>

              <Link to={ROUTES.TECHNOLOGY} className="hidden sm:inline-flex">
                <Button
                  variant="ghost"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore Technology
                </Button>
              </Link>
            </div>

            {/* Key Assurance Badges */}
            <div className="pt-4 border-t border-[var(--color-border)] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[var(--color-text-secondary)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                <span>Zero Contractor Bias</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                <span>Verified Independent Experts</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[var(--color-brand-brown)] shrink-0" />
                <span>Structured Case ID System</span>
              </div>
            </div>

          </div>

          {/* Right Column: High-Quality Architecture Imagery Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Primary Image Frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[var(--color-border)] bg-[var(--color-surface)] aspect-[4/3] sm:aspect-[16/11]">
                <img
                  src={ASSETS.hero}
                  alt="Sustainable architectural orchestration and bioclimatic design preview"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                
                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#191C1A]/70 via-transparent to-transparent pointer-events-none" />

                {/* Floating Image Caption */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#B9DDEA] block">
                        Orchestration Blueprint #ECO-942
                      </span>
                      <span className="text-sm font-bold text-white">
                        Bioclimatic Envelope & Passive Solar Alignment
                      </span>
                    </div>
                    <Badge variant="primary" size="sm">
                      Case Study
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Floating Orchestration Status Card */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3.5 shadow-lg max-w-[240px] hidden sm:block animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center font-bold">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--color-text)]">5-Pillar Case Intake</div>
                    <div className="text-[11px] text-[var(--color-primary)] font-medium">Ready for Matching</div>
                  </div>
                </div>
              </div>

              {/* Floating Spatial Tech Badge */}
              <div className="absolute -top-4 -right-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 shadow-md hidden sm:block">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-brand-brown)]">
                  <FolderGit2 className="w-4 h-4" />
                  <span>Standardized BOQ Matrix</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
