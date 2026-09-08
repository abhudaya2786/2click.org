import React from 'react';
import { 
  ShieldCheck, 
  FileCheck2, 
  Lock, 
  Scale, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Building,
  Users
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { APP_CONFIG } from '../../lib/constants';
import { ROUTES } from '../../lib/routes';
import { Link } from 'react-router-dom';

export const LegalTrustSection: React.FC = () => {
  const trustPillars = [
    {
      title: '1. Neutral Platform Orchestration',
      icon: Scale,
      badge: 'Zero Contractor Bias',
      description: 'BuildEcoGroup operates as a technology and technical orchestration platform, not a general building contractor or speculative broker. We maintain complete independence to protect the client’s capital.',
    },
    {
      title: '2. Professional Responsibility Standard',
      icon: ShieldCheck,
      badge: 'Statutory Compliance',
      description: 'Relevant professional registrations, statutory clearances, municipal approvals, and environmental project certifications are handled directly by the applicable authorised professional/provider.',
    },
    {
      title: '3. Stage-Gated Milestone Governance',
      icon: Lock,
      badge: 'Protected Milestones',
      description: 'Project disbursements are tied strictly to verified physical site milestones certified by independent structural peer reviewers, eliminating unauthorized cost overruns.',
    },
    {
      title: '4. Immutable Digital Project Vault',
      icon: FileCheck2,
      badge: 'Auditable Records',
      description: 'Every drawing revision, soil test, material batch certificate, site photo, and consultant sign-off is permanently archived under an auditable Case ID.',
    },
  ];

  return (
    <section id="trust" className="py-16 sm:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)] scroll-mt-20">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="primary" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Platform Governance & Compliance
          </Badge>
          <h2 className="text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
            Built on Rigorous Governance & Statutory Integrity
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Transparent operating principles ensuring independent verification, statutory responsibility, and structured accountability across every project.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trustPillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="p-6 sm:p-7 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-surface)] px-2.5 py-1 rounded border border-[var(--color-border)]">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--color-text)]">{p.title}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{p.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Official Statutory Disclaimer Banner */}
        <div className="p-6 rounded-2xl bg-[#222723] text-[#FAFAFA] border border-[#2E352F] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#7ED0E8] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#7ED0E8]" />
            <span>Statutory & Regulatory Disclosure</span>
          </div>

          <p className="text-xs text-[#C4CCC6] leading-relaxed">
            BuildEcoGroup is a connected orchestration platform for land development, construction management, professionals, procurement and property lifecycle coordination. BuildEcoGroup does not directly execute general contracting or act as an architectural firm. Relevant professional registrations (COA, Council of Engineers), statutory municipal sanctions (RERA, Master Plan approvals), and project green rating certifications (GRIHA, IGBC, LEED) are executed and held by the respective empaneled licensed professionals and project owners.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#959E97]">
            <Link to={`${ROUTES.ABOUT}#terms`} className="hover:text-white underline">
              Terms of Platform Service
            </Link>
            <span>•</span>
            <Link to={`${ROUTES.ABOUT}#privacy`} className="hover:text-white underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to={`${ROUTES.ABOUT}#disclaimer`} className="hover:text-white underline">
              Specialist Independence Disclaimer
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};
