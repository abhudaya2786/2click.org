import React from 'react';
import { useLocation } from 'react-router-dom';
import { ResponsiveMedia } from '../ui/ResponsiveMedia';

interface RouteVisual {
  match: RegExp;
  assetKey: string;
  eyebrow: string;
  title: string;
  description: string;
}

const ROUTE_VISUALS: RouteVisual[] = [
  { match: /^\/about\/?$/, assetKey: 'hero_modern_development', eyebrow: 'About BuildEcoGroup', title: 'One connected platform for complex project decisions.', description: 'Land, experts, BOQ, procurement and milestone coordination in one traceable journey.' },
  { match: /^\/pillars\/?$/, assetKey: 'hero_modern_development', eyebrow: 'Platform Ecosystem', title: 'Connected services, not disconnected vendors.', description: 'Every service is organized around the same requirement-to-handover workflow.' },
  { match: /^\/services\/?$/, assetKey: 'hero_construction_controls', eyebrow: 'Service Ecosystems', title: 'Choose the outcome you need. BuildEco structures the path.', description: 'Construction, land, engineering, energy, operations and expert-network services.' },
  { match: /^\/property\/?$/, assetKey: 'prop_luxury_villa', eyebrow: 'Land & Property', title: 'Property decisions with feasibility, context and coordination.', description: 'Explore, assess, develop, manage or structure a property requirement with verified support.' },
  { match: /^\/technology\/?$/, assetKey: 'tech_cctv_iot_monitoring', eyebrow: 'Site Technology', title: 'Remote visibility for real-world project execution.', description: 'Surveillance, IoT, geotagged progress, digital records and monitoring workflows.' },
  { match: /^\/contact\/?$/, assetKey: 'hero_modern_development', eyebrow: 'Talk to BuildEcoGroup', title: 'Bring one clear requirement. We will structure the next steps.', description: 'Start with your project objective and receive a trackable Case ID.' },
  { match: /^\/land-feasibility\/?$/, assetKey: 'land_gis_drone_survey', eyebrow: 'Land Feasibility', title: 'Understand the land before committing capital.', description: 'Boundary, access, planning context, survey inputs and development feasibility.' },
  { match: /^\/waste-management\/?$/, assetKey: 'water_stp_modular', eyebrow: 'Waste Management', title: 'Plan compliant, maintainable waste systems.', description: 'Requirement scoping, treatment options, specialist coordination and lifecycle support.' },
  { match: /^\/maintenance-amc\/?$/, assetKey: 'pm_facility_technician', eyebrow: 'Maintenance & AMC', title: 'Protect building performance after handover.', description: 'Preventive maintenance, repair coordination, asset records and AMC planning.' },
  { match: /^\/gis\/?$/, assetKey: 'land_cadastral_map', eyebrow: 'GIS & Survey', title: 'Turn site data into better land and project decisions.', description: 'Cadastral context, mapping, drone survey and spatial feasibility workflows.' },
  { match: /^\/project-monitoring\/?$/, assetKey: 'tech_cctv_iot_monitoring', eyebrow: 'Project Monitoring', title: 'See progress, evidence and exceptions in one record.', description: 'Milestones, site photos, surveillance and project-status coordination.' },
  { match: /^\/material-procurement\/?$/, assetKey: 'mat_tmt_steel', eyebrow: 'Material Procurement', title: 'Compare material requirements before purchase.', description: 'BOQ-linked specifications, brands, vendors and procurement coordination.' },
  { match: /^\/interior\/?$/, assetKey: 'const_stage_7_interior', eyebrow: 'Interior & Renovation', title: 'Translate space requirements into coordinated execution.', description: 'Planning, finish selections, BOQ, specialists and site coordination.' },
  { match: /^\/vastu\/?$/, assetKey: 'const_stage_1_planning', eyebrow: 'Vastu Advisory', title: 'Add Vastu review without breaking the design workflow.', description: 'Optional Vastu inputs coordinated with planning, architecture and project requirements.' },
  { match: /^\/workers\/?$/, assetKey: 'trade_electrician_action', eyebrow: 'Skilled Network', title: 'Find the right skilled resource for the requirement.', description: 'Category-based matching for electricians, plumbers, carpenters, technicians and more.' },
  { match: /^\/equipment\/?$/, assetKey: 'machinery_jcb_excavator', eyebrow: 'Machinery & Equipment', title: 'Source equipment around project need and location.', description: 'Requirement-led coordination for machinery, tools and site equipment providers.' },
  { match: /^\/projects\/?$/, assetKey: 'const_stage_9_handover', eyebrow: 'Projects & Case Journeys', title: 'Show the work as a traceable journey, not a marketing claim.', description: 'Case-led examples, milestones, documents and outcomes with illustrative labels where required.' },
  { match: /^\/(research|blog)\/?$/, assetKey: 'const_stage_1_planning', eyebrow: 'Research & Knowledge', title: 'Practical knowledge for better project decisions.', description: 'Guides, checklists and technical explainers across the BuildEco ecosystem.' },
  { match: /^\/services\/(lucknow|gorakhpur)\/?$/, assetKey: 'hero_modern_development', eyebrow: 'Local Service Hub', title: 'BuildEcoGroup services organized for your city.', description: 'Local requirements connected to the same Case ID, expert and project workflow.' },
];

const ROUTES_WITH_NATIVE_PHOTO_HERO = [
  '/', '/about', '/consultants', '/initiate-project', '/onboarding', '/land-development', '/construction-management',
  '/boq-estimation', '/solar', '/water-treatment', '/track', '/services', '/waste-management',
  '/maintenance-amc', '/gis', '/material-procurement', '/interior', '/vastu', '/workers', '/equipment',
];

export const RoutePhotoRibbon: React.FC = () => {
  const { pathname } = useLocation();
  if (ROUTES_WITH_NATIVE_PHOTO_HERO.includes(pathname)) return null;
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/experts/') || pathname.startsWith('/projects/')) return null;

  const visual = ROUTE_VISUALS.find((item) => item.match.test(pathname));
  if (!visual) return null;

  return (
    <section className="route-photo-ribbon border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-[1340px] grid-cols-1 items-center gap-5 px-4 py-6 sm:gap-7 sm:px-6 sm:py-8 lg:grid-cols-12 lg:px-8 lg:py-10">
        <div className="lg:col-span-7">
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[.18em] text-[var(--color-accent-warm)]">{visual.eyebrow}</p>
          <p className="max-w-3xl text-2xl font-black leading-tight tracking-[-.035em] text-[var(--color-text)] sm:text-4xl lg:text-5xl">{visual.title}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)] sm:mt-4 sm:text-base sm:leading-7">{visual.description}</p>
        </div>
        <div className="lg:col-span-5">
          <ResponsiveMedia assetKey={visual.assetKey} priority sizes="(max-width: 1024px) 100vw, 40vw" className="route-photo-card rounded-[18px] shadow-lg sm:rounded-[22px]" imageClassName="min-h-[180px] sm:min-h-[250px]" />
        </div>
      </div>
    </section>
  );
};
