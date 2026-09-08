import React from 'react';
import { BOQRecord } from '../../types/backend';
import { formatINR, formatPercentage } from '../../lib/money';
import { Button } from '../ui/Button';
import { Printer, X, Download, ShieldCheck, Building2, CheckCircle2 } from 'lucide-react';

interface BOQDocumentViewProps {
  boq: BOQRecord;
  onClose: () => void;
}

export const BOQDocumentView: React.FC<BOQDocumentViewProps> = ({
  boq,
  onClose,
}) => {
  const currentRev = boq.currentRevision;
  const items = currentRev?.items || [];
  const adjustments = currentRev?.adjustments || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-[var(--color-surface)]">
      <div className="bg-[var(--color-surface)] text-stone-900 border border-stone-200 rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl my-6 print:border-none print:shadow-none print:max-h-full print:w-full">
        {/* Modal Controls (Hidden in Print) */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-sm">Commercial Estimate Charter — Print Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs text-stone-700 hover:bg-stone-100"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </Button>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 text-xs font-sans print:p-0">
          {/* Header */}
          <div className="border-b-2 border-emerald-700 pb-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                  BEG
                </div>
                <span className="text-xl font-bold tracking-tight text-emerald-950">
                  BuildEcoGroup
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Project Services & Technology Orchestration Platform
              </p>
              <p className="text-[10px] text-stone-400">
                Statutory GSTIN: 29AABCB1234F1Z8 • Bengaluru & Mumbai
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 font-mono font-bold text-xs">
                BILL OF QUANTITIES (BOQ)
              </span>
              <div className="font-mono text-xs text-stone-700 mt-1">
                Ref: {boq.boqReference}
              </div>
              <div className="text-[10px] text-stone-500 font-mono">
                Rev {currentRev?.revisionNumber || 1} • {new Date(boq.createdAt).toLocaleDateString('en-IN')}
              </div>
            </div>
          </div>

          {/* Project & Case Metadata */}
          <div className="grid grid-cols-2 gap-4 p-3.5 bg-stone-50 rounded-lg border border-stone-200">
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400">Project Reference</div>
              <div className="font-bold text-stone-900 text-sm mt-0.5">{boq.title}</div>
              <div className="text-[11px] text-stone-600 font-mono mt-0.5">Case ID: {boq.caseReference}</div>
              <div className="text-[11px] text-stone-600 mt-0.5">Area/Scope: {boq.approximateAreaSqFt || 'Full Project Site'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400">Preparation & Technical Vetting</div>
              <div className="font-semibold text-stone-800 mt-0.5">{boq.createdByName || 'Empanelled Lead Specialist'}</div>
              <div className="text-[11px] text-stone-600 mt-0.5">Status: <span className="font-semibold text-emerald-800">{boq.status}</span></div>
              <div className="text-[11px] text-stone-600 mt-0.5">Preferred Spec: {boq.preferredSpecification || 'Standard Green Tier'}</div>
            </div>
          </div>

          {/* Scope Description */}
          {boq.scopeDescription && (
            <div>
              <h5 className="font-bold text-stone-900 text-[11px] uppercase tracking-wider mb-1">
                Executive Scope Charter
              </h5>
              <p className="text-stone-700 text-xs leading-relaxed bg-[var(--color-surface)] p-2.5 rounded border border-stone-200">
                {boq.scopeDescription}
              </p>
            </div>
          )}

          {/* Itemized Table */}
          <div>
            <h5 className="font-bold text-stone-900 text-[11px] uppercase tracking-wider mb-2">
              Itemized Schedule of Quantities & Rates (INR)
            </h5>
            <table className="w-full border border-stone-200 text-left">
              <thead className="bg-stone-100 text-stone-700 border-b border-stone-200">
                <tr>
                  <th className="p-2 w-8">#</th>
                  <th className="p-2 w-20">Code</th>
                  <th className="p-2">Item Description & Specification</th>
                  <th className="p-2 w-24">Brand / Grade</th>
                  <th className="p-2 w-16 text-right">Qty</th>
                  <th className="p-2 w-14">Unit</th>
                  <th className="p-2 w-20 text-right">Rate</th>
                  <th className="p-2 w-14 text-right">GST</th>
                  <th className="p-2 w-24 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {items.map((it, idx) => (
                  <tr key={it.id}>
                    <td className="p-2 text-stone-400 font-mono">{idx + 1}</td>
                    <td className="p-2 font-mono font-semibold text-stone-800">{it.itemCode}</td>
                    <td className="p-2">
                      <div className="font-medium text-stone-900">{it.description}</div>
                      {it.specification && (
                        <div className="text-[10px] text-stone-500 mt-0.5">{it.specification}</div>
                      )}
                    </td>
                    <td className="p-2 text-stone-600 text-[11px]">{it.brand || '—'}</td>
                    <td className="p-2 text-right font-mono">{it.quantity.toLocaleString('en-IN')}</td>
                    <td className="p-2 text-stone-500 font-mono text-[11px]">{it.unit}</td>
                    <td className="p-2 text-right font-mono">{formatINR(it.baseRate)}</td>
                    <td className="p-2 text-right font-mono text-stone-500">{it.taxRate}%</td>
                    <td className="p-2 text-right font-mono font-semibold">{formatINR(it.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Adjustments & Totals */}
          <div className="flex justify-end pt-2">
            <div className="w-80 space-y-1.5 p-3.5 bg-stone-50 rounded border border-stone-200 font-mono">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal:</span>
                <span>{formatINR(currentRev?.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Statutory Taxes (GST):</span>
                <span>+{formatINR(currentRev?.taxTotal || 0)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Site Adjustments:</span>
                <span>+{formatINR(currentRev?.adjustmentTotal || 0)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-stone-300 pt-1.5 mt-1.5">
                <span>Commercial Baseline:</span>
                <span className="text-emerald-800 font-bold">{formatINR(currentRev?.grandTotal || 0)}</span>
              </div>
            </div>
          </div>

          {/* Statutory Platform Disclaimer */}
          <div className="border-t border-stone-200 pt-4 text-[10px] text-stone-500 leading-relaxed space-y-1">
            <p className="font-semibold text-stone-700">
              BUILD ECO GROUP ORCHESTRATION PLATFORM DISCLAIMER:
            </p>
            <p>
              BuildEcoGroup is a technology orchestration and project services platform. BuildEcoGroup provides standardized qualification, digital estimation schedules, and vendor comparison engines. All structural specifications, rate schedules, and quantities are prepared by independent certified consultants and registered trade suppliers. Statutory warranties and product certifications remain directly with the executing providers and material manufacturers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
