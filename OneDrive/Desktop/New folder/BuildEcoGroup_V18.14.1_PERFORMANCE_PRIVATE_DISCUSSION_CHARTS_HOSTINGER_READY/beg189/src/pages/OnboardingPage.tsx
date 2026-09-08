import React from 'react';
import { PageContainer } from '../components/ui/PageContainer';
import { Badge } from '../components/ui/Badge';
import { ROUTES } from '../lib/routes';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Award,
  Users,
  Compass,
  HardHat,
  Phone
} from 'lucide-react';
import { DynamicEnrollmentForm } from '../components/forms/DynamicEnrollmentForm';
import { PageHeroMedia } from '../components/ui/ResponsiveMedia';
import { EnrollmentRole } from '../types/forms';

export const OnboardingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rawRole = searchParams.get('role') || 'PROFESSIONAL';

  const parseRole = (r: string): EnrollmentRole => {
    const upper = r.toUpperCase();
    if (upper.includes('SKILL') || upper.includes('TRADE') || upper.includes('PLUMB') || upper.includes('ELEC')) return 'SKILLED_PERSON';
    if (upper.includes('SERV') || upper.includes('SOLAR') || upper.includes('WATER') || upper.includes('STP')) return 'SERVICE_PROVIDER';
    if (upper.includes('CONT') || upper.includes('BUILDER')) return 'CONTRACTOR';
    if (upper.includes('VEND') || upper.includes('SUPPL')) return 'VENDOR_SUPPLIER';
    if (upper.includes('SHOP') || upper.includes('DEAL')) return 'SHOP_DEALER';
    if (upper.includes('BRAND') || upper.includes('DIST')) return 'BRAND_DISTRIBUTOR';
    if (upper.includes('MACH') || upper.includes('EQUIP') || upper.includes('JCB')) return 'MACHINERY_PROVIDER';
    if (upper.includes('LAND')) return 'LAND_PROVIDER';
    if (upper.includes('DEV')) return 'DEVELOPER_BUILDER';
    return 'PROFESSIONAL';
  };

  const initialRole = parseRole(rawRole);

  return (
    <div className="py-8 sm:py-12 bg-[var(--color-background)] min-h-screen">
      <PageContainer>
        
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8 space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2">
            <Badge variant="primary" size="md" icon={<Award className="w-3.5 h-3.5" />}>
              BuildEcoGroup Network Empanelment
            </Badge>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">
              Verified Provider Portal
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] tracking-tight">
            Join BuildEcoGroup Network
          </h1>

          <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed max-w-3xl">
            Empanel as a CoA architect, chartered structural engineer, certified skilled tradesman, factory vendor, machinery fleet owner, or land provider. Receive pre-scoped project allocations and secure escrow milestone payments.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-bold text-[var(--color-primary)]">
            <div className="flex items-center gap-1.5 bg-[var(--color-surface)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span>Zero Platform Listing Fees</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[var(--color-surface)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span>Milestone Escrow Payment Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[var(--color-surface)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
              <Users className="w-3.5 h-3.5 text-[var(--color-brand-brown)]" />
              <span>Direct Client Allocation Desk</span>
            </div>
          </div>
        </div>

        {/* Dynamic Enrollment Form Component */}
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeroMedia assetKey="enrollment_network_hero" className="rounded-3xl" />
          <p className="text-center text-[11px] text-[var(--color-text-subtle)]">
            Illustrative — professional network empanelment context (not individual profile photos).
          </p>
          <DynamicEnrollmentForm initialRole={initialRole} />
        </div>

      </PageContainer>
    </div>
  );
};
