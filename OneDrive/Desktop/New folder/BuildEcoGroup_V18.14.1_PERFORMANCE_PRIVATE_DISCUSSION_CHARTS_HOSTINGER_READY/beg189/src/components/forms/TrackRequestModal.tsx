import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  HardHat,
  Send,
  X,
  ChevronRight,
  Lock,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { PublicTrackRecord } from '../../types/backend';
import { trackRequestApi } from '../../lib/api';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';

interface TrackRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialId?: string;
}

export const TrackRequestModal: React.FC<TrackRequestModalProps> = ({
  isOpen,
  onClose,
  initialId = '',
}) => {
  const [searchInput, setSearchInput] = useState(initialId);
  const [activeRecord, setActiveRecord] = useState<PublicTrackRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const lookupTrack = useCallback(async (term: string) => {
    const trimmed = term.trim();
    setHasSearched(true);
    setError(null);
    setActiveRecord(null);

    if (!trimmed) {
      setError('Please enter a Case ID or Enrollment ID.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await trackRequestApi(trimmed);
      setActiveRecord(res.track);
    } catch (err: any) {
      setError(err?.message || 'No record found for this tracking ID.');
      setActiveRecord(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && initialId) {
      setSearchInput(initialId);
      lookupTrack(initialId);
    }
    if (!isOpen) {
      setActiveRecord(null);
      setHasSearched(false);
      setError(null);
      setSearchInput(initialId);
    }
  }, [initialId, isOpen, lookupTrack]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    lookupTrack(searchInput);
  };

  const copyId = (recId: string) => {
    navigator.clipboard.writeText(recId);
    setCopied(true);
    showToast(`Tracking ID ${recId} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (record: PublicTrackRecord) => {
    const variant =
      record.status === 'APPROVED' || record.status === 'COMPLETED' || record.status === 'CLOSED'
        ? 'success'
        : record.status === 'REJECTED' || record.status === 'NEEDS_INFORMATION'
        ? 'danger'
        : record.status === 'UNDER_REVIEW' || record.status === 'PENDING_VERIFICATION'
        ? 'warning'
        : 'primary';
    return <Badge variant={variant} size="sm">{record.displayStatus}</Badge>;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Track My Request"
      description="Enter your server-issued Case ID (BEG-2026-XXXXXXXX) or Enrollment ID (BEG-ENR-2026-XXXXX). Status is loaded from the platform backend."
      maxWidth="2xl"
    >
      <div className="space-y-6 pt-2">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="BEG-2026-XXXXXXXX or BEG-ENR-2026-XXXXX"
              leftIcon={<Search className="w-4 h-4 text-[#7A837C]" />}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] font-bold"
          >
            {isLoading ? 'Searching...' : 'Track Status'}
          </Button>
        </form>

        {toast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between">
            <span>{toast}</span>
            <button type="button" onClick={() => setToast(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {error && hasSearched && !activeRecord && (
          <div className="p-6 text-center bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] space-y-3">
            <AlertCircle className="w-10 h-10 text-[var(--color-brand-brown)] mx-auto" />
            <div className="font-bold text-[var(--color-text)]">No record found</div>
            <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto">{error}</p>
          </div>
        )}

        {activeRecord && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F2EC]">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-extrabold text-[var(--color-primary)] bg-[#E8EFE9] px-2.5 py-0.5 rounded-lg">
                      {activeRecord.reference}
                    </span>
                    {getStatusBadge(activeRecord)}
                    <Badge variant="neutral" size="sm">{activeRecord.type}</Badge>
                  </div>
                  <h3 className="text-lg font-extrabold text-[var(--color-text)]">{activeRecord.title}</h3>
                  <div className="text-xs text-[var(--color-text-muted)] mt-1">
                    Submitted {new Date(activeRecord.createdAt).toLocaleDateString()}
                    {activeRecord.location ? ` • ${activeRecord.location}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyId(activeRecord.reference)}
                    className="p-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border-strong)] hover:bg-[#EAEFE8] text-xs font-bold text-[var(--color-text)] flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied' : 'Copy ID'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => lookupTrack(activeRecord.reference)}
                    className="p-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border-strong)] hover:bg-[#EAEFE8] text-xs font-bold text-[var(--color-text)] flex items-center gap-1"
                    title="Refresh from backend"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {!activeRecord.isFullAccess && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Contact details are hidden for privacy. Sign in with the account that submitted this request to view full details.
                  </span>
                </div>
              )}

              {activeRecord.isFullAccess && (
                <div className="p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] space-y-1 text-xs text-[var(--color-text)]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#7A837C] mb-2">Submitter Record</div>
                  {activeRecord.clientName && <div><strong>Name:</strong> {activeRecord.clientName}</div>}
                  {activeRecord.clientPhone && <div><strong>Phone:</strong> {activeRecord.clientPhone}</div>}
                  {activeRecord.clientEmail && <div><strong>Email:</strong> {activeRecord.clientEmail}</div>}
                </div>
              )}

              {activeRecord.assignedDesk && (
                <div className="p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
                    <HardHat className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#7A837C] uppercase">Assigned Desk</div>
                    <div className="text-sm font-bold text-[var(--color-text)]">{activeRecord.assignedDesk}</div>
                  </div>
                </div>
              )}

              {activeRecord.statusHistory.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">Status History</div>
                  {activeRecord.statusHistory.slice().reverse().slice(0, 5).map((log, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs">
                      <div className="flex justify-between text-[11px] text-[#7A837C] mb-1">
                        <span>{log.actorRole || 'System'}</span>
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-[var(--color-text)]">{log.reason || `${log.fromStatus} → ${log.toStatus}`}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#F0F2EC]">
                <Link to={`/track/${encodeURIComponent(activeRecord.reference)}`} onClick={onClose}>
                  <Button size="sm" variant="primary" className="bg-[var(--color-primary)] font-bold" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Open Full Tracker
                  </Button>
                </Link>
                {activeRecord.isFullAccess && activeRecord.type === 'CASE' && (
                  <Link to={ROUTES.DASHBOARD} onClick={onClose}>
                    <Button size="sm" variant="secondary" rightIcon={<ChevronRight className="w-4 h-4" />}>
                      Go to Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
