import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Plus, Search } from 'lucide-react';
import { UniversalCaseIntakeModal } from '../components/common/UniversalCaseIntakeModal';
import { Button } from '../components/ui/Button';
import { MotionReveal } from '../components/ui/MotionReveal';
import { ResponsiveMedia } from '../components/ui/ResponsiveMedia';
import { captureAnalyticsEvent } from '../lib/analytics';
import { ROUTES } from '../lib/routes';
import { serviceMediaKey } from '../lib/serviceMedia';
import { SERVICES_CATALOG, ServiceDefinition } from '../lib/servicesRegistry';

const serviceTabs = [
  { id: 'all', label: 'All' },
  { id: 'land', label: 'Property & Land' },
  { id: 'advisory', label: 'Strategy' },
  { id: 'tech', label: 'Planning & Approvals' },
  { id: 'engineering', label: 'Construction' },
  { id: 'site', label: 'Interior & Retrofit' },
  { id: 'sustainability', label: 'Asset Lifecycle' },
];

export const ServicesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(serviceTabs.some((tab) => tab.id === requestedTab) ? requestedTab : 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModalService, setSelectedModalService] = useState<ServiceDefinition | null>(null);

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SERVICES_CATALOG.filter((service) => {
      const matchesTab = activeTab === 'all' || service.categoryGroup === activeTab;
      const matchesSearch = !q || [service.title, service.description, service.tagline, ...service.deliverables].some((value) => value.toLowerCase().includes(q));
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const openRequirement = (service: ServiceDefinition) => {
    captureAnalyticsEvent('service_requirement_started', { service_id: service.id, source: 'services_catalog' });
    setSelectedModalService(service);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-background)]">
      <section className="beg-reference-section py-5 sm:py-7">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-[#f8f5ee] shadow-[0_12px_34px_rgba(23,49,39,.07)] lg:grid-cols-[56%_44%]">
            <MotionReveal className="flex flex-col justify-center p-5 sm:p-7 lg:p-8">
              <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[var(--color-primary)]">Connected expertise</p>
              <h1 className="beg-editorial-title mt-2 text-[2.1rem] font-bold leading-tight text-[var(--color-text)] sm:text-[2.75rem]">Services</h1>
              <p className="mt-1.5 max-w-xl text-xs leading-5 text-[var(--color-text-muted)] sm:text-[13px]">Specialised expertise across the entire property and project lifecycle.</p>
              <label className="relative mt-4 block max-w-xl" htmlFor="service-search">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-subtle)]" />
                <input id="service-search" type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search services..." className="h-10 w-full rounded-md border border-[var(--color-border-strong)] bg-white pl-9 pr-3 text-xs outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-subtle)]" />
              </label>
            </MotionReveal>
            <MotionReveal className="relative min-h-[190px] sm:min-h-[240px]" delay={0.12}>
              <ResponsiveMedia assetKey="hero_reference_eco_villa" priority showBadge={false} aspectRatio="16:9" className="hero-reference-media absolute inset-0 h-full rounded-none border-0" imageClassName="h-full object-cover" />
              <p className="absolute right-5 top-5 max-w-[122px] border-l border-white/90 pl-3 text-[9px] font-bold uppercase leading-[1.55] tracking-[.18em] text-white drop-shadow-md">Expertise that connects people, land and opportunity.</p>
            </MotionReveal>
          </div>

          <div className="beg-hide-scrollbar mt-4 flex gap-1.5 overflow-x-auto pb-1" aria-label="Filter services">
            {serviceTabs.map((tab) => (
              <button key={tab.id} type="button" onClick={() => { setActiveTab(tab.id); captureAnalyticsEvent('service_filter_changed', { filter_id: tab.id, source: 'services_catalog' }); }} aria-pressed={activeTab === tab.id} className={`min-h-9 shrink-0 rounded-full border px-3.5 text-[9px] font-bold transition ${activeTab === tab.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' : 'border-[var(--color-border)] bg-[#fbfaf6] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="beg-reference-section py-7 sm:py-9">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="beg-editorial-title text-[1.55rem] font-bold text-[var(--color-text)] sm:text-[1.9rem]">Explore every pathway</h2>
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{filteredServices.length} coordinated services available</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service, index) => (
              <MotionReveal key={service.id} delay={Math.min((index % 6) * 0.04, 0.2)} className="h-full">
                <article id={service.id} className="group grid h-full grid-cols-[42%_58%] overflow-hidden rounded-[9px] border border-[var(--color-border)] bg-white shadow-[0_3px_10px_rgba(23,49,39,.05)] sm:block">
                  <ResponsiveMedia assetKey={serviceMediaKey(service.id)} showBadge={false} aspectRatio="16:9" sizes="(max-width:640px) 42vw, (max-width:1024px) 50vw, 380px" className="h-full rounded-none border-0 border-r border-[var(--color-border)] sm:h-auto sm:border-b sm:border-r-0" />
                  <div className="flex min-w-0 flex-col p-3.5">
                    <p className="text-[8px] font-bold uppercase tracking-[.15em] text-[var(--color-accent-warm)]">{service.categoryGroupLabel}</p>
                    <h3 className="beg-editorial-title mt-1 text-[14px] font-bold leading-tight text-[var(--color-text)] sm:text-base">{service.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-[10px] leading-[1.55] text-[var(--color-text-muted)] sm:text-[11px]">{service.description}</p>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                      <Link to={service.route} onClick={() => captureAnalyticsEvent('service_explore_selected', { service_id: service.id, source: 'services_catalog', destination: service.route })} className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)] hover:underline">Explore <ArrowRight className="h-3 w-3" /></Link>
                      <button type="button" onClick={() => openRequirement(service)} className="beg-copper-arrow h-7 w-7" aria-label={`Start ${service.title} requirement`}><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </article>
              </MotionReveal>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="mt-6 rounded-xl border border-dashed border-[var(--color-border-strong)] bg-white p-8 text-center">
              <h3 className="beg-editorial-title text-lg font-bold text-[var(--color-text)]">No matching service found</h3>
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">Try a wider term such as solar, BOQ, land, water or construction.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearchQuery(''); setActiveTab('all'); }}>Reset filters</Button>
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#e6eee8] py-9 text-center sm:py-12">
        <MotionReveal className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="beg-editorial-title text-2xl font-bold text-[var(--color-text)] sm:text-3xl">Not sure where to begin?</h2>
          <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">Tell us the outcome. We will map the right service pathway.</p>
          <Link to={ROUTES.INITIATE_PROJECT} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--color-primary)] px-5 text-xs font-bold text-white hover:bg-[var(--color-primary-hover)]">Describe your requirement <ArrowRight className="h-4 w-4" /></Link>
        </MotionReveal>
      </section>

      {selectedModalService && <UniversalCaseIntakeModal isOpen onClose={() => setSelectedModalService(null)} defaultServiceId={selectedModalService.id} defaultCategory={selectedModalService.queryCategory} defaultObjective={`${selectedModalService.title} Requirement`} />}
    </main>
  );
};
