import React, { useState } from 'react';
import { BOQRecord } from '../../types/backend';
import { Button } from '../ui/Button';
import { formatINR, round2 } from '../../lib/money';
import { Building2, Plus, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface SubmitQuotationModalProps {
  boq: BOQRecord;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const SubmitQuotationModal: React.FC<SubmitQuotationModalProps> = ({
  boq,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const currentRev = boq.currentRevision;
  const boqItems = currentRev?.items || [];

  const [providerFirm, setProviderFirm] = useState('');
  const [providerCity, setProviderCity] = useState('');
  const [leadTimeDays, setLeadTimeDays] = useState('7');
  const [warrantyMonths, setWarrantyMonths] = useState('24');
  const [paymentTerms, setPaymentTerms] = useState('30% Advance, 70% against delivery');
  const [freight, setFreight] = useState('25000');
  const [discount, setDiscount] = useState('0');
  const [notes, setNotes] = useState('');

  // Map item rates
  const [itemRates, setItemRates] = useState<Record<string, { unitRate: string; offeredBrand: string; specCompliance: string }>>(() => {
    const initial: Record<string, any> = {};
    boqItems.forEach((it) => {
      initial[it.id] = {
        unitRate: String(it.baseRate),
        offeredBrand: it.brand || '',
        specCompliance: 'EXACT',
      };
    });
    return initial;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRateChange = (boqItemId: string, field: string, val: string) => {
    setItemRates(prev => ({
      ...prev,
      [boqItemId]: {
        ...prev[boqItemId],
        [field]: val,
      }
    }));
  };

  // Compute estimate live preview
  let subtotal = 0;
  let taxTotal = 0;
  const itemsPayload = boqItems.map((it) => {
    const custom = itemRates[it.id] || { unitRate: String(it.baseRate), offeredBrand: '', specCompliance: 'EXACT' };
    const rate = Number(custom.unitRate) || 0;
    const lineSubtotal = round2(rate * it.quantity);
    const taxAmt = round2((lineSubtotal * it.taxRate) / 100);
    const lineTotal = round2(lineSubtotal + taxAmt);

    subtotal = round2(subtotal + lineSubtotal);
    taxTotal = round2(taxTotal + taxAmt);

    return {
      boqItemId: it.id,
      itemCode: it.itemCode,
      description: it.description,
      offeredBrand: custom.offeredBrand?.trim() || it.brand || 'Standard',
      offeredSpecification: it.specification || it.description || 'As per BOQ',
      quantity: it.quantity,
      unit: it.unit,
      unitRate: rate,
      taxRate: it.taxRate,
      availability: 'Ready in stock',
      leadTime: `${leadTimeDays} Days`,
      specCompliance: custom.specCompliance as any,
    };
  });

  const freightAmt = Number(freight) || 0;
  const discountAmt = Number(discount) || 0;
  const grandTotal = round2(subtotal + taxTotal + freightAmt - discountAmt);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerFirm.trim()) {
      setFormError('Supplier / Trade Distributor Firm Name is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await onSubmit({
        providerFirm: providerFirm.trim(),
        providerCity: providerCity.trim() || 'India',
        leadTimeDays: Number(leadTimeDays) || 7,
        warrantyMonths: Number(warrantyMonths) || 12,
        paymentTerms,
        freight: freightAmt,
        discount: discountAmt,
        notes,
        items: itemsPayload,
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[var(--color-surface)] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl my-8">
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-semibold text-stone-900 dark:text-white">
              Submit Supplier Quotation for {boq.boqReference}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Supplier details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Vendor / Distributor Firm Name *
              </label>
              <input
                id="input-provider-firm"
                type="text"
                required
                className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2 text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="e.g., UltraTech Building Supplies Ltd"
                value={providerFirm}
                onChange={(e) => setProviderFirm(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Depot / City *
              </label>
              <input
                id="input-provider-city"
                type="text"
                required
                className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2 text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="e.g., Bengaluru, Mumbai"
                value={providerCity}
                onChange={(e) => setProviderCity(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Dispatch Lead Time (Days)
              </label>
              <input
                id="input-provider-leadtime"
                type="number"
                min={1}
                className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2 text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value)}
              />
            </div>
          </div>

          {/* Line item rates */}
          <div>
            <h4 className="font-semibold text-stone-900 dark:text-white mb-2">
              Itemized Quotation Rates
            </h4>
            <div className="border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Item & Qty</th>
                    <th className="py-2.5 px-3 w-40">Offered Brand / Make</th>
                    <th className="py-2.5 px-3 w-32">Compliance</th>
                    <th className="py-2.5 px-3 w-32 text-right">Unit Rate (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {boqItems.map((it) => {
                    const current = itemRates[it.id] || { unitRate: String(it.baseRate), offeredBrand: '', specCompliance: 'EXACT' };
                    return (
                      <tr key={it.id}>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-stone-900 dark:text-white">{it.itemCode} - {it.description}</div>
                          <div className="text-[11px] text-stone-500 font-mono">
                            {it.quantity} {it.unit} (Baseline: {formatINR(it.baseRate)})
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            className="w-full rounded border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-1 text-stone-900 dark:text-white"
                            placeholder={it.brand || 'Brand name'}
                            value={current.offeredBrand}
                            onChange={(e) => handleRateChange(it.id, 'offeredBrand', e.target.value)}
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            className="w-full rounded border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-1 text-stone-900 dark:text-white"
                            value={current.specCompliance}
                            onChange={(e) => handleRateChange(it.id, 'specCompliance', e.target.value)}
                          >
                            <option value="EXACT">EXACT</option>
                            <option value="EQUIVALENT">EQUIVALENT</option>
                            <option value="SUPERIOR">SUPERIOR</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            step="any"
                            className="w-28 text-right font-mono rounded border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-1 text-stone-900 dark:text-white"
                            value={current.unitRate}
                            onChange={(e) => handleRateChange(it.id, 'unitRate', e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Commercial & Freight terms */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Freight & Handling Charges (INR)
              </label>
              <input
                id="input-quote-freight"
                type="number"
                className="w-full text-xs font-mono rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2 text-stone-900 dark:text-white outline-none"
                value={freight}
                onChange={(e) => setFreight(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Commercial Volume Discount (INR)
              </label>
              <input
                id="input-quote-discount"
                type="number"
                className="w-full text-xs font-mono rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2 text-stone-900 dark:text-white outline-none"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Warranty Coverage (Months)
              </label>
              <input
                id="input-quote-warranty"
                type="number"
                className="w-full text-xs font-mono rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2 text-stone-900 dark:text-white outline-none"
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
              Payment & Dispatch Terms
            </label>
            <input
              id="input-quote-terms"
              type="text"
              className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2 text-stone-900 dark:text-white outline-none"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
              Supplier Notes & Quality Certifications
            </label>
            <textarea
              id="input-quote-notes"
              rows={2}
              className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2 text-stone-900 dark:text-white outline-none"
              placeholder="e.g., Factory mill test certificates included. Direct delivery to site with transit insurance."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Authoritative calculated total */}
          <div className="bg-stone-50 dark:bg-stone-800/60 p-4 rounded-lg flex items-center justify-between border border-stone-200 dark:border-stone-700 font-mono">
            <div>
              <span className="text-stone-500 block text-[11px]">Calculated Quotation Total (Incl. GST & Freight):</span>
              <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                {formatINR(grandTotal)}
              </span>
            </div>
            <div className="text-right text-[11px] text-stone-500">
              Subtotal: {formatINR(subtotal)} • Taxes: {formatINR(taxTotal)}
            </div>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              id="btn-submit-quotation-form"
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Submitting Quotation...' : 'Submit Quotation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
