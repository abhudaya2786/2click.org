import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { ResponsiveMedia } from '../ui/ResponsiveMedia';
import { MotionReveal } from '../ui/MotionReveal';
import { captureAnalyticsEvent } from '../../lib/analytics';

interface ActionHubSectionProps {
  onOpenIntake: (objective: string, category: string) => void;
}

export const SERVICE_PATHWAYS = [
  { title: 'Property & Land', desc: 'Find and evaluate opportunities', link: ROUTES.PROPERTY, assetKey: 'hero_plotted_land' },
  { title: 'Land Strategy', desc: 'De-risk and plan with insight', link: ROUTES.PROPERTY, assetKey: 'land_commercial_corridor' },
  { title: 'Land to Project', desc: 'Turn vision into viable plans', link: ROUTES.LAND_DEVELOPMENT, assetKey: 'land_jv_discussion' },
  { title: 'Construction', desc: 'Coordinate for quality outcomes', link: ROUTES.CONSTRUCTION_MANAGEMENT, assetKey: 'hero_construction_controls' },
  { title: 'Interior & Retrofit', desc: 'Design for people and performance', link: ROUTES.INTERIOR, assetKey: 'const_stage_7_interior' },
  { title: 'Asset Lifecycle', desc: 'Sustain, optimise and grow', link: ROUTES.MAINTENANCE_AMC, assetKey: 'pm_facility_technician' },
];

export const ActionHubSection: React.FC<ActionHubSectionProps> = (_props) => (
  <section className="beg-reference-section py-8 sm:py-10">
    <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
      <MotionReveal className="flex items-end justify-between gap-5">
        <div>
          <h2 className="beg-editorial-title text-[1.65rem] font-bold text-[var(--color-text)] sm:text-[2rem]">Service pathways</h2>
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)] sm:text-xs">End-to-end expertise. A more connected tomorrow.</p>
        </div>
        <Link to={ROUTES.SERVICES} className="hidden items-center gap-1.5 text-[11px] font-semibold text-[var(--color-primary)] hover:underline sm:inline-flex">
          Explore all services <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </MotionReveal>

      <div className="beg-hide-scrollbar -mx-4 mt-5 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 xl:grid-cols-6">
        {SERVICE_PATHWAYS.map((pathway, index) => (
          <MotionReveal key={pathway.title} className="w-[67vw] max-w-[235px] shrink-0 snap-start sm:w-auto sm:max-w-none" delay={Math.min(index * 0.055, 0.24)}>
            <Link
              to={pathway.link}
              onClick={() => captureAnalyticsEvent('service_explore_selected', { source: 'homepage_service_pathways', destination: pathway.link })}
              className="group block h-full overflow-hidden rounded-[9px] border border-[var(--color-border)] bg-white shadow-[0_3px_10px_rgba(23,49,39,.05)] transition hover:-translate-y-1 hover:shadow-md"
            >
              <ResponsiveMedia
                assetKey={pathway.assetKey}
                showBadge={false}
                aspectRatio="16:9"
                sizes="(max-width: 640px) 67vw, (max-width: 1280px) 33vw, 180px"
                className="rounded-none border-0 border-b border-[var(--color-border)]"
                imageClassName="object-cover"
              />
              <div className="flex min-h-[74px] items-end justify-between gap-2 p-3">
                <div>
                  <h3 className="beg-editorial-title text-[13px] font-bold leading-tight text-[var(--color-text)]">{pathway.title}</h3>
                  <p className="mt-1 text-[9px] leading-4 text-[var(--color-text-muted)]">{pathway.desc}</p>
                </div>
                <span className="beg-copper-arrow mb-0.5 h-6 w-6" aria-hidden><ArrowRight className="h-3 w-3" /></span>
              </div>
            </Link>
          </MotionReveal>
        ))}
      </div>

      <Link to={ROUTES.SERVICES} className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-primary)] hover:underline sm:hidden">
        Explore all services <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  </section>
);
