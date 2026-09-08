import React, { useState } from 'react';
import { BOQRecord, BOQRevisionRecord } from '../../types/backend';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  FileCheck2, 
  RefreshCw,
  MessageSquare,
  Lock
} from 'lucide-react';
import { formatINR } from '../../lib/money';

interface BOQApprovalBannerProps {
  boq: BOQRecord;
  revision: BOQRevisionRecord;
  userRole?: string;
  onApprove: (comment?: string) => Promise<void>;
  onRequestChanges: (comment: string, reasonCategory?: string) => Promise<void>;
  onSubmitForReview?: (notes?: string) => Promise<void>;
}

export const BOQApprovalBanner: React.FC<BOQApprovalBannerProps> = ({
  boq,
  revision,
  userRole,
  onApprove,
  onRequestChanges,
  onSubmitForReview,
}) => {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [changesComment, setChangesComment] = useState('');
  const [reasonCategory, setReasonCategory] = useState('SCOPE_ADJUSTMENT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isApproved = revision.status === 'APPROVED' || boq.status === 'APPROVED';
  const isDraft = revision.status === 'DRAFT' || boq.status === 'DRAFT';
  const isPendingReview = revision.status === 'READY_FOR_REVIEW' || boq.status === 'READY_FOR_REVIEW' || boq.status === 'CUSTOMER_REVIEW';

  const handleConfirmApprove = async () => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await onApprove(approvalComment);
      setShowApproveModal(false);
      setApprovalComment('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to approve BOQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRequestChanges = async () => {
    if (!changesComment.trim()) {
      setActionError('Please provide specific change instructions for the specialist.');
      return;
    }
    setIsSubmitting(true);
    setActionError(null);
    try {
      await onRequestChanges(changesComment, reasonCategory);
      setShowChangesModal(false);
      setChangesComment('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to request changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSubmitForReview = async () => {
    if (!onSubmitForReview) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await onSubmitForReview('Submitted for customer formal review.');
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit BOQ for review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="boq-approval-banner" className="space-y-4">
      {/* State banner */}
      {isApproved && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg text-emerald-700 dark:text-emerald-300 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-emerald-950 dark:text-emerald-200 text-sm">
                  Commercial Baseline Locked & Approved
                </h4>
                <Badge variant="success" className="text-[10px] font-mono">
                  Rev {revision.revisionNumber} Authoritative
                </Badge>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300/80 mt-1 leading-relaxed max-w-2xl">
                This bill of quantities represents the formally approved commercial benchmark ({formatINR(revision.grandTotal)}). Procurement and execution quotes can now be compared against these verified unit rates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-emerald-900 dark:text-emerald-200 bg-[var(--color-surface)]/70 dark:bg-stone-900/70 py-2 px-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Grand Total: {formatINR(revision.grandTotal)}</span>
          </div>
        </div>
      )}

      {isDraft && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-950 dark:text-amber-200 text-sm">
                Draft In-Progress (Rev {revision.revisionNumber})
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300/80 mt-0.5">
                Specialist is preparing item specifications and rates. Submit to client when lines are verified.
              </p>
            </div>
          </div>

          {onSubmitForReview && (
            <Button
              id="btn-submit-boq-review"
              variant="primary"
              size="sm"
              onClick={handleConfirmSubmitForReview}
              disabled={isSubmitting}
              className="gap-1.5 text-xs whitespace-nowrap"
            >
              <FileCheck2 className="w-4 h-4" />
              {isSubmitting ? 'Submitting...' : 'Submit for Customer Review'}
            </Button>
          )}
        </div>
      )}

      {isPendingReview && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-blue-950 dark:text-blue-200 text-sm">
                  Commercial Review Required (Rev {revision.revisionNumber})
                </h4>
                <Badge variant="warning" className="text-[10px]">Action Required</Badge>
              </div>
              <p className="text-xs text-blue-800 dark:text-blue-300/80 mt-1 max-w-xl">
                Please inspect the schedule of quantities, material specifications, and statutory tax calculations. Approve to lock this baseline or request specific revisions from the specialist.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                id="btn-request-boq-changes"
                variant="outline"
                size="sm"
                onClick={() => setShowChangesModal(true)}
                className="text-xs gap-1.5 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 hover:bg-blue-100/50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Request Adjustments
              </Button>
              <Button
                id="btn-approve-boq"
                variant="primary"
                size="sm"
                onClick={() => setShowApproveModal(true)}
                className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve Commercial Baseline
              </Button>
            </div>
          </div>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-surface)] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-semibold text-stone-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Approve Commercial Baseline
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
              You are locking Revision {revision.revisionNumber} ({formatINR(revision.grandTotal)}) as the authoritative estimate for this project.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Approval Note (Optional)
              </label>
              <textarea
                id="input-approval-note"
                rows={3}
                className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2.5 text-stone-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="e.g., Reviewed with project board and approved for execution stage."
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApproveModal(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                id="btn-confirm-approve"
                variant="primary"
                size="sm"
                onClick={handleConfirmApprove}
                disabled={isSubmitting}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? 'Recording Approval...' : 'Confirm Approval'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Request Changes Modal */}
      {showChangesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-surface)] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-semibold text-stone-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-600" />
              Request Estimate Adjustments
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
              Describe the adjustments needed. The specialist will create an updated revision for your review.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Reason Category
                </label>
                <select
                  id="select-change-category"
                  className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2 text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                >
                  <option value="SCOPE_ADJUSTMENT">Scope Adjustment (Add/Remove Quantities)</option>
                  <option value="SPECIFICATION_CHANGE">Specification / Material Brand Change</option>
                  <option value="BUDGET_CEILING">Budget Ceiling Optimization</option>
                  <option value="TAX_CORRECTION">Tax / HSN Rate Clarification</option>
                  <option value="OTHER">Other Clarification</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Specific Change Instructions *
                </label>
                <textarea
                  id="input-changes-note"
                  rows={3}
                  className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2.5 text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="e.g., Please evaluate alternative Fe 500D rebar specification to compare budget savings."
                  value={changesComment}
                  onChange={(e) => setChangesComment(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangesModal(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                id="btn-confirm-changes"
                variant="primary"
                size="sm"
                onClick={handleConfirmRequestChanges}
                disabled={isSubmitting}
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                {isSubmitting ? 'Sending Request...' : 'Submit Change Request'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
