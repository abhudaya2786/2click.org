/** Curated contextual photography for the public service catalog and detail pages. */
export const SERVICE_MEDIA_KEYS: Record<string, string> = {
  construction: 'hero_construction_controls',
  land: 'hero_plotted_land',
  solar: 'solar_residential_rooftop',
  boq: 'boq_hero_materials',
  surveillance: 'tech_cctv_iot_monitoring',
  water: 'water_stp_modular',
  waste: 'water_stp_modular',
  maintenance: 'pm_facility_technician',
  gis: 'land_gis_drone_survey',
  interior: 'const_stage_7_interior',
  consultants: 'consultant_discipline_hero',
  material: 'mat_tmt_steel',
  vastu: 'prop_luxury_villa',
  workers: 'trade_electrician_action',
  equipment: 'machinery_jcb_excavator',
};

export const serviceMediaKey = (serviceId: string): string =>
  SERVICE_MEDIA_KEYS[serviceId] ?? 'hero_modern_development';
