import React, { useState } from 'react';
import { GoalHomeHero } from '../components/home/GoalHomeHero';
import { BuildEcoJourney } from '../components/home/BuildEcoJourney';
import { ActionHubSection } from '../components/home/ActionHubSection';
import { LandDevelopmentEngine } from '../components/home/LandDevelopmentEngine';
import { ConstructionManagementEcosystem } from '../components/home/ConstructionManagementEcosystem';
import { FeaturedConsultantsSection } from '../components/home/FeaturedConsultantsSection';
import { CollapsibleHomeSection } from '../components/home/CollapsibleHomeSection';
import { LiveCaseProofDashboard } from '../components/home/LiveCaseProofDashboard';
import { BOQEstimatorWidget } from '../components/home/BOQEstimatorWidget';
import { ConsultantShowcaseSection } from '../components/home/ConsultantShowcaseSection';
import { PillarsOverviewSection } from '../components/home/PillarsOverviewSection';
import { LegalTrustSection } from '../components/home/LegalTrustSection';
import { UniversalCaseIntakeModal } from '../components/common/UniversalCaseIntakeModal';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PRIMARY_CTA_LABEL, PRIMARY_CTA_ROUTE } from '../lib/homeGoals';

export const HomePage: React.FC = () => {
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [modalObjective, setModalObjective] = useState('Land Development Feasibility');
  const [modalCategory, setModalCategory] = useState('Land to Project');

  const handleOpenIntake = (objective: string, category: string) => {
    setModalObjective(objective);
    setModalCategory(category);
    setIsIntakeOpen(true);
  };

  const handleOpenWithEstimate = () => {
    setModalObjective('BOQ & Construction Cost Normalization');
    setModalCategory('BOQ Estimation');
    setIsIntakeOpen(true);
  };

  return (
    <div className="space-y-0 selection:bg-[var(--color-primary)] selection:text-white">
      {/* Reference-led editorial entry */}
      <GoalHomeHero />

      <ActionHubSection onOpenIntake={handleOpenIntake} />

      <BuildEcoJourney />

      <FeaturedConsultantsSection
        onStartRequirement={(name) => handleOpenIntake(`Consultation with ${name}`, 'Consultant Network')}
      />

      <CollapsibleHomeSection
        title="Complete Service Ecosystem"
        subtitle="Detailed land-development and construction-management pathways"
      >
        <LandDevelopmentEngine onOpenIntake={handleOpenIntake} />
        <ConstructionManagementEcosystem onOpenIntake={handleOpenIntake} />
      </CollapsibleHomeSection>

      <CollapsibleHomeSection
        title="Advanced Details"
        subtitle="5 pillars, live case transparency and platform governance"
      >
        <PillarsOverviewSection onOpenIntake={handleOpenIntake} />
        <LiveCaseProofDashboard onOpenIntake={handleOpenIntake} />
      </CollapsibleHomeSection>

      <CollapsibleHomeSection
        title="Expert Tools"
        subtitle="BOQ estimator, consultant directory and technical calculators"
      >
        <BOQEstimatorWidget onOpenIntakeWithEstimate={handleOpenWithEstimate} />
        <ConsultantShowcaseSection onOpenIntake={handleOpenIntake} />
      </CollapsibleHomeSection>

      {/* Bottom reinforcement CTA */}
      <section className="border-y border-[var(--color-border)] bg-[#e7eee8] py-12 sm:py-16">
        <div className="mx-auto flex max-w-[1100px] flex-col items-start justify-between gap-7 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[var(--color-primary)]">
              <ShieldCheck className="h-4 w-4" /> Structured requirement · protected record
            </div>
            <h2 className="beg-editorial-title text-3xl font-bold text-[var(--color-text)] sm:text-4xl">Ready to build with clarity?</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--color-text-muted)]">
              One clear requirement. A trackable Case ID. Verified experts and transparent BOQs.
            </p>
          </div>
          <Link
            to={PRIMARY_CTA_ROUTE}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[var(--color-primary)] px-7 text-sm font-extrabold uppercase tracking-[.04em] text-white hover:bg-[var(--color-primary-hover)] sm:w-auto"
            data-testid="cta-bottom-start-requirement"
          >
            {PRIMARY_CTA_LABEL} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <LegalTrustSection />

      <UniversalCaseIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        defaultObjective={modalObjective}
        defaultCategory={modalCategory}
      />
    </div>
  );
};
