import React, { useState } from 'react';
import { CreateBOQRequestInput, EstimateType } from '../../types/backend';
import { Button } from '../ui/Button';
import { FileSpreadsheet, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface CreateBOQModalProps {
  caseId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CreateBOQRequestInput, 'caseId'>) => Promise<void>;
}

export const CreateBOQModal: React.FC<CreateBOQModalProps> = ({
  caseId,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [estimateType, setEstimateType] = useState<EstimateType>('DETAILED_BOQ');
  const [scopeDescription, setScopeDescription] = useState('');
  const [approximateAreaSqFt, setApproximateAreaSqFt] = useState('');
  const [preferredSpecification, setPreferredSpecification] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scopeDescription.trim()) {
      setError('Title and Scope Description are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        estimateType,
        scopeDescription: scopeDescription.trim(),
        approximateAreaSqFt: approximateAreaSqFt.trim() || undefined,
        preferredSpecification: preferredSpecification.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create BOQ request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[var(--color-surface)] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl max-w-xl w-full p-6 shadow-2xl my-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-semibold text-stone-900 dark:text-white">
              Initialize Commercial Bill of Quantities (BOQ)
            </h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
              BOQ Estimate Title *
            </label>
            <input
              id="input-boq-title"
              type="text"
              required
              className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2.5 text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g., Structural Foundation & Superstructure Estimate"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Estimate Stage / Type
              </label>
              <select
                id="select-estimate-type"
                className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2 text-stone-900 dark:text-white outline-none"
                value={estimateType}
                onChange={(e) => setEstimateType(e.target.value as EstimateType)}
              >
                <option value="CONCEPTUAL_ESTIMATE">Conceptual Estimate</option>
                <option value="PRELIMINARY_BOQ">Preliminary BOQ</option>
                <option value="DETAILED_BOQ">Detailed Working BOQ</option>
                <option value="REVISED_ESTIMATE">Revised Commercial Schedule</option>
                <option value="FINAL_EXECUTION_BILL">Final Execution Bill</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Approximate Area / Built Scale
              </label>
              <input
                id="input-boq-area"
                type="text"
                className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2 text-stone-900 dark:text-white outline-none"
                placeholder="e.g., 14,500 sq ft"
                value={approximateAreaSqFt}
                onChange={(e) => setApproximateAreaSqFt(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
              Preferred Specification Tier
            </label>
            <input
              id="input-boq-pref-spec"
              type="text"
              className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2 text-stone-900 dark:text-white outline-none"
              placeholder="e.g., Sustainable Low-Carbon / Fe 550D Rebar / Tier 1 Solar"
              value={preferredSpecification}
              onChange={(e) => setPreferredSpecification(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
              Scope of Works & Technical Charter *
            </label>
            <textarea
              id="input-boq-scope"
              rows={3}
              required
              className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2.5 text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Describe what civil, structural, mechanical or finish items will be included in this estimate schedule..."
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
              Internal Notes / Special Instructions
            </label>
            <input
              id="input-boq-notes"
              type="text"
              className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2 text-stone-900 dark:text-white outline-none"
              placeholder="e.g., Cross-verify rates with Bengaluru Master Schedule 2024."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              id="btn-confirm-create-boq"
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Initializing...' : 'Create BOQ Schedule'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
