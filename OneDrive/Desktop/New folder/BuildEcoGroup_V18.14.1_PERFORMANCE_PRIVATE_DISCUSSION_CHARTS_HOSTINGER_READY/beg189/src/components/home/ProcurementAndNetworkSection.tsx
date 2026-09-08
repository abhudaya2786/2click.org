import React from 'react';
import { 
  ShoppingBag, 
  Users, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Building, 
  HardHat, 
  Wrench,
  PackageCheck
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ROUTES } from '../../lib/routes';
import { Link } from 'react-router-dom';

interface ProcurementAndNetworkSectionProps {
  onOpenIntake: (objective: string, category: string) => void;
}

export const ProcurementAndNetworkSection: React.FC<ProcurementAndNetworkSectionProps> = ({
  onOpenIntake,
}) => {
  const materials = [
    { name: 'Fe 550D TMT Reinforcement Steel', spec: 'IS 1786 Certified Primary Steel', save: 'Direct Mill Rate' },
    { name: 'OPC / PPC 53 Grade Cement', spec: 'Batch-Tested Ultra-High Strength', save: 'Factory Dispatch' },
    { name: 'AAC Lightweight Autoclaved Blocks', spec: 'Thermal Insulative Grade 1', save: 'Direct Plant Pricing' },
    { name: 'Tier-1 Mono-PERC Solar Panels', spec: '540W+ High-Efficiency Modules', save: 'Distributor Terms' },
  ];

  const networkRoles = [
    {
      title: 'Become a Developer / Land Partner',
      badge: 'Land & JV',
      icon: Building,
      desc: 'Partner on plotted developments, high-yield JVs, and institutional construction management contracts.',
      roleType: 'DEVELOPER',
    },
    {
      title: 'Join as Professional Consultant',
      badge: 'Engineering & Arch',
      icon: Users,
      desc: 'Empanel your architectural, structural, MEP, or geospatial practice for peer review and design cases.',
      roleType: 'CONSULTANT',
    },
    {
      title: 'Register as Vendor / Supplier',
      badge: 'Material Mart',
      icon: Truck,
      desc: 'Supply cement, steel, glazing, solar inverters, and electrical components directly to verified active projects.',
      roleType: 'VENDOR',
    },
    {
      title: 'Join as Skilled Partner / Technician',
      badge: 'Skilled Trades',
      icon: Wrench,
      desc: 'Receive structured work orders for certified electrical, plumbing, carpentry, and solar installation tasks.',
      roleType: 'SKILLED_PERSON',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[var(--color-background)] border-b border-[var(--color-border)]">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* 1. Procurement Section */}
        <div className="bg-[var(--color-surface)] p-6 sm:p-10 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--color-border)]">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2">
                <Badge variant="primary" size="md" icon={<ShoppingBag className="w-3.5 h-3.5" />}>
                  2CLICK Procurement Desk
                </Badge>
                <span className="text-xs font-bold text-[var(--color-brand-brown)] uppercase tracking-wider">
                  Direct Factory Terms
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-[var(--color-text)]">
                Material Procurement & Wholesale Supply
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
                Procure primary building materials, reinforcement steel, cement, and solar hardware directly from verified manufacturers with zero middleman markups.
              </p>
            </div>

            <Button
              variant="secondary"
              size="md"
              onClick={() => onOpenIntake('Material Procurement Request', 'Procurement')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Request Material RFQ
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {materials.map((m) => (
              <div key={m.name} className="p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] space-y-2">
                <div className="flex items-center justify-between">
                  <PackageCheck className="w-4 h-4 text-[var(--color-primary)]" />
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {m.save}
                  </span>
                </div>
                <div className="font-bold text-xs text-[var(--color-text)]">{m.name}</div>
                <div className="text-[11px] text-[var(--color-text-muted)]">{m.spec}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Join the Network */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="brown" size="md">
              Ecosystem Empanelment
            </Badge>
            <h2 className="text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
              Join the BuildEcoGroup Network
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Collaborate with India's premier technical orchestration platform for land, construction, and sustainable engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {networkRoles.map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.title}
                  className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-xs flex flex-col justify-between space-y-5 hover:border-[var(--color-primary)] transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-[var(--color-brand-brown)] bg-[var(--color-surface-muted)] px-2 py-0.5 rounded">
                        {r.badge}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[var(--color-text)]">{r.title}</h4>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{r.desc}</p>
                  </div>

                  <div className="pt-3 border-t border-[var(--color-border)]">
                    <Link to={`${ROUTES.ONBOARDING}?role=${r.roleType}`}>
                      <Button variant="ghost" size="sm" fullWidth rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Apply to Join
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
