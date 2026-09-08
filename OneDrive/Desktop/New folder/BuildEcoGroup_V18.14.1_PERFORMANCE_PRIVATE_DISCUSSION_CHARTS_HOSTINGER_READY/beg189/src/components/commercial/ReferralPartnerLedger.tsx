import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Share2,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Copy,
  Check,
  Building,
  User,
  ShieldCheck,
  Receipt,
  X,
} from 'lucide-react';
import { formatINR } from '../../lib/money';
import { ReferralRecord, PartnerWalletLedgerRecord } from '../../types/backend';

interface ReferralPartnerLedgerProps {
  partnerId?: string;
  partnerName?: string;
  userRole?: string;
}

export const ReferralPartnerLedger: React.FC<ReferralPartnerLedgerProps> = ({
  partnerId = 'fl-01',
  partnerName = 'Arvind Mehta, PE',
  userRole = 'FREELANCER',
}) => {
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'REFERRALS'>('LEDGER');
  const [ledger, setLedger] = useState<PartnerWalletLedgerRecord | null>(null);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // New Referral Submission Modal
  const [isSubmitReferralOpen, setIsSubmitReferralOpen] = useState(false);
  const [refClientName, setRefClientName] = useState('');
  const [refClientCity, setRefClientCity] = useState('Pune');
  const [refClientPhone, setRefClientPhone] = useState('');
  const [refServiceCategory, setRefServiceCategory] = useState('solar-rooftop');
  const [refProjectValue, setRefProjectValue] = useState(500000);
  const [refNotes, setRefNotes] = useState('');
  const [submittingRef, setSubmittingRef] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchLedgerAndReferrals = async () => {
    setLoading(true);
    try {
      // 1. Fetch Ledger
      const ledgerRes = await fetch(`/api/partner/ledger/${partnerId}`);
      const ledgerData = await ledgerRes.json();
      if (ledgerData.success) {
        setLedger(ledgerData.ledger);
      }

      // 2. Fetch Referrals
      const refRes = await fetch(`/api/referrals?referrerId=${partnerId}`);
      const refData = await refRes.json();
      if (refData.success) {
        setReferrals(refData.referrals);
      }
    } catch (err) {
      console.error('Failed to load partner financial data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerAndReferrals();
  }, [partnerId]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSubmitReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRef(true);
    setNotification(null);

    try {
      const payload = {
        referredClientName: refClientName,
        referredClientPhone: refClientPhone,
        referredClientCity: refClientCity,
        serviceCategory: refServiceCategory,
        estimatedProjectValueINR: Number(refProjectValue),
        notes: refNotes,
      };

      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setNotification({
          type: 'success',
          text: `Referral registered with Tracking Code ${data.referral.referralCode}. Success commission set at ${data.referral.commissionRatePercent}%.`,
        });
        setIsSubmitReferralOpen(false);
        fetchLedgerAndReferrals();
        setRefClientName('');
        setRefClientPhone('');
      } else {
        setNotification({ type: 'error', text: data.error || 'Failed to submit referral' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSubmittingRef(false);
    }
  };

  return (
    <div className="space-y-6" id="referral-partner-ledger-root">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Wallet className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Partner Wallet, Ledgers & Referral Center</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time auditable revenue settlements, 10% TDS tax deductions, milestone disbursements, and client referral tracking.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'LEDGER' ? 'bg-[var(--color-surface)] text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Settlement Ledger
          </button>
          <button
            onClick={() => setActiveTab('REFERRALS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'REFERRALS' ? 'bg-[var(--color-surface)] text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Referrals ({referrals.length})
          </button>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl text-sm flex items-center justify-between ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      {activeTab === 'LEDGER' ? (
        <div className="space-y-6">
          {/* 4 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Approved Payable</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                ₹{formatINR(ledger?.payableAmount || 0)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Scheduled for next weekly payout run</div>
            </div>

            <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Review</div>
              <div className="text-2xl font-black text-amber-700 mt-1">
                ₹{formatINR(ledger?.pendingApproval || 0)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Awaiting milestone deliverable sign-off</div>
            </div>

            <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Settled Paid</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                ₹{formatINR(ledger?.paidAmount || 0)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Direct NEFT/RTGS bank transfers</div>
            </div>

            <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total TDS Deducted</div>
              <div className="text-2xl font-black text-blue-700 mt-1">
                ₹{formatINR(ledger?.totalTdsDeducted || 0)}
              </div>
              <div className="text-xs text-blue-600 mt-1">10% Sec 194H/J (Form 16A provided)</div>
            </div>
          </div>

          {/* Detailed Transaction Statement */}
          <div className="bg-[var(--color-surface)] rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Partner Settlement & Disbursement Journal
                </span>
                <span className="text-xs text-slate-500 ml-2">
                  Account: <strong>{ledger?.partnerName}</strong> ({ledger?.partnerRole})
                </span>
              </div>
              <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-semibold">
                KYC & Bank Verified
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Reference No</th>
                    <th className="p-3.5">Description & Audit Notes</th>
                    <th className="p-3.5 text-right">Gross (₹)</th>
                    <th className="p-3.5 text-right">TDS 10% (₹)</th>
                    <th className="p-3.5 text-right">Net Payable (₹)</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledger?.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          tx.type === 'EARNING' ? 'bg-purple-100 text-purple-800' :
                          tx.type === 'REFERRAL' ? 'bg-amber-100 text-amber-800' :
                          tx.type === 'COMMISSION' ? 'bg-blue-100 text-blue-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {tx.referenceNo}
                      </td>
                      <td className="p-3.5 max-w-sm">
                        <div className="font-semibold text-slate-800">{tx.description}</div>
                        {tx.notes && <div className="text-xs text-slate-400 mt-0.5">{tx.notes}</div>}
                      </td>
                      <td className="p-3.5 text-right font-semibold text-slate-700">
                        {tx.type === 'PAYOUT' ? '-' : `+₹${formatINR(tx.grossAmount)}`}
                      </td>
                      <td className="p-3.5 text-right text-blue-600 font-medium">
                        {tx.tdsDeducted > 0 ? `-₹${formatINR(tx.tdsDeducted)}` : '₹0'}
                      </td>
                      <td className="p-3.5 text-right font-black text-emerald-800">
                        {tx.type === 'PAYOUT' ? `₹${formatINR(tx.netAmount)}` : `+₹${formatINR(tx.netAmount)}`}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                          tx.status === 'SETTLED' ? 'bg-emerald-100 text-emerald-800' :
                          tx.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                          tx.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Referrals Tab */
        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Referral Commission & Channel Growth</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Earn 4% to 8% success bonus on every enterprise or property project referred to BuildEcoGroup.
              </p>
            </div>

            <button
              onClick={() => setIsSubmitReferralOpen(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Register New Client Lead
            </button>
          </div>

          {/* Referrals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {referrals.map((ref) => (
              <div key={ref.id} className="bg-[var(--color-surface)] p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => handleCopyCode(ref.referralCode)}
                      className="px-2.5 py-1 text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 rounded flex items-center gap-1 hover:bg-amber-100 transition-colors"
                      title="Click to copy tracking code"
                    >
                      {copiedCode === ref.referralCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {ref.referralCode}
                    </button>

                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      ref.status === 'COMMISSION_PAID' ? 'bg-emerald-100 text-emerald-800' :
                      ref.status === 'CONVERTED' ? 'bg-blue-100 text-blue-800' :
                      ref.status === 'COMMISSION_APPROVED' ? 'bg-indigo-100 text-indigo-800' :
                      ref.status === 'QUALIFIED' ? 'bg-purple-100 text-purple-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {ref.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base">{ref.referredClientName}</h4>
                  <div className="text-xs text-slate-500 mt-0.5">{ref.referredClientCity} • Service: {ref.serviceCategory}</div>

                  {ref.caseReference && (
                    <div className="mt-2 text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-1 rounded inline-block">
                      Linked Case: {ref.caseReference}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-slate-400">Estimated Project</div>
                    <div className="font-bold text-slate-800">₹{formatINR(ref.projectValue)}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-slate-400">Success Commission ({ref.commissionRatePercent}%)</div>
                    <div className="font-black text-emerald-700 text-sm">
                      ₹{formatINR(ref.commissionAmount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Referral Modal */}
      {isSubmitReferralOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Register Client Referral Lead</h3>
                <p className="text-xs text-emerald-200 mt-0.5">Generate tracking code and lock in your partner commission</p>
              </div>
              <button onClick={() => setIsSubmitReferralOpen(false)} className="text-emerald-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReferral} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Client / Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Industrial Warehouses"
                    value={refClientName}
                    onChange={(e) => setRefClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={refClientCity}
                    onChange={(e) => setRefClientCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Client Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98XXX XXXXX"
                    value={refClientPhone}
                    onChange={(e) => setRefClientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Discipline</label>
                  <select
                    value={refServiceCategory}
                    onChange={(e) => setRefServiceCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg font-medium"
                  >
                    <option value="solar-rooftop">Solar Rooftop EPC</option>
                    <option value="land-gis-survey">Land GIS & Geospatial</option>
                    <option value="detailed-boq-estimation">BOQ & Estimation</option>
                    <option value="water-treatment-system">Water & STP Plant</option>
                    <option value="property-due-diligence">Property Due Diligence</option>
                    <option value="site-cctv-iot-surveillance">Surveillance & AI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimated Project Value (₹ INR)</label>
                <input
                  type="number"
                  step="25000"
                  value={refProjectValue}
                  onChange={(e) => setRefProjectValue(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg font-black text-emerald-800 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Introduction Notes & Context</label>
                <textarea
                  rows={3}
                  value={refNotes}
                  onChange={(e) => setRefNotes(e.target.value)}
                  placeholder="Key decision maker names, requirement brief, preferred timeline..."
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitReferralOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRef}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-sm"
                >
                  {submittingRef ? 'Registering...' : 'Register Referral Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
