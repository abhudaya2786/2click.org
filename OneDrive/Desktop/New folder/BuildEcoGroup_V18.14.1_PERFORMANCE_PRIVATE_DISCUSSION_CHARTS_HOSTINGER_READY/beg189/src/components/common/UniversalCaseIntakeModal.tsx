import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck } from 'lucide-react';
import { GuidedRequirementWizard } from '../forms/GuidedRequirementWizard';
import { getServiceById, mapSearchParamToService } from '../../lib/servicesRegistry';
import { ROUTES } from '../../lib/routes';

interface UniversalCaseIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultObjective?: string;
  defaultCategory?: string;
  defaultServiceId?: string;
}

export const UniversalCaseIntakeModal: React.FC<UniversalCaseIntakeModalProps> = ({
  isOpen,
  onClose,
  defaultObjective,
  defaultCategory,
  defaultServiceId,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Resolve service definition
  let resolvedServiceId = defaultServiceId;
  if (!resolvedServiceId && defaultCategory) {
    const svc = mapSearchParamToService(defaultCategory);
    resolvedServiceId = svc.id;
  } else if (!resolvedServiceId && defaultObjective) {
    const svc = mapSearchParamToService(defaultObjective);
    resolvedServiceId = svc.id;
  }

  const activeService = resolvedServiceId ? getServiceById(resolvedServiceId) : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-[var(--color-surface)] rounded-3xl shadow-2xl border border-[var(--color-border)] my-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--color-brand-brown)] uppercase tracking-wider">
                Start New Request
              </div>
              <div className="text-sm font-extrabold text-[var(--color-text)]">
                {activeService ? activeService.title : 'BuildEcoGroup Requirement Intake'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#7A837C] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] rounded-xl transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[82vh] overflow-y-auto">
          <GuidedRequirementWizard
            initialServiceId={resolvedServiceId}
            onCancel={onClose}
            isModal={true}
            onSuccess={(caseReference) => {
              onClose();
              navigate(`${ROUTES.DASHBOARD}?highlight=${encodeURIComponent(caseReference)}`);
            }}
          />
        </div>
      </div>
    </div>
  );
};
