/**
 * BuildEcoGroup — unified Lucide icon system
 * Single source of truth for icon tokens, sizes, stroke, and accessible labels.
 */
import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  Bell,
  Bot,
  CalendarClock,
  Compass,
  Download,
  FileSpreadsheet,
  FileText,
  GitCompare,
  Globe,
  HardHat,
  Hash,
  HelpCircle,
  Home,
  IndianRupee,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Package,
  Paintbrush,
  Search,
  ShieldCheck,
  Sun,
  Truck,
  UploadCloud,
  User,
  Users,
  Wrench,
  Camera,
  Droplets,
  Recycle,
  ClipboardList,
  Ban,
  Crown,
} from 'lucide-react';

/** Consistent stroke width across the product UI */
export const ICON_STROKE = 1.75;

/** Pixel sizes — use these tokens, not ad-hoc w-4/h-5 mixes */
export const ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export type IconSize = keyof typeof ICON_SIZES;

/** Semantic icon tokens used across marketing, dashboards, and forms */
export type IconToken =
  | 'construction'
  | 'land'
  | 'property'
  | 'gis'
  | 'solar'
  | 'interior'
  | 'renovation'
  | 'material'
  | 'boq'
  | 'consultant'
  | 'vendor'
  | 'caseId'
  | 'tracking'
  | 'messages'
  | 'documents'
  | 'notification'
  | 'profile'
  | 'dashboard'
  | 'location'
  | 'budget'
  | 'timeline'
  | 'compare'
  | 'approval'
  | 'verified'
  | 'security'
  | 'help'
  | 'copilot'
  | 'search'
  | 'upload'
  | 'download'
  | 'home'
  | 'surveillance'
  | 'water'
  | 'waste'
  | 'maintenance'
  | 'coordinator'
  | 'admin'
  | 'superAdmin'
  | 'suspended'
  | 'customer';

export const ICON_COMPONENTS: Record<IconToken, LucideIcon> = {
  construction: HardHat,
  land: Compass,
  property: Home,
  gis: Globe,
  solar: Sun,
  interior: Paintbrush,
  renovation: Wrench,
  material: Package,
  boq: FileSpreadsheet,
  consultant: Users,
  vendor: Truck,
  caseId: Hash,
  tracking: Compass,
  messages: MessageSquare,
  documents: FileText,
  notification: Bell,
  profile: User,
  dashboard: LayoutDashboard,
  location: MapPin,
  budget: IndianRupee,
  timeline: CalendarClock,
  compare: GitCompare,
  approval: BadgeCheck,
  verified: BadgeCheck,
  security: ShieldCheck,
  help: HelpCircle,
  copilot: Bot,
  search: Search,
  upload: UploadCloud,
  download: Download,
  home: Home,
  surveillance: Camera,
  water: Droplets,
  waste: Recycle,
  maintenance: Wrench,
  coordinator: ClipboardList,
  admin: ShieldCheck,
  superAdmin: Crown,
  suspended: Ban,
  customer: User,
};

/** English + Hindi accessible labels */
export const ICON_LABELS: Record<IconToken, { en: string; hi: string }> = {
  construction: { en: 'Construction', hi: 'निर्माण' },
  land: { en: 'Land', hi: 'ज़मीन' },
  property: { en: 'Property', hi: 'प्रॉपर्टी' },
  gis: { en: 'GIS mapping', hi: 'GIS मैपिंग' },
  solar: { en: 'Solar energy', hi: 'सोलर ऊर्जा' },
  interior: { en: 'Interior design', hi: 'इंटीरियर' },
  renovation: { en: 'Renovation', hi: 'रेनोवेशन' },
  material: { en: 'Material supply', hi: 'सामग्री' },
  boq: { en: 'BOQ and costing', hi: 'BOQ और लागत' },
  consultant: { en: 'Consultant', hi: 'विशेषज्ञ' },
  vendor: { en: 'Vendor', hi: 'विक्रेता' },
  caseId: { en: 'Case ID', hi: 'केस ID' },
  tracking: { en: 'Track request', hi: 'अनुरोध ट्रैक करें' },
  messages: { en: 'Messages', hi: 'संदेश' },
  documents: { en: 'Documents', hi: 'दस्तावेज़' },
  notification: { en: 'Notifications', hi: 'सूचनाएँ' },
  profile: { en: 'Profile', hi: 'प्रोफ़ाइल' },
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  location: { en: 'Location', hi: 'स्थान' },
  budget: { en: 'Budget', hi: 'बजट' },
  timeline: { en: 'Timeline', hi: 'समयसीमा' },
  compare: { en: 'Compare', hi: 'तुलना' },
  approval: { en: 'Approval', hi: 'अनुमोदन' },
  verified: { en: 'Verified', hi: 'सत्यापित' },
  security: { en: 'Security', hi: 'सुरक्षा' },
  help: { en: 'Help', hi: 'सहायता' },
  copilot: { en: 'BuildEco assistant', hi: 'BuildEco सहायक' },
  search: { en: 'Search', hi: 'खोजें' },
  upload: { en: 'Upload', hi: 'अपलोड' },
  download: { en: 'Download', hi: 'डाउनलोड' },
  home: { en: 'Home', hi: 'होम' },
  surveillance: { en: 'Site surveillance', hi: 'साइट निगरानी' },
  water: { en: 'Water treatment', hi: 'जल उपचार' },
  waste: { en: 'Waste management', hi: 'कचरा प्रबंधन' },
  maintenance: { en: 'Maintenance', hi: 'रखरखाव' },
  coordinator: { en: 'Coordinator', hi: 'कोऑर्डिनेटर' },
  admin: { en: 'Administrator', hi: 'प्रशासक' },
  superAdmin: { en: 'Super administrator', hi: 'सुपर एडमिन' },
  suspended: { en: 'Suspended account', hi: 'निलंबित खाता' },
  customer: { en: 'Customer', hi: 'ग्राहक' },
};

/** Optional accent colors per domain (Tailwind text classes) */
export const ICON_COLORS: Partial<Record<IconToken, string>> = {
  construction: 'text-[var(--color-primary)]',
  land: 'text-[var(--color-brand-brown)]',
  solar: 'text-[#E5A93C]',
  boq: 'text-[var(--color-primary)]',
  interior: 'text-[#8E44AD]',
  material: 'text-[#D35400]',
  consultant: 'text-[#3A4D6B]',
  gis: 'text-[var(--color-brand-brown)]',
  water: 'text-[#2B7A78]',
  waste: 'text-[#27AE60]',
  surveillance: 'text-[#2C3E50]',
  property: 'text-[#8E44AD]',
  copilot: 'text-[#0F6F91]',
  security: 'text-[var(--color-primary)]',
  verified: 'text-[#16A34A]',
};

/** servicesRegistry iconName → semantic token */
const LUCIDE_NAME_TO_TOKEN: Record<string, IconToken> = {
  HardHat: 'construction',
  Compass: 'land',
  Sun: 'solar',
  FileSpreadsheet: 'boq',
  Camera: 'surveillance',
  Droplets: 'water',
  Recycle: 'waste',
  Wrench: 'maintenance',
  Globe: 'gis',
  Building2: 'property',
  Users: 'consultant',
  Layers: 'material',
  Truck: 'vendor',
};

/** Service catalog id → token */
const SERVICE_ID_TO_TOKEN: Record<string, IconToken> = {
  construction: 'construction',
  land: 'land',
  solar: 'solar',
  boq: 'boq',
  surveillance: 'surveillance',
  water: 'water',
  waste: 'waste',
  maintenance: 'maintenance',
  gis: 'gis',
  interior: 'interior',
  consultants: 'consultant',
  material: 'material',
  vastu: 'land',
  workers: 'construction',
  equipment: 'vendor',
};

/** Homepage goal id → token */
const GOAL_ID_TO_TOKEN: Record<string, IconToken> = {
  build: 'construction',
  land: 'land',
  solar: 'solar',
  interior: 'interior',
  boq: 'boq',
  material: 'material',
  expert: 'consultant',
  track: 'tracking',
};

export function iconTokenFromLucideName(iconName: string): IconToken {
  return LUCIDE_NAME_TO_TOKEN[iconName] ?? 'construction';
}

export function iconTokenFromServiceId(serviceId: string): IconToken {
  return SERVICE_ID_TO_TOKEN[serviceId] ?? iconTokenFromLucideName(serviceId);
}

export function iconTokenFromGoalId(goalId: string): IconToken {
  return GOAL_ID_TO_TOKEN[goalId] ?? 'help';
}

export function getIconLabel(token: IconToken, language: 'en' | 'hi' = 'en'): string {
  return ICON_LABELS[token][language];
}

/** Dev role quick-switch labels */
export const DEV_ROLE_ICON: Record<string, IconToken> = {
  CUSTOMER: 'customer',
  CONSULTANT: 'consultant',
  EMPLOYEE: 'coordinator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superAdmin',
  SUSPENDED: 'suspended',
};
