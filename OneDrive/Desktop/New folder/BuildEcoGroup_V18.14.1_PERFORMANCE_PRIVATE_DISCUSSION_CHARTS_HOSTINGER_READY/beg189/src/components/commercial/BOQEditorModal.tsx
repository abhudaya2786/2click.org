import React, { useState } from 'react';
import { BOQRecord, BOQRevisionRecord, TaxCodeRecord, RateSource, BOQAdjustmentType, CalculationType } from '../../types/backend';
import { Button } from '../ui/Button';
import { formatINR, round2 } from '../../lib/money';
import { Layers, Plus, Trash2, CheckCircle2, AlertCircle, X, Calculator, ShieldCheck } from 'lucide-react';

interface BOQEditorModalProps {
  boq: BOQRecord;
  isOpen: boolean;
  onClose: () => void;
  taxCodes: TaxCodeRecord[];
  onSaveRevision: (data: { items: any[]; adjustments: any[]; notes?: string }) => Promise<void>;
}

interface EditableItem {
  id?: string;
  section: string;
  itemCode: string;
  description: string;
  specification?: string;
  brand?: string;
  grade?: string;
  quantity: number;
  unit: string;
  baseRate: number;
  taxRate: number;
  rateSource: RateSource;
  rateSourceReference?: string;
}

interface EditableAdjustment {
  id?: string;
  type: BOQAdjustmentType;
  label: string;
  calculationType: CalculationType;
  value: number;
}

export const BOQEditorModal: React.FC<BOQEditorModalProps> = ({
  boq,
  isOpen,
  onClose,
  taxCodes,
  onSaveRevision,
}) => {
  const currentRev = boq.currentRevision;

  const [revisionNotes, setRevisionNotes] = useState(currentRev?.notes || '');
  const [items, setItems] = useState<EditableItem[]>(() => {
    if (currentRev?.items && currentRev.items.length > 0) {
      return currentRev.items.map(it => ({
        id: it.id,
        section: it.section,
        itemCode: it.itemCode,
        description: it.description,
        specification: it.specification,
        brand: it.brand,
        grade: it.grade,
        quantity: it.quantity,
        unit: it.unit,
        baseRate: it.baseRate,
        taxRate: it.taxRate,
        rateSource: it.rateSource || 'CONSULTANT_ESTIMATE',
        rateSourceReference: it.rateSourceReference,
      }));
    }
    return [
      {
        section: 'Civil & Foundation',
        itemCode: 'CIV-001',
        description: 'Foundation Excavation & Raft Footings',
        specification: 'Depth up to 3m, mechanical backhoe',
        brand: 'Standard JCB',
        quantity: 100,
        unit: 'Cu M',
        baseRate: 350,
        taxRate: 18,
        rateSource: 'CONSULTANT_ESTIMATE',
      }
    ];
  });

  const [adjustments, setAdjustments] = useState<EditableAdjustment[]>(() => {
    if (currentRev?.adjustments && currentRev.adjustments.length > 0) {
      return currentRev.adjustments.map(a => ({
        id: a.id,
        type: a.type,
        label: a.label,
        calculationType: a.calculationType,
        value: a.value,
      }));
    }
    return [
      {
        type: 'CONTINGENCY',
        label: 'Unforeseen Site Contingency (3%)',
        calculationType: 'PERCENTAGE',
        value: 3,
      }
    ];
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const nextIdx = items.length + 1;
    setItems(prev => [
      ...prev,
      {
        section: 'General Civil',
        itemCode: `GEN-${String(nextIdx).padStart(3, '0')}`,
        description: 'New Scope Item',
        specification: '',
        quantity: 1,
        unit: 'Units',
        baseRate: 1000,
        taxRate: 18,
        rateSource: 'CONSULTANT_ESTIMATE',
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof EditableItem, value: any) => {
    setItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddAdjustment = () => {
    setAdjustments(prev => [
      ...prev,
      {
        type: 'SITE_SAFETY',
        label: 'Site Safety & Environmental Compliance',
        calculationType: 'FIXED_AMOUNT',
        value: 25000,
      }
    ]);
  };

  const handleRemoveAdjustment = (index: number) => {
    setAdjustments(prev => prev.filter((_, i) => i !== index));
  };

  // Authoritative live preview calculation
  let subtotal = 0;
  let taxTotal = 0;
  items.forEach(it => {
    const lineSubtotal = round2(Number(it.quantity || 0) * Number(it.baseRate || 0));
    const taxAmt = round2((lineSubtotal * Number(it.taxRate || 0)) / 100);
    subtotal = round2(subtotal + lineSubtotal);
    taxTotal = round2(taxTotal + taxAmt);
  });

  let adjustmentTotal = 0;
  adjustments.forEach(adj => {
    if (adj.calculationType === 'PERCENTAGE') {
      const adjAmt = round2((subtotal * Number(adj.value || 0)) / 100);
      adjustmentTotal = round2(adjustmentTotal + adjAmt);
    } else {
      adjustmentTotal = round2(adjustmentTotal + Number(adj.value || 0));
    }
  });

  const grandTotal = round2(subtotal + taxTotal + adjustmentTotal);

  const handleSave = async () => {
    if (items.length === 0) {
      setErrorMessage('At least one item is required in the BOQ.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await onSaveRevision({
        items: items.map(it => ({
          section: it.section,
          itemCode: it.itemCode,
          description: it.description,
          specification: it.specification,
          brand: it.brand,
          grade: it.grade,
          quantity: Number(it.quantity),
          unit: it.unit,
          baseRate: Number(it.baseRate),
          taxRate: Number(it.taxRate),
          rateSource: it.rateSource,
          rateSourceReference: it.rateSourceReference,
        })),
        adjustments: adjustments.map(adj => ({
          type: adj.type,
          label: adj.label,
          calculationType: adj.calculationType,
          value: Number(adj.value),
        })),
        notes: revisionNotes,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save BOQ revision');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[var(--color-surface)] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl my-6">
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-semibold text-stone-900 dark:text-white">
                Edit Bill of Quantities — {boq.boqReference}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Authoritative revision calculations applied automatically with Indian numbering format.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Revision note */}
          <div>
            <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
              Revision Notes & Technical Baseline Purpose
            </label>
            <input
              id="input-rev-notes"
              type="text"
              className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-2.5 text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g., Updated foundation soil excavation depth from 2.5m to 3.5m based on geotechnical report."
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
            />
          </div>

          {/* Line items editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                Line Items ({items.length})
              </h4>
              <Button
                id="btn-add-line-item"
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="gap-1 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item Line
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 rounded-lg space-y-2"
                >
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-0.5">Section</label>
                      <input
                        type="text"
                        className="w-full rounded border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-1.5 text-stone-900 dark:text-white"
                        value={item.section}
                        onChange={(e) => handleItemChange(idx, 'section', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-0.5">Item Code</label>
                      <input
                        type="text"
                        className="w-full font-mono rounded border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-1.5 text-stone-900 dark:text-white"
                        value={item.itemCode}
                        onChange={(e) => handleItemChange(idx, 'itemCode', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[10px] text-stone-500 mb-0.5">Description *</label>
                      <input
                        type="text"
                        required
                        className="w-full rounded border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-1.5 text-stone-900 dark:text-white font-medium"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      />
                    </div>
                    <div className="flex items-end justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                        title="Delete Line Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-0.5">Quantity</label>
                      <input
                        type="number"
                        min={0.01}
                        step="any"
                        className="w-full font-mono rounded border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-1.5 text-stone-900 dark:text-white"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-0.5">Unit (e.g., Cu M, MT)</label>
                      <input
                        type="text"
                        className="w-full font-mono rounded border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-1.5 text-stone-900 dark:text-white"
                        value={item.unit}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-0.5">Base Rate (INR)</label>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        className="w-full font-mono rounded border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-1.5 text-stone-900 dark:text-white"
                        value={item.baseRate}
                        onChange={(e) => handleItemChange(idx, 'baseRate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-0.5">GST Rate (%)</label>
                      <select
                        className="w-full font-mono rounded border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-1.5 text-stone-900 dark:text-white"
                        value={item.taxRate}
                        onChange={(e) => handleItemChange(idx, 'taxRate', parseFloat(e.target.value) || 0)}
                      >
                        <option value={0}>0% (Exempt)</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18% (Standard Services/Works)</option>
                        <option value={28}>28%</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-0.5">Brand / Grade</label>
                      <input
                        type="text"
                        className="w-full rounded border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-1.5 text-stone-900 dark:text-white"
                        placeholder="e.g., Tata Tiscon"
                        value={item.brand || ''}
                        onChange={(e) => handleItemChange(idx, 'brand', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-0.5">Rate Source</label>
                      <select
                        className="w-full rounded border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-1.5 text-stone-900 dark:text-white text-[11px]"
                        value={item.rateSource}
                        onChange={(e) => handleItemChange(idx, 'rateSource', e.target.value as any)}
                      >
                        <option value="CONSULTANT_ESTIMATE">Consultant Estimate</option>
                        <option value="CPWD_DSR">CPWD DSR Schedule</option>
                        <option value="VENDOR_QUOTE">Vendor Quote</option>
                        <option value="MARKET_SURVEY">Market Survey</option>
                        <option value="CATALOG">Standard Catalog</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adjustments Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-600" />
                Contingency & Site Safety Adjustments
              </h4>
              <Button
                id="btn-add-adjustment"
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAdjustment}
                className="gap-1 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Adjustment
              </Button>
            </div>

            <div className="space-y-2">
              {adjustments.map((adj, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 rounded-lg">
                  <input
                    type="text"
                    className="flex-1 rounded border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-1.5 text-stone-900 dark:text-white"
                    placeholder="Adjustment Label"
                    value={adj.label}
                    onChange={(e) => {
                      const copy = [...adjustments];
                      copy[idx].label = e.target.value;
                      setAdjustments(copy);
                    }}
                  />
                  <select
                    className="w-36 rounded border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-1.5 text-stone-900 dark:text-white"
                    value={adj.calculationType}
                    onChange={(e) => {
                      const copy = [...adjustments];
                      copy[idx].calculationType = e.target.value as any;
                      setAdjustments(copy);
                    }}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed INR Amount</option>
                  </select>
                  <input
                    type="number"
                    step="any"
                    className="w-28 font-mono rounded border border-stone-300 dark:border-stone-700 bg-[var(--color-surface)] dark:bg-stone-800 p-1.5 text-stone-900 dark:text-white"
                    value={adj.value}
                    onChange={(e) => {
                      const copy = [...adjustments];
                      copy[idx].value = parseFloat(e.target.value) || 0;
                      setAdjustments(copy);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAdjustment(idx)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Authoritative Live Recalculation Footer */}
          <div className="bg-stone-100 dark:bg-stone-800 p-4 rounded-xl border border-stone-200 dark:border-stone-700 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
            <div className="space-y-0.5 text-xs text-stone-600 dark:text-stone-400">
              <div>Subtotal: {formatINR(subtotal)}</div>
              <div>Statutory Taxes (GST): +{formatINR(taxTotal)}</div>
              <div>Site Adjustments: +{formatINR(adjustmentTotal)}</div>
            </div>
            <div className="text-right">
              <span className="text-stone-500 text-xs block">Authoritative Commercial Total:</span>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {formatINR(grandTotal)}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              id="btn-save-boq-revision"
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSaving ? 'Recalculating & Saving...' : 'Save BOQ Revision'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
