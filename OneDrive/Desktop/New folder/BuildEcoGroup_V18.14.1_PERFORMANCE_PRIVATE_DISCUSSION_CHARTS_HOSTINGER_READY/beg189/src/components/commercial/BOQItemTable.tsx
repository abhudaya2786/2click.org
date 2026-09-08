import React from 'react';
import { BOQItemRecord, BOQAdjustmentRecord } from '../../types/backend';
import { formatINR, formatPercentage } from '../../lib/money';
import { Badge } from '../ui/Badge';
import { Layers, Percent, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface BOQItemTableProps {
  items: BOQItemRecord[];
  adjustments?: BOQAdjustmentRecord[];
  subtotal: number;
  taxTotal: number;
  adjustmentTotal: number;
  grandTotal: number;
  readOnly?: boolean;
}

export const BOQItemTable: React.FC<BOQItemTableProps> = ({
  items,
  adjustments = [],
  subtotal,
  taxTotal,
  adjustmentTotal,
  grandTotal,
}) => {
  const { t } = useLanguage();
  // Group items by section
  const sectionMap = new Map<string, BOQItemRecord[]>();
  items.forEach((item) => {
    const list = sectionMap.get(item.section) || [];
    list.push(item);
    sectionMap.set(item.section, list);
  });

  return (
    <div id="boq-item-table-container" className="space-y-6">
      {Array.from(sectionMap.entries()).map(([sectionName, sectionItems]) => {
        const sectionSubtotal = sectionItems.reduce((sum, it) => sum + (it.quantity * it.baseRate), 0);
        const sectionTax = sectionItems.reduce((sum, it) => sum + it.taxAmount, 0);
        const sectionTotal = sectionItems.reduce((sum, it) => sum + it.lineTotal, 0);

        return (
          <div 
            key={sectionName} 
            className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-[var(--color-surface)] dark:bg-stone-900 shadow-sm"
          >
            <div className="bg-stone-50 dark:bg-stone-800/80 px-4 py-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-semibold text-stone-900 dark:text-white text-sm">
                  {sectionName}
                </h4>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  ({sectionItems.length} {sectionItems.length === 1 ? 'item' : 'items'})
                </span>
              </div>
              <div className="text-xs font-mono font-medium text-stone-700 dark:text-stone-300">
                Section Total: <span className="font-bold text-stone-900 dark:text-white">{formatINR(sectionTotal)}</span>
              </div>
            </div>

            <p className="px-3 py-1.5 text-[10px] text-stone-500 sm:hidden">
              {t('Swipe horizontally to see all columns →', 'सभी columns देखने के लिए swipe करें →')}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[640px]" aria-label={t(`BOQ items for ${sectionName}`, `${sectionName} के लिए BOQ items`)}>
                <caption className="sr-only">{sectionName} — {sectionItems.length} items</caption>
                <thead className="bg-stone-100/60 dark:bg-stone-800/40 text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800 font-medium">
                  <tr>
                    <th scope="col" className="py-2.5 px-3 w-12 sticky left-0 z-10 bg-stone-100/95 dark:bg-stone-800/95">#</th>
                    <th scope="col" className="py-2.5 px-3 w-24 sticky left-8 z-10 bg-stone-100/95 dark:bg-stone-800/95">Item Code</th>
                    <th scope="col" className="py-2.5 px-3">Description & Specification</th>
                    <th scope="col" className="py-2.5 px-3 w-32">Brand / Grade</th>
                    <th scope="col" className="py-2.5 px-3 w-20 text-right">Qty</th>
                    <th scope="col" className="py-2.5 px-3 w-16">Unit</th>
                    <th scope="col" className="py-2.5 px-3 w-24 text-right">Rate</th>
                    <th scope="col" className="py-2.5 px-3 w-20 text-right">Tax (%)</th>
                    <th scope="col" className="py-2.5 px-3 w-24 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                  {sectionItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                      <td className="py-3 px-3 text-stone-400 font-mono sticky left-0 z-[1] bg-[var(--color-surface)] dark:bg-stone-900">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-stone-700 dark:text-stone-300 sticky left-8 z-[1] bg-[var(--color-surface)] dark:bg-stone-900">
                        {item.itemCode}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-stone-900 dark:text-white">
                          {item.description}
                        </div>
                        {item.specification && (
                          <div className="text-stone-500 dark:text-stone-400 text-[11px] mt-0.5 leading-relaxed">
                            {item.specification}
                          </div>
                        )}
                        {item.rateSourceReference && (
                          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
                            Ref: {item.rateSourceReference} ({item.rateSource.replace('_', ' ')})
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-stone-600 dark:text-stone-300">
                        <div>{item.brand || '—'}</div>
                        {item.grade && <div className="text-[11px] text-stone-400">{item.grade}</div>}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium">
                        {item.quantity.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-stone-500 font-mono">
                        {item.unit}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {formatINR(item.baseRate)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-stone-500">
                        {formatPercentage(item.taxRate)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-stone-900 dark:text-white">
                        {formatINR(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Adjustments & Commercial Reconciliation */}
      <div className="bg-stone-50 dark:bg-stone-800/40 rounded-xl p-5 border border-stone-200 dark:border-stone-800">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h5 className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-3">
              Site Adjustments & Protocols
            </h5>
            {adjustments.length === 0 ? (
              <p className="text-xs text-stone-500 italic">No additional adjustments applied to this revision.</p>
            ) : (
              <div className="space-y-2">
                {adjustments.map((adj) => (
                  <div 
                    key={adj.id} 
                    className="flex items-center justify-between text-xs py-1.5 px-3 bg-[var(--color-surface)] dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800"
                  >
                    <div>
                      <span className="font-medium text-stone-800 dark:text-stone-200">{adj.label}</span>
                      <span className="text-stone-400 text-[10px] ml-1.5">({adj.type})</span>
                    </div>
                    <span className="font-mono font-medium text-stone-900 dark:text-white">
                      +{formatINR(adj.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-end space-y-2 text-xs border-t lg:border-t-0 lg:border-l border-stone-200 dark:border-stone-700/60 lg:pl-6 pt-4 lg:pt-0">
            <div className="flex justify-between py-1 text-stone-600 dark:text-stone-400">
              <span>Items Subtotal (Excl. Taxes):</span>
              <span className="font-mono font-medium text-stone-800 dark:text-stone-200">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between py-1 text-stone-600 dark:text-stone-400">
              <span>Statutory Taxes (GST Breakdown):</span>
              <span className="font-mono font-medium text-stone-800 dark:text-stone-200">+{formatINR(taxTotal)}</span>
            </div>
            <div className="flex justify-between py-1 text-stone-600 dark:text-stone-400">
              <span>Adjustments / Contingencies:</span>
              <span className="font-mono font-medium text-stone-800 dark:text-stone-200">+{formatINR(adjustmentTotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-stone-200 dark:border-stone-700 text-sm font-bold text-stone-900 dark:text-white pt-2">
              <span>Authoritative Commercial Baseline:</span>
              <span className="font-mono text-base text-emerald-700 dark:text-emerald-400">{formatINR(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
