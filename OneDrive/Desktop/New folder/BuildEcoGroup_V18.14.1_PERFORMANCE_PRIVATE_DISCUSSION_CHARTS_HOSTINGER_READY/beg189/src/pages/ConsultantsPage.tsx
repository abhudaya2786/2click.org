import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Building2, Calculator, Droplets, FileCheck2, HardHat, Leaf, Map, Ruler, Search, Sun, Zap } from 'lucide-react';
import { ExpertProfileCard } from '../components/experts/ExpertProfileCard';
import { PageContainer } from '../components/ui/PageContainer';
import { MotionReveal } from '../components/ui/MotionReveal';
import { ABBHUDAYA_PRATAP_PROFILE, ABHISHEK_MISHRA_PROFILE } from '../lib/expertProfiles';
import { captureAnalyticsEvent, PRODUCT_EVENTS } from '../lib/analytics';
import { ROUTES } from '../lib/routes';

interface Discipline { title: string; category: string; description: string; services: string[]; icon: LucideIcon; }
const CATEGORIES = ['All', 'Leadership', 'Property & Land', 'Project & Construction', 'Design & Sustainability'];
const DISCIPLINES: Discipline[] = [
  { title: 'Land & Property Advisory', category: 'Property & Land', description: 'Requirement-led land evaluation, transaction context and development opportunity.', services: ['Property strategy', 'Location assessment', 'Transaction support'], icon: Building2 },
  { title: 'GIS, Survey & Feasibility', category: 'Property & Land', description: 'Spatial inputs and site intelligence before planning or capital commitment.', services: ['Boundary context', 'Terrain study', 'Access inputs'], icon: Map },
  { title: 'Architecture & Planning', category: 'Design & Sustainability', description: 'Planning support around climate, context, functionality and approvals.', services: ['Concept planning', 'Design coordination', 'Vastu integration'], icon: Ruler },
  { title: 'Structural Engineering', category: 'Project & Construction', description: 'Independent structural review, design coordination and safety-focused inputs.', services: ['Structural review', 'Foundation inputs', 'Design vetting'], icon: HardHat },
  { title: 'MEP & Building Services', category: 'Project & Construction', description: 'Electrical, plumbing, fire and coordinated building-services requirements.', services: ['Electrical planning', 'Plumbing systems', 'Services coordination'], icon: Zap },
  { title: 'BOQ & Cost Planning', category: 'Project & Construction', description: 'Quantities and commercial comparison inputs for clearer procurement decisions.', services: ['Quantity take-off', 'Rate comparison', 'Cost checkpoints'], icon: Calculator },
  { title: 'Solar & Energy', category: 'Design & Sustainability', description: 'Clean-energy scoping, system comparison and specialist coordination.', services: ['Load assessment', 'Solar sizing', 'Vendor comparison'], icon: Sun },
  { title: 'Water & Waste Systems', category: 'Design & Sustainability', description: 'Practical water, treatment and waste planning with lifecycle considerations.', services: ['Water treatment', 'STP planning', 'Waste workflows'], icon: Droplets },
  { title: 'Environment & Sustainability', category: 'Design & Sustainability', description: 'Sustainability inputs for resilient and responsible project decisions.', services: ['Environmental review', 'Passive strategies', 'Compliance inputs'], icon: Leaf },
  { title: 'Project Controls & Monitoring', category: 'Project & Construction', description: 'Milestone, document and evidence coordination across the project journey.', services: ['Milestone planning', 'Progress evidence', 'Exception tracking'], icon: FileCheck2 },
];

export const ConsultantsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const filteredDisciplines = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return DISCIPLINES.filter((discipline) => {
      const matchesCategory = selectedCategory === 'All' || selectedCategory === 'Leadership' || discipline.category === selectedCategory;
      const matchesQuery = !query || [discipline.title, discipline.category, discipline.description, ...discipline.services].some((value) => value.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--color-background)] py-5 sm:py-8">
      <PageContainer>
        <MotionReveal className="border-b border-[var(--color-border)] pb-5">
          <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[var(--color-primary)]">Independent expertise</p>
          <h1 className="beg-editorial-title mt-2 text-[2rem] font-bold leading-tight text-[var(--color-text)] sm:text-[2.75rem]">Our Consultants</h1>
          <p className="mt-1.5 text-xs text-[var(--color-text-muted)] sm:text-[13px]">Independent experts. Real-world experience. Better outcomes.</p>
        </MotionReveal>

        <div className="beg-hide-scrollbar mt-4 flex gap-1.5 overflow-x-auto pb-1" aria-label="Filter consultants">
          {CATEGORIES.map((category) => (
            <button key={category} type="button" onClick={() => { setSelectedCategory(category); captureAnalyticsEvent(PRODUCT_EVENTS.CONSULTANT_DISCIPLINE_FILTERED, { category }); }} aria-pressed={selectedCategory === category} className={`min-h-9 shrink-0 rounded-full border px-3.5 text-[9px] font-bold transition ${selectedCategory === category ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' : 'border-[var(--color-border)] bg-[#fbfaf6] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]'}`}>
              {category}
            </button>
          ))}
        </div>

        <section className="mt-5" data-testid="featured-experts-profiles">
          <div className="grid gap-3 xl:grid-cols-2">
            <MotionReveal><ExpertProfileCard expert={ABBHUDAYA_PRATAP_PROFILE} compact eyebrow="Director & Ecosystem Lead" ctaLabel="Discuss Your Project" /></MotionReveal>
            <MotionReveal delay={0.08}><ExpertProfileCard expert={ABHISHEK_MISHRA_PROFILE} compact eyebrow="Property Expert & Strategic Advisor" ctaLabel="Discuss Property Requirement" /></MotionReveal>
          </div>
        </section>

        <section className="mt-8 rounded-[12px] border border-[var(--color-border)] bg-white p-4 sm:mt-10 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-[var(--color-accent-warm)]">Professional disciplines</p>
              <h2 className="beg-editorial-title mt-2 text-[1.55rem] font-bold text-[var(--color-text)]">Find expertise by project need</h2>
              <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-muted)]">Final empanelment, availability and scope fit are verified before assignment.</p>
            </div>
            <label className="relative block" htmlFor="discipline-search">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-subtle)]" />
              <input id="discipline-search" type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search expertise..." className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] pl-9 pr-3 text-xs outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-subtle)]" />
            </label>
          </div>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
            {filteredDisciplines.map(({ icon: Icon, title, category, description, services }) => (
              <article key={title} className="rounded-[9px] border border-[var(--color-border)] bg-[var(--color-background)] p-3.5">
                <div className="flex items-center justify-between gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary)]"><Icon className="h-3.5 w-3.5" /></span><span className="text-[8px] font-bold text-[var(--color-text-subtle)]">{category}</span></div>
                <h3 className="beg-editorial-title mt-3 text-[13px] font-bold text-[var(--color-text)]">{title}</h3>
                <p className="mt-1.5 text-[10px] leading-4 text-[var(--color-text-muted)]">{description}</p>
                <div className="mt-3 flex flex-wrap gap-1">{services.slice(0, 2).map((service) => <span key={service} className="rounded-full border border-[var(--color-border)] bg-white px-2 py-1 text-[8px] font-semibold text-[var(--color-text-secondary)]">{service}</span>)}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 flex flex-col items-start justify-between gap-4 rounded-[12px] bg-[#e6eee8] p-5 sm:mt-10 sm:flex-row sm:items-center sm:p-7">
          <div><h2 className="beg-editorial-title text-xl font-bold text-[var(--color-text)]">Need a specialist for an active project?</h2><p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Share the requirement and BuildEcoGroup will coordinate a suitable expert match.</p></div>
          <Link to={`${ROUTES.INITIATE_PROJECT}?service=consultant`} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--color-primary)] px-5 text-xs font-bold text-white hover:bg-[var(--color-primary-hover)]">Request an Expert Match <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </PageContainer>
    </main>
  );
};
