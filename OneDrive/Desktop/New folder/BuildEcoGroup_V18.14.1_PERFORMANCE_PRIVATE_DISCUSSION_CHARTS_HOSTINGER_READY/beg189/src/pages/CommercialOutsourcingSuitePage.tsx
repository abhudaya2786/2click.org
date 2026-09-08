import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Calculator,
  Percent,
  Wallet,
  TrendingUp,
  Briefcase,
  ShieldCheck,
  Building,
  ArrowLeft,
  DollarSign,
} from 'lucide-react';
import { WorkPackageBuilder } from '../components/commercial/WorkPackageBuilder';
import { FreelancerMarketplace } from '../components/commercial/FreelancerMarketplace';
import { RevenueShareSimulator } from '../components/commercial/RevenueShareSimulator';
import { MarginEngineConfig } from '../components/commercial/MarginEngineConfig';
import { ReferralPartnerLedger } from '../components/commercial/ReferralPartnerLedger';
import { CommercialAnalyticsDashboard } from '../components/commercial/CommercialAnalyticsDashboard';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';

export const CommercialOutsourcingSuitePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'PACKAGES' | 'MARKETPLACE' | 'SIMULATOR' | 'MARGIN_RULES' | 'LEDGER' | 'ANALYTICS'
  >('PACKAGES');

  const userRole = user?.role || 'ADMIN';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="commercial-outsourcing-suite-page">
      {/* Top Banner Navigation */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              to={ROUTES.ADMIN_DASHBOARD}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
            </Link>
            <span className="text-slate-500">•</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              Phase 9 Commercial Master
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Commercial & Category Outsourcing Engine
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Unified platform for Work Package Building, Freelancer Marketplace, Multi-Party Revenue Sharing, Margin Guardrails, Partner Wallets, and Audited Unit Economics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 bg-[var(--color-surface)]/10 p-2 rounded-xl backdrop-blur-xs border border-white/15">
          <div className="text-right px-3 border-r border-white/10">
            <div className="text-xs text-slate-400 font-medium">Logged Role</div>
            <div className="text-xs font-bold text-emerald-400">{userRole}</div>
          </div>
          <div className="px-2">
            <div className="text-xs text-slate-400 font-medium">Security Audit</div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Active
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation Menu */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-200/70 rounded-xl border border-slate-300/80 shadow-xs">
        <button
          onClick={() => setActiveTab('PACKAGES')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'PACKAGES'
              ? 'bg-[var(--color-surface)] text-purple-900 shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-[var(--color-surface)]/50'
          }`}
          id="tab-btn-packages"
        >
          <Layers className="w-4 h-4 text-purple-600" />
          Work Package Builder
        </button>

        <button
          onClick={() => setActiveTab('MARKETPLACE')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'MARKETPLACE'
              ? 'bg-[var(--color-surface)] text-indigo-900 shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-[var(--color-surface)]/50'
          }`}
          id="tab-btn-marketplace"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Freelancer Marketplace
        </button>

        <button
          onClick={() => setActiveTab('SIMULATOR')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'SIMULATOR'
              ? 'bg-[var(--color-surface)] text-emerald-900 shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-[var(--color-surface)]/50'
          }`}
          id="tab-btn-simulator"
        >
          <Calculator className="w-4 h-4 text-emerald-600" />
          Revenue Share Simulator
        </button>

        <button
          onClick={() => setActiveTab('MARGIN_RULES')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'MARGIN_RULES'
              ? 'bg-[var(--color-surface)] text-blue-900 shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-[var(--color-surface)]/50'
          }`}
          id="tab-btn-margin-rules"
        >
          <Percent className="w-4 h-4 text-blue-600" />
          Margin & Commercial Rules
        </button>

        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'LEDGER'
              ? 'bg-[var(--color-surface)] text-amber-900 shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-[var(--color-surface)]/50'
          }`}
          id="tab-btn-ledger"
        >
          <Wallet className="w-4 h-4 text-amber-600" />
          Partner Ledger & Referrals
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'ANALYTICS'
              ? 'bg-[var(--color-surface)] text-slate-900 shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-[var(--color-surface)]/50'
          }`}
          id="tab-btn-analytics"
        >
          <TrendingUp className="w-4 h-4 text-slate-700" />
          Commercial Analytics
        </button>
      </div>

      {/* Render Selected View */}
      <div className="transition-all duration-150">
        {activeTab === 'PACKAGES' && (
          <WorkPackageBuilder userRole={userRole} />
        )}

        {activeTab === 'MARKETPLACE' && (
          <FreelancerMarketplace userRole={userRole} currentUserId={user?.id} />
        )}

        {activeTab === 'SIMULATOR' && (
          <RevenueShareSimulator />
        )}

        {activeTab === 'MARGIN_RULES' && (
          <MarginEngineConfig userRole={userRole} />
        )}

        {activeTab === 'LEDGER' && (
          <ReferralPartnerLedger 
            partnerId={user?.id || 'fl-01'} 
            partnerName={user?.fullName || 'Arvind Mehta, PE'} 
            userRole={userRole} 
          />
        )}

        {activeTab === 'ANALYTICS' && (
          <CommercialAnalyticsDashboard />
        )}
      </div>
    </div>
  );
};
