import { CaseIntakeInput, PillarType } from '../types/backend';
import { ServiceDefinition } from './servicesRegistry';
import { FormAttachment } from '../types/forms';

interface DynamicFormContext {
  selectedService: ServiceDefinition;
  title: string;
  details: Record<string, any>;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  locationCity: string;
  pincode: string;
  siteAddress: string;
  targetTimeline: string;
  preferredContact: string;
  attachments: FormAttachment[];
  bundledServices: string[];
}

const SERVICE_BACKEND_MAP: Record<string, { slug: string; pillar: PillarType; discipline: string }> = {
  construction: { slug: 'turnkey-contracting', pillar: 'CONSTRUCTION_SERVICES', discipline: 'Turnkey Construction' },
  land: { slug: 'property-due-diligence', pillar: 'LAND_PROPERTY', discipline: 'Land Development & Due Diligence' },
  solar: { slug: 'solar-pv-bipv', pillar: 'INNOVATION_STARTUPS', discipline: 'Solar PV & Clean Energy' },
  boq: { slug: 'boq-estimation', pillar: 'CONSTRUCTION_SERVICES', discipline: 'BOQ & Cost Estimation' },
  surveillance: { slug: 'site-surveillance-iot', pillar: 'SURVEILLANCE_SITE_TECH', discipline: 'Site Surveillance & IoT' },
  water: { slug: 'water-waste-treatment', pillar: 'CONSULTANTS', discipline: 'Water & Wastewater Engineering' },
  waste: { slug: 'water-waste-treatment', pillar: 'CONSULTANTS', discipline: 'Solid Waste Management' },
  maintenance: { slug: 'mep-systems', pillar: 'CONSULTANTS', discipline: 'Facility Maintenance & AMC' },
  gis: { slug: 'gis-terrain-modeling', pillar: 'LAND_PROPERTY', discipline: 'GIS & Drone Survey' },
  interior: { slug: 'bioclimatic-architecture', pillar: 'CONSULTANTS', discipline: 'Interior Design & Fitout' },
  consultants: { slug: 'structural-engineering', pillar: 'CONSULTANTS', discipline: 'Professional Consulting' },
  material: { slug: 'turnkey-contracting', pillar: 'CONSTRUCTION_SERVICES', discipline: 'Material Procurement' },
  vastu: { slug: 'vastu-environmental-alignment', pillar: 'CONSULTANTS', discipline: 'Vastu & Environmental Alignment' },
  workers: { slug: 'turnkey-contracting', pillar: 'CONSTRUCTION_SERVICES', discipline: 'Skilled Labour & Workforce' },
  equipment: { slug: 'turnkey-contracting', pillar: 'CONSTRUCTION_SERVICES', discipline: 'Machinery & Equipment Rental' },
};

function cityToState(city: string): string {
  const upCities = ['Lucknow', 'Gorakhpur', 'Kanpur', 'Varanasi', 'Ayodhya', 'Prayagraj'];
  if (upCities.some(c => city.includes(c))) return 'Uttar Pradesh';
  if (city.includes('Noida') || city.includes('NCR')) return 'Uttar Pradesh (NCR)';
  return 'India';
}

function extractPlotSize(details: Record<string, any>, serviceId: string): string {
  const candidates = [
    details.plotArea,
    details.builtUpArea,
    details.landArea,
    details.roofArea,
    details.plotBuiltUpArea,
    details.landSize,
    details.dailyCapacity,
  ];
  const found = candidates.find(v => typeof v === 'string' && v.trim().length > 0);
  return found || 'To be confirmed during site visit';
}

function extractBudget(details: Record<string, any>, service: ServiceDefinition): string {
  const candidates = [
    details.budget,
    details.expectedBudget,
    details.budget as string,
    details.interiorBudget,
  ];
  const found = candidates.find(v => typeof v === 'string' && v.trim().length > 0);
  return found || service.defaultBudgetRange || 'To be discussed';
}

function extractBuildingType(details: Record<string, any>, service: ServiceDefinition): string {
  const candidates = [
    details.buildingType,
    details.projectType,
    details.facilityType,
    details.spaceType,
    details.customerType,
    details.sourceType,
    details.serviceTitle,
  ];
  const found = candidates.find(v => typeof v === 'string' && v.trim().length > 0);
  return found || service.title;
}

function buildScopeDescription(ctx: DynamicFormContext): string {
  const lines: string[] = [
    `Service: ${ctx.selectedService.title}`,
    `Desk: ${ctx.selectedService.assignedDesk}`,
  ];
  if (ctx.bundledServices.length > 0) {
    lines.push(`Bundled services: ${ctx.bundledServices.join(', ')}`);
  }
  if (ctx.siteAddress) {
    lines.push(`Site: ${ctx.siteAddress}`);
  }
  const detailSummary = Object.entries(ctx.details)
    .filter(([k]) => !['serviceId', 'serviceTitle', 'categoryGroup', 'assignedDesk', 'standards'].includes(k))
    .slice(0, 8)
    .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
    .join('; ');
  if (detailSummary) {
    lines.push(detailSummary);
  }
  return lines.join('. ').slice(0, 2000);
}

export function buildCaseIntakeFromDynamicForm(ctx: DynamicFormContext): CaseIntakeInput {
  const mapping = SERVICE_BACKEND_MAP[ctx.selectedService.id] || SERVICE_BACKEND_MAP.construction;
  const details = ctx.details;

  return {
    pillar: mapping.pillar,
    serviceSlug: mapping.slug,
    primaryDiscipline: mapping.discipline,
    subDisciplines: ctx.bundledServices,
    address: ctx.siteAddress || `${ctx.locationCity}, PIN ${ctx.pincode}`,
    city: ctx.locationCity,
    stateRegion: cityToState(ctx.locationCity),
    pincode: ctx.pincode,
    plotSizeSqFt: extractPlotSize(details, ctx.selectedService.id),
    terrainType: 'Urban / Semi-Urban Developable Land',
    projectTitle: ctx.title,
    buildingType: extractBuildingType(details, ctx.selectedService),
    scopeDescription: buildScopeDescription(ctx),
    scopeDetails: {
      ...details,
      formSource: 'DynamicQueryForm',
      preferredContact: ctx.preferredContact,
      attachments: ctx.attachments.map(a => ({ name: a.name, size: a.size, type: a.type })),
      assignedDesk: ctx.selectedService.assignedDesk,
      standards: ctx.selectedService.standards,
    },
    specialRequirements: ctx.bundledServices,
    budgetRange: extractBudget(details, ctx.selectedService),
    financingStatus: 'Self-Funded / Approved',
    startDateUrgency: ctx.targetTimeline,
    expectedDuration: '6 - 9 Months',
    clientName: ctx.clientName.trim(),
    clientEmail: ctx.clientEmail.trim(),
    clientPhone: ctx.clientPhone.trim(),
    clientOrg: 'Individual Client',
    preferredCommunication: ctx.preferredContact === 'WHATSAPP' ? 'WhatsApp & Portal Updates' : ctx.preferredContact,
    targetSpecialist: ctx.selectedService.assignedDesk,
    consentAccepted: true,
  };
}
