import React from 'react';
import { WORKFLOW_STEPS } from '../../lib/constants';
import { 
  FileSpreadsheet, 
  FolderKanban, 
  UserCheck, 
  Scale, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../../lib/cn';

const STEP_ICONS: Record<string, React.ReactNode> = {
  FileSpreadsheet: <FileSpreadsheet className="w-5 h-5" />,
  FolderKanban: <FolderKanban className="w-5 h-5" />,
  UserCheck: <UserCheck className="w-5 h-5" />,
  Scale: <Scale className="w-5 h-5" />,
  CheckCircle2: <CheckCircle2 className="w-5 h-5" />,
};

export const WorkflowSteps: React.FC = () => {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-brown)] px-3 py-1 rounded-full bg-[#EAF4F8] border border-[#C6DEE8] inline-block">
            Standardized Orchestration Journey
          </span>
          <h2 className="text-h2 text-[var(--color-text)]">
            How BuildEcoGroup Coordinates Your Project
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
            A transparent 5-stage workflow connecting structured client requirements with vetted domain specialists, itemized BOQ comparisons, and milestone tracking.
          </p>
        </div>

        {/* 5-Step Process Layout (Horizontal on Desktop, Vertical on Mobile) */}
        <div className="relative">
          
          {/* Desktop connecting guide line */}
          <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-0.5 bg-[#D6E8F0] -translate-y-8 z-0 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 relative z-10">
            {WORKFLOW_STEPS.map((step, idx) => (
              <div
                key={step.stepNumber}
                className="group flex flex-col justify-between bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] p-6 shadow-xs hover:border-[#1697C4]/50 hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-4">
                  {/* Step Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-primary)] flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                      {STEP_ICONS[step.icon] || <FileSpreadsheet className="w-5 h-5" />}
                    </div>
                    <span className="font-mono-code text-xs font-extrabold text-[var(--color-brand-brown)] bg-[#EAF4F8] px-2.5 py-1 rounded-md border border-[#C6DEE8]">
                      STEP 0{step.stepNumber}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs font-semibold text-[var(--color-brand-brown)] mt-0.5">
                      {step.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Deliverable Box */}
                <div className="mt-4 pt-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 rounded-lg border">
                  <span className="text-[10px] font-mono-code uppercase font-bold text-[var(--color-text-subtle)] block">
                    Key Deliverable
                  </span>
                  <span className="text-xs font-semibold text-[var(--color-primary)] block mt-0.5">
                    {step.deliverable}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
