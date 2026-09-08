import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Cuboid,
  MapPin,
  Network,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { UniversalCaseIntakeModal } from '../components/common/UniversalCaseIntakeModal';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AnimatedHeadline, MotionReveal } from '../components/ui/MotionReveal';
import { ResponsiveMedia } from '../components/ui/ResponsiveMedia';
import { captureAnalyticsEvent } from '../lib/analytics';
import { ROUTES } from '../lib/routes';
import { serviceMediaKey } from '../lib/serviceMedia';
import { SERVICES_CATALOG } from '../lib/servicesRegistry';

const routeToService: Record<string, string> = {
  '/waste-management': 'waste',
  '/maintenance-amc': 'maintenance',
  '/gis': 'gis',
  '/material-procurement': 'material',
  '/interior': 'interior',
  '/vastu': 'vastu',
  '/workers': 'workers',
  '/equipment': 'equipment',
};

const workflow = [
  {
    number: '01',
    title: 'Define the outcome',
    copy: 'Share only the essentials. The platform creates one authoritative Case ID for every later decision.',
    icon: ClipboardCheck,
  },
  {
    number: '02',
    title: 'Match the right roles',
    copy: 'Relevant specialists, vendors and site teams are aligned to the scope—then compared transparently.',
    icon: Network,
  },
  {
    number: '03',
    title: 'Approve with evidence',
    copy: 'BOQ, documents, messages, milestones and handover records remain connected to the same project trail.',
    icon: ShieldCheck,
  },
];

export const ServiceExperiencePage: React.FC<{ serviceId?: string }> = ({ serviceId }) => {
  const location = useLocation();
  const resolvedId = serviceId || routeToService[location.pathname] || 'construction';
  const service = useMemo(
    () => SERVICES_CATALOG.find((item) => item.id === resolvedId) || SERVICES_CATALOG[0],
    [resolvedId]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [objective, setObjective] = useState(`${service.title} Requirement`);
  const photoKey = serviceMediaKey(service.id);

  const openRequirement = (source: string, selectedObjective?: string) => {
    captureAnalyticsEvent('service_requirement_started', { service_id: service.id, source });
    setObjective(selectedObjective || `${service.title} Requirement`);
    setIsOpen(true);
  };

  return (
    <main className="overflow-hidden bg-[var(--color-background)] text-[var(--color-text)]">
      <section className="relative border-b border-[var(--color-border)] py-9 sm:py-14 lg:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(31,90,69,.13),transparent_33%),radial-gradient(circle_at_92%_78%,rgba(199,131,72,.12),transparent_30%)]" aria-hidden />
        <div className="relative mx-auto grid max-w-[1180px] items-center gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
          <MotionReveal className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="md">{service.categoryGroupLabel}</Badge>
              <span className="text-[10px] font-black uppercase tracking-[.13em] text-[var(--color-accent-warm)]">One Case ID · One project trail</span>
            </div>
            <AnimatedHeadline
              text={service.title}
              className="beg-editorial-title mt-4 max-w-3xl text-[2.45rem] font-black leading-[1.02] tracking-[-.05em] text-[var(--color-text)] sm:text-5xl lg:text-[3.8rem]"
            />
            <p className="mt-4 max-w-2xl text-lg font-bold leading-7 text-[var(--color-primary)]">{service.tagline}</p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">{service.description}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button variant="primary" size="lg" onClick={() => openRequirement('service_detail_hero')} rightIcon={<ArrowRight className="h-4 w-4" />}>
                Start requirement
              </Button>
              <Link to={ROUTES.TRACK} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 text-sm font-black text-[var(--color-text)] transition hover:border-[var(--color-primary)]">
                Track an existing case
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[var(--color-text-muted)]">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[var(--color-primary)]" /> Verified network</span>
              <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-[var(--color-primary)]" /> Role-based matching</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[var(--color-primary)]" /> Location-aware delivery</span>
            </div>
          </MotionReveal>

          <MotionReveal className="lg:col-span-5" delay={0.15}>
            <div className="relative rounded-[26px] bg-[var(--color-primary-subtle)] p-2.5 shadow-xl">
              <ResponsiveMedia assetKey={photoKey} priority showBadge={false} aspectRatio="4:3" className="rounded-[20px] border-white/70" />
              <div className="absolute bottom-5 left-5 right-5 grid grid-cols-2 gap-3 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-lg backdrop-blur-md">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[.12em] text-[var(--color-text-subtle)]">Assigned desk</p>
                  <p className="mt-1 line-clamp-2 text-xs font-extrabold text-[var(--color-text)]">{service.assignedDesk}</p>
                </div>
                <div className="border-l border-[var(--color-border)] pl-3">
                  <p className="text-[9px] font-black uppercase tracking-[.12em] text-[var(--color-text-subtle)]">Initial response</p>
                  <p className="mt-1 text-xs font-extrabold text-[var(--color-text)]">{service.turnaroundSLA}</p>
                </div>
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)] py-12 sm:py-16">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <MotionReveal>
            <p className="arch-kicker">A clear service journey</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Three stages. No fragmented follow-up.</h2>
          </MotionReveal>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {workflow.map((step, index) => {
              const Icon = step.icon;
              return (
                <MotionReveal key={step.number} delay={index * 0.08} className="h-full">
                  <article className="h-full rounded-[20px] border border-[var(--color-border)] bg-[var(--color-background)] p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)]"><Icon className="h-5 w-5" /></span>
                      <span className="text-xs font-black text-[var(--color-border-strong)]">{step.number}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-black">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{step.copy}</p>
                  </article>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-[1180px] items-stretch gap-6 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <MotionReveal className="lg:col-span-7">
            <div className="h-full rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm sm:p-8">
              <p className="arch-kicker">What you receive</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Defined outputs before execution begins.</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {service.deliverables.map((item, index) => (
                  <MotionReveal key={item} delay={Math.min(index * 0.06, 0.24)}>
                    <div className="flex h-full gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm leading-6">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                      <span>{item}</span>
                    </div>
                  </MotionReveal>
                ))}
              </div>
              <div className="mt-6 border-t border-[var(--color-border)] pt-5 text-xs leading-6 text-[var(--color-text-muted)]">
                Working references: <strong className="text-[var(--color-text)]">{service.standards}</strong>
              </div>
            </div>
          </MotionReveal>

          <MotionReveal className="lg:col-span-5" delay={0.1}>
            <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-[var(--color-text)] text-white shadow-lg">
              <ResponsiveMedia assetKey="const_stage_1_planning" showBadge={false} aspectRatio="16:9" className="rounded-none border-0 opacity-90" />
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#C8E5D9]"><Cuboid className="h-5 w-5" /></span>
                <p className="mt-5 text-[10px] font-black uppercase tracking-[.16em] text-[#D9AD83]">Visual planning option</p>
                <h2 className="mt-2 text-2xl font-black leading-tight">Drawings → 3D review → coordinated decisions</h2>
                <p className="mt-3 text-sm leading-6 text-white/70">If your scope includes a floor plan or site image, add it to the brief so the project desk can route a visual planning review.</p>
                <button
                  type="button"
                  onClick={() => {
                    captureAnalyticsEvent('three_d_entry_selected', { service_id: service.id, source: 'service_detail_3d_panel' });
                    openRequirement('service_detail_3d_panel', `3D Planning for ${service.title}`);
                  }}
                  className="mt-auto inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[var(--color-text)] transition hover:bg-[#F1F5F2]"
                >
                  Add visual planning <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      {(service.subOptions || []).length > 0 && (
        <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] py-12 sm:py-16">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
            <MotionReveal className="max-w-2xl">
              <p className="arch-kicker">Choose a starting scope</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Which path is closest to your requirement?</h2>
            </MotionReveal>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(service.subOptions || []).map((item, index) => (
                <MotionReveal key={item} delay={Math.min(index * 0.06, 0.24)}>
                  <button
                    type="button"
                    onClick={() => openRequirement('service_detail_scope', item)}
                    className="group flex min-h-20 w-full items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-left text-sm font-bold transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-md"
                  >
                    <span>{item}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[var(--color-primary)] transition group-hover:translate-x-1" />
                  </button>
                </MotionReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 text-center sm:py-16">
        <MotionReveal className="mx-auto max-w-2xl px-4 sm:px-6">
          <p className="arch-kicker">Ready when you are</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Turn this service into a trackable project brief.</h2>
          <Button variant="primary" size="lg" className="mt-6" onClick={() => openRequirement('service_detail_footer')} rightIcon={<ArrowRight className="h-4 w-4" />}>
            Start with {service.shortTitle}
          </Button>
        </MotionReveal>
      </section>

      <UniversalCaseIntakeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultObjective={objective}
        defaultServiceId={service.id}
        defaultCategory={service.queryCategory}
      />
    </main>
  );
};
