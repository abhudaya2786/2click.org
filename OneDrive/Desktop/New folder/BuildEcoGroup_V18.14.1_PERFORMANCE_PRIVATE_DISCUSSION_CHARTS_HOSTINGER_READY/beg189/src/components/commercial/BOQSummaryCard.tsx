import React from 'react';
import { BOQRecord } from '../../types/backend';
import { formatINR } from '../../lib/money';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Building2, 
  Layers, 
  Eye, 
  Plus, 
  FileText,
  TrendingDown,
  ShieldCheck
} from 'lucide-react';

interface BOQSummaryCardProps {
  boq: BOQRecord;
  onSelect: (boq: BOQRecord) => void;
  onRequestNewRevision?: (boq: BOQRecord) => void;
  onOpenComparison?: (boq: BOQRecord) => void;
  onOpenPrintView?: (boq: BOQRecord) => void;
}

export const BOQSummaryCard: React.FC<BOQSummaryCardProps> = ({
  boq,
  onSelect,
  onRequestNewRevision,
  onOpenComparison,
  onOpenPrintView,
}) => {
  const currentRev = boq.currentRevision;
  const itemsCount = currentRev?.items?.length || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success" className="gap-1 font-mono text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Baseline Approved</Badge>;
      case 'READY_FOR_REVIEW':
      case 'CUSTOMER_REVIEW':
        return <Badge variant="warning" className="gap-1 font-mono text-xs"><Clock className="w-3.5 h-3.5" /> Customer Review</Badge>;
      case 'REVISION_REQUESTED':
        return <Badge variant="warning" className="gap-1 font-mono text-xs"><AlertCircle className="w-3.5 h-3.5" /> Revision Requested</Badge>;
      case 'DRAFT':
      default:
        return <Badge variant="neutral" className="gap-1 font-mono text-xs"><Clock className="w-3.5 h-3.5" /> Draft In-Progress</Badge>;
    }
  };

  return (
    <div 
      id={`boq-card-${boq.id}`}
      className="bg-[var(--color-surface)] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              {boq.boqReference}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">
              Rev {currentRev?.revisionNumber || 1}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
              {boq.estimateType.replace('_', ' ')}
            </span>
            {getStatusBadge(boq.status)}
          </div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white mt-1">
            {boq.title}
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5 line-clamp-2">
            {boq.scopeDescription}
          </p>
        </div>

        <div className="flex flex-col lg:items-end bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-lg border border-stone-200/60 dark:border-stone-700/60 min-w-[200px]">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            Commercial Baseline
          </span>
          <span className="text-2xl font-bold font-mono text-stone-900 dark:text-white mt-0.5">
            {formatINR(currentRev?.grandTotal || 0)}
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-mono mt-0.5">
            Tax: {formatINR(currentRev?.taxTotal || 0)} • {itemsCount} items
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-xs">
        <div>
          <span className="text-stone-500 dark:text-stone-400 block mb-0.5">Prepared By</span>
          <span className="font-medium text-stone-800 dark:text-stone-200 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-stone-400" />
            {boq.createdByName || 'Specialist Partner'}
          </span>
        </div>
        <div>
          <span className="text-stone-500 dark:text-stone-400 block mb-0.5">Approx. Area / Scale</span>
          <span className="font-medium text-stone-800 dark:text-stone-200">
            {boq.approximateAreaSqFt || 'Not Specified'}
          </span>
        </div>
        <div>
          <span className="text-stone-500 dark:text-stone-400 block mb-0.5">Preferred Spec</span>
          <span className="font-medium text-stone-800 dark:text-stone-200 truncate block">
            {boq.preferredSpecification || 'Standard Green Tier'}
          </span>
        </div>
        <div>
          <span className="text-stone-500 dark:text-stone-400 block mb-0.5">Subtotal / Base</span>
          <span className="font-mono font-medium text-stone-800 dark:text-stone-200">
            {formatINR(currentRev?.subtotal || 0)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Calculated via BuildEcoGroup Financial Engine</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenPrintView && (
            <Button
              id={`btn-view-doc-${boq.id}`}
              variant="outline"
              size="sm"
              onClick={() => onOpenPrintView(boq)}
              className="gap-1.5 text-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              Print Charter
            </Button>
          )}

          {onOpenComparison && (
            <Button
              id={`btn-compare-${boq.id}`}
              variant="outline"
              size="sm"
              onClick={() => onOpenComparison(boq)}
              className="gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Supplier Quotes
            </Button>
          )}

          <Button
            id={`btn-inspect-boq-${boq.id}`}
            variant="primary"
            size="sm"
            onClick={() => onSelect(boq)}
            className="gap-1.5 text-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            Inspect Full BOQ
          </Button>
        </div>
      </div>
    </div>
  );
};
