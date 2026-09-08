import React, { useState } from 'react';
import { QuotationComparisonMatrix, QuotationRecord, BOQRecord } from '../../types/backend';
import { formatINR } from '../../lib/money';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Building2, 
  TrendingDown, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface QuotationComparisonViewProps {
  comparison: QuotationComparisonMatrix;
  boq: BOQRecord;
  onAcceptQuotation?: (quotationId: string, notes?: string) => Promise<void>;
  onOpenSubmitModal?: () => void;
  canAccept?: boolean;
}

export const QuotationComparisonView: React.FC<QuotationComparisonViewProps> = ({
  comparison,
  boq,
  onAcceptQuotation,
  onOpenSubmitModal,
  canAccept = true,
}) => {
  const { t } = useLanguage();
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [acceptNotes, setAcceptNotes] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptTargetQuote, setAcceptTargetQuote] = useState<QuotationRecord | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const baselineRev = boq.currentRevision;

  const handleOpenAccept = (quote: QuotationRecord) => {
    setAcceptTargetQuote(quote);
    setShowAcceptModal(true);
  };

  const handleConfirmAccept = async () => {
    if (!acceptTargetQuote || !onAcceptQuotation) return;
    setIsAccepting(true);
    setActionError(null);
    try {
      await onAcceptQuotation(acceptTargetQuote.id, acceptNotes);
      setShowAcceptModal(false);
      setAcceptNotes('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to accept quotation');
    } finally {
      setIsAccepting(false);
    }
  };

  if (comparison.quotations.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-8 text-center">
        <Building2 className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-stone-900 dark:text-white">
          No Supplier Quotations Received Yet
        </h4>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
          Independent suppliers and authorized trade distributors submit itemized pricing against the approved Bill of Quantities.
        </p>
        {onOpenSubmitModal && (
          <Button
            id="btn-submit-first-quote"
            variant="primary"
            size="sm"
            onClick={onOpenSubmitModal}
            className="mt-4 gap-1.5 text-xs"
          >
            <Building2 className="w-4 h-4" />
            Submit Supplier Quotation
          </Button>
        )}
      </div>
    );
  }

  return (
    <div id="quotation-comparison-view" className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] dark:bg-stone-900 p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-stone-900 dark:text-white">
              Normalized Commercial Quotation Matrix
            </h3>
            <Badge variant="neutral" className="text-xs font-mono">
              {comparison.quotations.length} Active {comparison.quotations.length === 1 ? 'Quote' : 'Quotes'}
            </Badge>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Normalized against BOQ Baseline: <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">{formatINR(comparison.boqBaselineTotal)}</span>
          </p>
        </div>

        {onOpenSubmitModal && (
          <Button
            id="btn-add-supplier-quote"
            variant="outline"
            size="sm"
            onClick={onOpenSubmitModal}
            className="gap-1.5 text-xs self-start sm:self-auto"
          >
            <Building2 className="w-3.5 h-3.5" />
            Submit New Quotation
          </Button>
        )}
      </div>

      {/* Provider Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comparison.quotations.map((quote) => {
          const isLowest = quote.id === comparison.summary?.lowestOverallQuotationId;
          const isFastest = quote.id === comparison.summary?.fastestLeadTimeQuotationId;
          const isAccepted = quote.status === 'ACCEPTED';
          const variance = quote.grandTotal - (comparison.boqBaselineTotal || 0);
          const variancePercent = (comparison.boqBaselineTotal || 0) > 0 ? (variance / comparison.boqBaselineTotal!) * 100 : 0;

          return (
            <div 
              key={quote.id}
              id={`quote-card-${quote.id}`}
              className={`rounded-xl p-5 border transition-all flex flex-col justify-between ${
                isAccepted
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                  : isLowest
                  ? 'bg-[var(--color-surface)] dark:bg-stone-900 border-emerald-300 dark:border-emerald-700/80 shadow-sm'
                  : 'bg-[var(--color-surface)] dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                    {quote.quotationReference}
                  </span>
                  <div className="flex items-center gap-1">
                    {isLowest && (
                      <Badge variant="success" className="text-[10px] gap-1 font-mono">
                        <TrendingDown className="w-3 h-3" /> Lowest Price
                      </Badge>
                    )}
                    {isFastest && !isLowest && (
                      <Badge variant="neutral" className="text-[10px] gap-1 font-mono">
                        <Truck className="w-3 h-3" /> Fastest
                      </Badge>
                    )}
                    {isAccepted && (
                      <Badge variant="success" className="text-[10px] gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Accepted
                      </Badge>
                    )}
                  </div>
                </div>

                <h4 className="font-semibold text-stone-900 dark:text-white text-sm">
                  {quote.providerFirm}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {quote.providerName} ({quote.providerCity || 'India'})
                </p>

                {/* Price block */}
                <div className="mt-4 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200/60 dark:border-stone-700/60">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-stone-500">Total Bid:</span>
                    <span className="text-xl font-bold font-mono text-stone-900 dark:text-white">
                      {formatINR(quote.grandTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] mt-1 pt-1 border-t border-stone-200/60 dark:border-stone-700/60">
                    <span className="text-stone-500">Baseline Variance:</span>
                    <span className={`font-mono font-medium ${variance <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
                      {variance <= 0 ? '' : '+'}{formatINR(variance)} ({variancePercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Logistics */}
                <div className="mt-3 space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
                  <div className="flex justify-between">
                    <span>Lead Time:</span>
                    <span className="font-medium text-stone-800 dark:text-stone-200 flex items-center gap-1">
                      <Truck className="w-3 h-3 text-stone-400" />
                      {quote.leadTimeDays ? `${quote.leadTimeDays} Days` : 'Standard'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Warranty:</span>
                    <span className="font-medium text-stone-800 dark:text-stone-200">
                      {quote.warrantyMonths ? `${quote.warrantyMonths} Months` : 'Manufacturer Standard'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Freight / Tax:</span>
                    <span className="font-mono text-stone-800 dark:text-stone-200">
                      +{formatINR(quote.freight || 0)} / {formatINR(quote.taxTotal)}
                    </span>
                  </div>
                </div>

                {quote.notes && (
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 bg-stone-50 dark:bg-stone-800/40 p-2 rounded border border-stone-200/40 italic">
                    "{quote.notes}"
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                {isAccepted ? (
                  <div className="text-center py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Commercial Scope Awarded
                  </div>
                ) : (
                  <Button
                    id={`btn-accept-quote-${quote.id}`}
                    variant={isLowest ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleOpenAccept(quote)}
                    disabled={!canAccept}
                    className="w-full text-xs gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Accept Provider Quote
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Item-by-Item Comparison Table */}
      <div className="bg-[var(--color-surface)] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <h4 className="font-semibold text-stone-900 dark:text-white text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            Line-by-Line Technical & Rate Comparison
          </h4>
          <span className="text-xs text-stone-500 font-mono">
            {comparison.itemsComparison.length} {t('BOQ Items Tracked', 'BOQ items ट्रैक')}
          </span>
        </div>

        <p className="px-3 py-1.5 text-[10px] text-stone-500 sm:hidden border-b border-stone-100 dark:border-stone-800">
          {t('Swipe horizontally to compare all quotes →', 'सभी quotes compare करने के लिए swipe करें →')}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[720px]" aria-label={t('Quotation line-by-line comparison', 'कोटेशन line-by-line तुलना')}>
            <caption className="sr-only">
              {t('BOQ item rates by provider', 'प्रदाता के अनुसार BOQ item rates')}
            </caption>
            <thead className="bg-stone-100/60 dark:bg-stone-800/40 text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800 font-medium">
              <tr>
                <th scope="col" className="py-3 px-3 w-20 sticky left-0 z-10 bg-stone-100/95 dark:bg-stone-800/95">Code</th>
                <th scope="col" className="py-3 px-3 min-w-[200px] sticky left-20 z-10 bg-stone-100/95 dark:bg-stone-800/95">{t('BOQ Spec & Baseline', 'BOQ spec और baseline')}</th>
                {comparison.quotations.map((q) => (
                  <th key={q.id} scope="col" className="py-3 px-3 min-w-[180px] border-l border-stone-200 dark:border-stone-800">
                    <div className="font-semibold text-stone-900 dark:text-white truncate max-w-[180px]">
                      {q.providerFirm}
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono font-normal">
                      {q.quotationReference}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
              {comparison.itemsComparison.map((row) => (
                <tr key={row.boqItemId} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                  <td className="py-3 px-3 font-mono font-semibold text-stone-700 dark:text-stone-300 sticky left-0 z-[1] bg-[var(--color-surface)] dark:bg-stone-900">
                    {row.itemCode}
                  </td>
                  <td className="py-3 px-3 sticky left-20 z-[1] bg-[var(--color-surface)] dark:bg-stone-900">
                    <div className="font-medium text-stone-900 dark:text-white">
                      {row.description}
                    </div>
                    <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                      Qty: {row.quantity} {row.unit} • Baseline: {formatINR(row.baselineRate)}/{row.unit}
                    </div>
                  </td>

                  {comparison.quotations.map((q) => {
                    const quoteItem = row.quotes[q.id];
                    const isLowestLine = row.lowestRateQuotationId === q.id;

                    if (!quoteItem) {
                      return (
                        <td key={q.id} className="py-3 px-3 text-stone-400 italic border-l border-stone-200 dark:border-stone-800">
                          {t('Not quoted', 'कोट नहीं')}
                        </td>
                      );
                    }

                    return (
                      <td 
                        key={q.id} 
                        className={`py-3 px-3 border-l border-stone-200 dark:border-stone-800 ${
                          isLowestLine ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-stone-900 dark:text-white">
                            {formatINR(quoteItem.unitRate)}
                          </span>
                          {isLowestLine && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold">
                              L1 Rate
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5 truncate max-w-[170px]">
                          {quoteItem.offeredBrand || 'Standard'}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                          Line: {formatINR(quoteItem.lineTotal)} ({quoteItem.specCompliance})
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acceptance Modal */}
      {showAcceptModal && acceptTargetQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-surface)] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-semibold text-stone-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Award Commercial Scope to Supplier
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
              You are accepting quotation <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">{acceptTargetQuote.quotationReference}</span> from <span className="font-semibold">{acceptTargetQuote.providerFirm}</span> for {formatINR(acceptTargetQuote.grandTotal)}.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Acceptance Terms & Dispatch Notes (Optional)
              </label>
              <textarea
                id="input-accept-notes"
                rows={3}
                className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2.5 text-stone-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                placeholder="e.g., Deliveries to be staggered across phases 1 and 2 with advance notice."
                value={acceptNotes}
                onChange={(e) => setAcceptNotes(e.target.value)}
              />
            </div>

            {actionError && (
              <div className="mt-3 p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded text-xs text-red-700">
                {actionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAcceptModal(false)}
                disabled={isAccepting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                id="btn-confirm-accept-quote"
                variant="primary"
                size="sm"
                onClick={handleConfirmAccept}
                disabled={isAccepting}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isAccepting ? 'Processing Award...' : 'Confirm Scope Award'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
