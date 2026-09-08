export interface PillarItem {
  id: string;
  number: string;
  title: string;
  shortDescription: string;
  detailedDescription?: string;
  icon: string;
  href: string;
  badge?: string;
  keyCapabilities: string[];
}

export interface SecondaryCapability {
  id: string;
  title: string;
  category: 'Technology' | 'Engineering' | 'Site' | 'Sustainability';
  description: string;
  icon: string;
  href: string;
  tag: string;
}

export interface ConsultantMock {
  id: string;
  name: string;
  title: string;
  specialization: string;
  city: string;
  state: string;
  experienceLabel: string;
  verifiedStatus: 'Verified Specialist' | 'Credential Vetted' | 'Empaneled Expert';
  avatarUrl: string;
  focusAreas: string[];
  department: string;
}

export interface WorkflowStepItem {
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  deliverable: string;
}

export interface TrustCapabilityItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  guaranteeNote: string;
}

export interface RequirementFormData {
  fullName: string;
  email: string;
  phone: string;
  projectCity: string;
  projectType: string;
  serviceCategory: string;
  budgetBand: string;
  notes: string;
}
