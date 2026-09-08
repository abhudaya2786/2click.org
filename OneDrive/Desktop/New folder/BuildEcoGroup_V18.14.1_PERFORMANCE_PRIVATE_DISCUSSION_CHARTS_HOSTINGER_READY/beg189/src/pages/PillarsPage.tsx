import React from 'react';
import { PageContainer } from '../components/ui/PageContainer';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { FIVE_PILLARS } from '../lib/constants';
import { ServiceRegistryIcon } from '../components/ui/AppIcon';
import { 
  ArrowRight, 
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

export const PillarsPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 space-y-16">
      <PageContainer>
        
        {/* Header Intro */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2">
            <Badge variant="primary" size="md">
              Operational Architecture
            </Badge>
            <span className="text-xs font-mono-code text-[var(--color-brand-brown)] font-semibold">
              5 Core Strategic Verticals
            </span>
          </div>
          <h1 className="text-h1 text-[var(--color-text)]">
            The 5 Pillars of BuildEcoGroup
          </h1>
          <p className="text-body-large text-[var(--color-text-muted)] leading-relaxed">
            Every building or land initiative is decomposed into five core pillars. This modular structure provides rigorous quality gates, transparent pricing, and coordinated specialist execution.
          </p>
        </div>

        {/* 5 In-Depth Pillars List */}
        <div className="space-y-10 pt-8">
          {FIVE_PILLARS.map((pillar, index) => (
            <div
              key={pillar.id}
              id={pillar.id}
              className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-10 shadow-sm space-y-6 scroll-mt-24"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-subtle)] flex items-center justify-center shrink-0">
                    <ServiceRegistryIcon iconName={pillar.icon} size="lg" className="text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <span className="font-mono-code text-xs font-bold text-[var(--color-brand-brown)] tracking-wider uppercase">
                      PILLAR {pillar.number}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">
                      {pillar.title}
                    </h2>
                  </div>
                </div>

                {pillar.badge && (
                  <Badge variant="primary" size="md">
                    {pillar.badge}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
                    {pillar.detailedDescription || pillar.shortDescription}
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                    All activities within this pillar operate under clear milestone checklists, independent peer reviews, and verifiable digital deliverables stored in your Case Vault.
                  </p>
                </div>

                <div className="lg:col-span-5 bg-[var(--color-background)] rounded-xl p-5 border border-[var(--color-border)] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-brown)]">
                    Key Capability Deliverables
                  </h4>
                  <ul className="space-y-2 text-xs text-[var(--color-text)]">
                    {pillar.keyCapabilities.map((cap) => (
                      <li key={cap} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#EAF6FB]">
                <span className="text-xs text-[var(--color-text-subtle)]">
                  Standardized Engagement Model • Independent Empaneled Specialists
                </span>
                <Link to={`${ROUTES.SUBMIT_REQUIREMENT}&pillar=${pillar.id}`}>
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Submit Case for Pillar {pillar.number}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </PageContainer>
    </div>
  );
};
