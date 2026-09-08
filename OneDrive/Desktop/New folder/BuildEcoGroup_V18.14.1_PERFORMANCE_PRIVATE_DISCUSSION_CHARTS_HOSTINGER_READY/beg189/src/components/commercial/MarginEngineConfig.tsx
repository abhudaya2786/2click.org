import React, { useState, useEffect } from 'react';
import {
  Percent,
  Sliders,
  ShieldAlert,
  CheckCircle2,
  Edit3,
  Save,
  X,
  History,
  Layers,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { formatINR } from '../../lib/money';
import { ServiceCommercialRuleRecord, WorkModelType, MarginType } from '../../types/backend';

interface MarginEngineConfigProps {
  userRole?: string;
}

export const MarginEngineConfig: React.FC<MarginEngineConfigProps> = ({
  userRole = 'ADMIN',
}) => {
  const [rules, setRules] = useState<ServiceCommercialRuleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<ServiceCommercialRuleRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Form Fields
  const [formDefaultModel, setFormDefaultModel] = useState<WorkModelType>('FREELANCER');
  const [formMarginType, setFormMarginType] = useState<MarginType>('PERCENTAGE');
  const [formBaseMarginPercent, setFormBaseMarginPercent] = useState(20);
  const [formMinMarginProtectionFloor, setFormMinMarginProtectionFloor] = useState(10);
  const [formConsultantCommissionPercent, setFormConsultantCommissionPercent] = useState(10);
  const [formFreelancerCommissionPercent, setFormFreelancerCommissionPercent] = useState(60);
  const [formReferralCommissionPercent, setFormReferralCommissionPercent] = useState(5);
  const [formCoordinatorFeePercent, setFormCoordinatorFeePercent] = useState(5);
  const [formExpressMultiplier, setFormExpressMultiplier] = useState(1.25);
  const [formNotes, setFormNotes] = useState('');

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/commercial/rules');
      const data = await res.json();
      if (data.success) {
        setRules(data.rules);
      }
    } catch (err) {
      console.error('Failed to load rules', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleOpenEdit = (rule: ServiceCommercialRuleRecord) => {
    setEditingRule(rule);
    setFormDefaultModel(rule.defaultWorkModel);
    setFormMarginType(rule.marginType);
    setFormBaseMarginPercent(rule.defaultMarginPercent);
    setFormMinMarginProtectionFloor(rule.minMarginPercent);
    setFormConsultantCommissionPercent(rule.defaultSplit.consultantSharePercent);
    setFormFreelancerCommissionPercent(rule.defaultSplit.freelancerSharePercent);
    setFormReferralCommissionPercent(rule.defaultSplit.referralSharePercent);
    setFormCoordinatorFeePercent(rule.defaultSplit.coordinatorSharePercent);
    setFormExpressMultiplier(rule.expressMultiplier);
    setFormNotes(`Updated baseline parameters for ${rule.serviceName}`);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    setSubmitting(true);
    setNotification(null);
    try {
      const payload = {
        serviceSlug: editingRule.serviceSlug,
        defaultWorkModel: formDefaultModel,
        marginType: formMarginType,
        basePlatformMarginPercent: Number(formBaseMarginPercent),
        minMarginProtectionFloorPercent: Number(formMinMarginProtectionFloor),
        consultantCommissionPercent: Number(formConsultantCommissionPercent),
        freelancerCommissionPercent: Number(formFreelancerCommissionPercent),
        referralCommissionPercent: Number(formReferralCommissionPercent),
        coordinatorFeePercent: Number(formCoordinatorFeePercent),
        expressMultiplier: Number(formExpressMultiplier),
        notes: formNotes,
      };

      const res = await fetch(`/api/commercial/rules/${editingRule.serviceSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setNotification({
          type: 'success',
          text: `Commercial rule for ${editingRule.serviceName} updated to Version ${data.rule.version}. Changes logged to security audit ledger.`,
        });
        setEditingRule(null);
        fetchRules();
      } else {
        setNotification({ type: 'error', text: data.error || 'Failed to save rule update' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" id="margin-engine-config-root">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Percent className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Margin Engine & Commercial Rules Master</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Governs category-wise default work models, platform margin protection floors, multi-party commission splits, and versioned audit histories.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-semibold self-start sm:self-auto">
          <ShieldAlert className="w-4 h-4 text-emerald-600" />
          <span>Margin Protection Floor Active</span>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Rules Table */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Active Category Rules Matrix ({rules.length} Services)
          </span>
          <span className="text-xs text-slate-500 font-medium">All financial calculations execute strictly via money.ts</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading commercial rules...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Service Category</th>
                  <th className="p-3.5">Default Work Model</th>
                  <th className="p-3.5 text-right">Platform Margin</th>
                  <th className="p-3.5 text-right">Floor Limit</th>
                  <th className="p-3.5 text-right">Consultant QA</th>
                  <th className="p-3.5 text-right">Freelancer/Outsource</th>
                  <th className="p-3.5 text-right">Referral</th>
                  <th className="p-3.5 text-center">Version</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      <div>{r.serviceName}</div>
                      <div className="text-xs font-mono text-slate-400 font-normal">{r.serviceSlug}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700">
                        {r.defaultWorkModel}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-black text-emerald-700">
                      {r.defaultMarginPercent}%
                    </td>
                    <td className="p-3.5 text-right font-semibold text-amber-700">
                      {r.minMarginPercent}%
                    </td>
                    <td className="p-3.5 text-right font-medium text-slate-700">
                      {r.defaultSplit.consultantSharePercent}%
                    </td>
                    <td className="p-3.5 text-right font-medium text-slate-700">
                      {r.defaultSplit.freelancerSharePercent}%
                    </td>
                    <td className="p-3.5 text-right font-medium text-slate-700">
                      {r.defaultSplit.referralSharePercent}%
                    </td>
                    <td className="p-3.5 text-center font-mono text-slate-500">
                      v{r.version}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold flex items-center gap-1 mx-auto transition-colors"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Edit Commercial & Margin Rule</h3>
                <p className="text-xs text-slate-300 mt-0.5">Service: {editingRule.serviceName} ({editingRule.serviceSlug})</p>
              </div>
              <button onClick={() => setEditingRule(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Work Model</label>
                  <select
                    value={formDefaultModel}
                    onChange={(e) => setFormDefaultModel(e.target.value as WorkModelType)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg font-medium"
                  >
                    <option value="IN_HOUSE">In-house (Internal Team)</option>
                    <option value="CONSULTANT">Consultant (Verified Specialist)</option>
                    <option value="FREELANCER">Freelancer (Package Marketplace)</option>
                    <option value="OUTSOURCE_AGENCY">Outsource Agency (B2B Partner)</option>
                    <option value="VENDOR">Vendor (Material/Equipment)</option>
                    <option value="EPC_PARTNER">EPC Turnkey Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Margin Calculation Engine</label>
                  <select
                    value={formMarginType}
                    onChange={(e) => setFormMarginType(e.target.value as MarginType)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg font-medium"
                  >
                    <option value="PERCENTAGE">Percentage Markup</option>
                    <option value="FIXED">Fixed Margin Lump Sum</option>
                    <option value="SLAB_BASED">Value Slabs Based</option>
                    <option value="CATEGORY_WISE">Category Specific</option>
                  </select>
                </div>
              </div>

              {/* Margins */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <div>
                  <label className="block font-bold text-emerald-900 mb-1">Target Platform Gross Margin (%)</label>
                  <input
                    type="number"
                    value={formBaseMarginPercent}
                    onChange={(e) => setFormBaseMarginPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[var(--color-surface)] border rounded-lg font-black text-emerald-800 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-emerald-900 mb-1">Min Margin Protection Floor (%)</label>
                  <input
                    type="number"
                    value={formMinMarginProtectionFloor}
                    onChange={(e) => setFormMinMarginProtectionFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[var(--color-surface)] border rounded-lg font-bold text-amber-800 text-sm"
                    required
                  />
                  <span className="text-[10px] text-emerald-700">System alerts if quote margin drops below this floor</span>
                </div>
              </div>

              {/* Revenue Splits */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Default Multi-Party Revenue Sharing Percentages
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Senior Consultant QA (%)</label>
                    <input
                      type="number"
                      value={formConsultantCommissionPercent}
                      onChange={(e) => setFormConsultantCommissionPercent(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Freelancer / Outsource (%)</label>
                    <input
                      type="number"
                      value={formFreelancerCommissionPercent}
                      onChange={(e) => setFormFreelancerCommissionPercent(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Referral Partner (%)</label>
                    <input
                      type="number"
                      value={formReferralCommissionPercent}
                      onChange={(e) => setFormReferralCommissionPercent(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border rounded-lg font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Express Delivery Multiplier</label>
                <input
                  type="number"
                  step="0.05"
                  value={formExpressMultiplier}
                  onChange={(e) => setFormExpressMultiplier(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Revision (Audit Trail)</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg"
                  placeholder="Explain why commercial terms are being updated..."
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  {submitting ? 'Saving Version...' : 'Save & Publish New Version'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
