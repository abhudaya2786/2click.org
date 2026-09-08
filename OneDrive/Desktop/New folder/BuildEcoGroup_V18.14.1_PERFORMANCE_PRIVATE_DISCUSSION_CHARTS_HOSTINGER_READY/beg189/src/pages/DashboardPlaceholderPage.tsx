import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Layers, 
  ShieldCheck, 
  Users,
  PlusCircle,
  ArrowRight
} from 'lucide-react';

export const DashboardPlaceholderPage: React.FC<{ title?: string; description?: string }> = ({ title = 'Project Orchestration Workspace', description = 'Standardized case management, consultant deliverables, and milestone sign-offs.' }) => {
  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              {title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
            {description}
          </p>
        </div>

        <Link to={ROUTES.SUBMIT_REQUIREMENT}>
          <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
            New Project Requirement
          </Button>
        </Link>
      </div>

      <div className="p-4 rounded-xl bg-[#EAF4F8] border border-[#C6DEE8] flex items-start gap-3 text-xs text-[#0C2939]">
        <ShieldCheck className="w-5 h-5 text-[var(--color-brand-brown)] shrink-0 mt-0.5" />
        <p className="leading-relaxed"><strong>Case-linked workspace:</strong> access is controlled by the signed-in user role and all production records are intended to persist through PostgreSQL.</p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card variant="default" className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">Active Case Files</span>
            <FolderKanban className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
          <div className="text-2xl font-bold font-mono-code text-[var(--color-text)]">1</div>
          <span className="text-[11px] text-[var(--color-primary)] font-medium">Case #BEG-2026-942 (Intake Verified)</span>
        </Card>

        <Card variant="default" className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">Assigned Specialists</span>
            <Users className="w-4 h-4 text-[var(--color-brand-brown)]" />
          </div>
          <div className="text-2xl font-bold font-mono-code text-[var(--color-text)]">2</div>
          <span className="text-[11px] text-[var(--color-brand-brown)] font-medium">Structural + Bioclimatic Lead</span>
        </Card>

        <Card variant="default" className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">Milestone Progression</span>
            <Clock className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
          <div className="text-2xl font-bold font-mono-code text-[var(--color-text)]">Stage 2 of 5</div>
          <span className="text-[11px] text-[var(--color-text-muted)]">BOQ Tender Matrix Generation</span>
        </Card>
      </div>

      {/* Sample Active Case Table Preview */}
      <Card variant="default" className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <div>
            <h3 className="text-base font-bold text-[var(--color-text)]">Active Project Cases</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Overview of ongoing requirement briefs and milestones</p>
          </div>
          <Badge variant="primary" size="sm">
            Live Case
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-subtle)] font-mono-code uppercase">
                <th className="pb-3 font-semibold">Case ID</th>
                <th className="pb-3 font-semibold">Project Title</th>
                <th className="pb-3 font-semibold">Location</th>
                <th className="pb-3 font-semibold">Pillar</th>
                <th className="pb-3 font-semibold">Stage</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF6FB] text-[var(--color-text)]">
              <tr>
                <td className="py-3.5 font-mono-code font-bold text-[var(--color-primary)]">
                  BEG-2026-942
                </td>
                <td className="py-3.5 font-semibold">
                  Bioclimatic Residential Villa & Microgrid
                </td>
                <td className="py-3.5 text-[var(--color-text-muted)]">
                  Bengaluru, KA
                </td>
                <td className="py-3.5">
                  <Badge variant="primary" size="sm">
                    Pillar 01 & 05
                  </Badge>
                </td>
                <td className="py-3.5">
                  <span className="inline-flex items-center gap-1 text-[var(--color-brand-brown)] font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    Specialist Matching
                  </span>
                </td>
                <td className="py-3.5 text-right">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};
