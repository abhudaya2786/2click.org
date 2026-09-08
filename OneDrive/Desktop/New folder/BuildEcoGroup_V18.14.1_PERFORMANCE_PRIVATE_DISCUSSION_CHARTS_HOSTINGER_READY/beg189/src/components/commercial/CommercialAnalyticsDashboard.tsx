import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Layers,
  Sparkles,
  ShieldCheck,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { formatINR } from '../../lib/money';
import { CommercialAnalyticsSummary } from '../../types/backend';

export const CommercialAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<CommercialAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/commercial/analytics');
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error('Failed to load commercial analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 bg-[var(--color-surface)] rounded-xl border border-slate-200">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading audited commercial analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6" id="commercial-analytics-dashboard-root">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Commercial & Financial Analytics Desk</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Audited profitability metrics, margin waterfall, partner payout distribution, and category unit economics.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Real-time Analytics
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Contracted Work Value</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{formatINR(analytics.totalWorkValue)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Across all active & delivered cases</div>
        </div>

        <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wide">Total Outsourced Execution</div>
          <div className="text-2xl font-black text-blue-900 mt-1">
            ₹{formatINR(analytics.outsourcedValue)}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {Math.round((analytics.outsourcedValue / analytics.totalWorkValue) * 100)}% of total work volume
          </div>
        </div>

        <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Platform Gross Margin</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ₹{formatINR(analytics.platformGrossMarginTotal)}
          </div>
          <div className="text-xs text-emerald-800 font-semibold mt-1">
            {analytics.averageMarginPercentage}% Average Margin
          </div>
        </div>

        <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-purple-700 uppercase tracking-wide">Platform Net Margin</div>
          <div className="text-2xl font-black text-purple-900 mt-1">
            ₹{formatINR(analytics.platformNetMarginTotal)}
          </div>
          <div className="text-xs text-purple-600 mt-1">After statutory gateway & compliance ops</div>
        </div>
      </div>

      {/* Payout Distribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-600" />
            Partner Disbursement Waterfall
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-purple-50 rounded-lg">
              <span className="font-semibold text-purple-900">Freelancer Package Deliveries</span>
              <span className="font-bold text-purple-950">₹{formatINR(analytics.freelancerValue)}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-indigo-50 rounded-lg">
              <span className="font-semibold text-indigo-900">Senior Consultant QA Fees</span>
              <span className="font-bold text-indigo-950">₹{formatINR(analytics.consultantPayoutsTotal)}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-blue-50 rounded-lg">
              <span className="font-semibold text-blue-900">Turnkey EPC & Vendor Payouts</span>
              <span className="font-bold text-blue-950">₹{formatINR(analytics.vendorPayoutsTotal)}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-amber-50 rounded-lg">
              <span className="font-semibold text-amber-900">Referral Channel Acquisition Costs</span>
              <span className="font-bold text-amber-950">₹{formatINR(analytics.referralCostsTotal)}</span>
            </div>
          </div>
        </div>

        {/* Freelancer Network SLA Stats */}
        <div className="lg:col-span-2 bg-[var(--color-surface)] p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            Freelancer & Partner SLA Health
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Network Specialists</div>
              <div className="text-xl font-black text-slate-900 mt-1">
                {analytics.freelancerNetworkStats.totalFreelancers}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Active Packages</div>
              <div className="text-xl font-black text-purple-700 mt-1">
                {analytics.freelancerNetworkStats.activeWorkPackages}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">On-Time Delivery</div>
              <div className="text-xl font-black text-emerald-700 mt-1">
                {analytics.freelancerNetworkStats.avgOnTimeDeliveryPercent}%
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Rework / Revision Rate</div>
              <div className="text-xl font-black text-blue-700 mt-1">
                {analytics.freelancerNetworkStats.avgReworkRatePercent}%
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Top Tier Reliability:</strong> {analytics.freelancerNetworkStats.topPerformersCount} specialists are currently designated as Preferred Partners maintaining &gt;95% on-time milestone delivery.
            </span>
          </div>
        </div>
      </div>

      {/* Category-wise Unit Economics Table */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Category Profitability & Margin Performance Matrix
          </span>
          <span className="text-xs text-slate-500 font-medium">Real Persisted Case Metrics</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Category Service</th>
                <th className="p-3.5 text-right">Total Quoted (₹)</th>
                <th className="p-3.5 text-right">Total Executed (₹)</th>
                <th className="p-3.5 text-right">Platform Gross (₹)</th>
                <th className="p-3.5 text-right">Margin (%)</th>
                <th className="p-3.5 text-center">Avg Turnaround</th>
                <th className="p-3.5 text-center">Complaint Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.categoryPerformance.map((cat, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">
                    <div>{cat.serviceName}</div>
                    <div className="text-[10px] font-mono text-slate-400 font-normal">{cat.serviceSlug}</div>
                  </td>
                  <td className="p-3.5 text-right font-semibold text-slate-900">
                    ₹{formatINR(cat.totalRevenue)}
                  </td>
                  <td className="p-3.5 text-right font-medium text-slate-600">
                    ₹{formatINR(cat.outsourceCost)}
                  </td>
                  <td className="p-3.5 text-right font-black text-emerald-800">
                    ₹{formatINR(cat.grossMargin)}
                  </td>
                  <td className="p-3.5 text-right">
                    <span className="px-2 py-0.5 rounded font-black bg-emerald-100 text-emerald-900">
                      {cat.marginPercent}%
                    </span>
                  </td>
                  <td className="p-3.5 text-center text-slate-600 font-medium">
                    {cat.avgCompletionDays} Days
                  </td>
                  <td className="p-3.5 text-center text-slate-600">
                    {cat.complaintRatePercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
