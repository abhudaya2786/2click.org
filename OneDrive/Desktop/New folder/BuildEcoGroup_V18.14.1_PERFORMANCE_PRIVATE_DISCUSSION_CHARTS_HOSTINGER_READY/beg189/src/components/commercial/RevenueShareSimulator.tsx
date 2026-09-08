import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  DollarSign, 
  PieChart, 
  Sliders, 
  ArrowRight,
  TrendingUp,
  Percent,
  RefreshCw
} from 'lucide-react';
import { formatINR } from '../../lib/money';
import { MultiPartySplitCalculationResult, WorkModelType } from '../../types/backend';

interface RevenueShareSimulatorProps {
  initialServiceSlug?: string;
  initialQuote?: number;
}

export const RevenueShareSimulator: React.FC<RevenueShareSimulatorProps> = ({
  initialServiceSlug = 'solar-rooftop',
  initialQuote = 250000,
}) => {
  const [serviceSlug, setServiceSlug] = useState(initialServiceSlug);
  const [quoteAmount, setQuoteAmount] = useState<number>(initialQuote);
  const [workModel, setWorkModel] = useState<WorkModelType>('FREELANCER');
  const [urgency, setUrgency] = useState<'NORMAL' | 'EXPRESS'>('NORMAL');

  // Custom Overrides Sliders
  const [useCustomSplit, setUseCustomSplit] = useState(false);
  const [providerPct, setProviderPct] = useState(65);
  const [consultantPct, setConsultantPct] = useState(10);
  const [freelancerPct, setFreelancerPct] = useState(5);
  const [referralPct, setReferralPct] = useState(5);
  const [coordinatorPct, setCoordinatorPct] = useState(3);
  const [platformMarginPct, setPlatformMarginPct] = useState(12);

  const [simulation, setSimulation] = useState<MultiPartySplitCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const payload: any = {
        serviceSlug,
        quoteAmount: Number(quoteAmount) || 0,
        workModel,
        urgency,
      };

      if (useCustomSplit) {
        payload.customOverrides = {
          providerPercent: providerPct,
          consultantPercent: consultantPct,
          freelancerPercent: freelancerPct,
          referralPercent: referralPct,
          coordinatorPercent: coordinatorPct,
          marginPercent: platformMarginPct,
        };
      }

      const res = await fetch('/api/commercial/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSimulation(data.simulation);
      }
    } catch (err) {
      console.error('Simulation error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [serviceSlug, quoteAmount, workModel, urgency, useCustomSplit, providerPct, consultantPct, freelancerPct, referralPct, coordinatorPct, platformMarginPct]);

  const presetServices = [
    { slug: 'solar-rooftop', name: 'Commercial Solar Rooftop EPC', defaultModel: 'EPC_PARTNER' as WorkModelType },
    { slug: 'land-gis-survey', name: 'Geospatial Land GIS & Boundary', defaultModel: 'FREELANCER' as WorkModelType },
    { slug: 'detailed-boq-estimation', name: 'Detailed BOQ & Quantity Takeoff', defaultModel: 'FREELANCER' as WorkModelType },
    { slug: 'property-due-diligence', name: 'Property Legal & Technical Diligence', defaultModel: 'HYBRID' as WorkModelType },
    { slug: 'water-treatment-system', name: 'Commercial Water Treatment & STP', defaultModel: 'EPC_PARTNER' as WorkModelType },
    { slug: 'site-cctv-iot-surveillance', name: 'Site CCTV & AI Perimeter Tech', defaultModel: 'VENDOR' as WorkModelType },
  ];

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="revenue-share-simulator-card">
      <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Calculator className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-slate-900">Multi-Party Revenue Sharing & Margin Engine</h3>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Simulate end-to-end commercial payouts, 18% GST deductions, partner splits, and platform gross vs. net margin health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setUseCustomSplit(!useCustomSplit);
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              useCustomSplit 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                : 'bg-[var(--color-surface)] text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            id="toggle-custom-split-btn"
          >
            <Sliders className="w-3.5 h-3.5" />
            {useCustomSplit ? 'Custom Split Active' : 'Enable Custom Sliders'}
          </button>
          <button
            onClick={runSimulation}
            disabled={loading}
            className="p-2 text-slate-600 bg-[var(--color-surface)] border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            title="Recalculate"
            id="recalculate-split-btn"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls & Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Specialist Service
            </label>
            <select
              value={serviceSlug}
              onChange={(e) => {
                const s = e.target.value;
                setServiceSlug(s);
                const found = presetServices.find(p => p.slug === s);
                if (found) setWorkModel(found.defaultModel);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-[var(--color-surface)]"
              id="service-slug-select"
            >
              {presetServices.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Gross Customer Quotation (₹ INR Incl. GST)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₹</span>
              <input
                type="number"
                step="5000"
                min="10000"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-[var(--color-surface)]"
                id="quote-amount-input"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[50000, 150000, 300000, 750000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuoteAmount(preset)}
                  className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                    quoteAmount === preset 
                      ? 'bg-slate-800 text-white border-slate-800' 
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  ₹{formatINR(preset)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Outsourcing Work Model
              </label>
              <select
                value={workModel}
                onChange={(e) => setWorkModel(e.target.value as WorkModelType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                id="work-model-select"
              >
                <option value="FREELANCER">Freelancer (Work Package)</option>
                <option value="CONSULTANT">Consultant Assigned</option>
                <option value="OUTSOURCE_AGENCY">Outsource Agency</option>
                <option value="VENDOR">Product Vendor</option>
                <option value="EPC_PARTNER">Turnkey EPC Partner</option>
                <option value="IN_HOUSE">In-house Team</option>
                <option value="HYBRID">Hybrid (Consultant + FL)</option>
                <option value="REFERRAL_ONLY">Referral Lead Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Delivery Urgency
              </label>
              <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setUrgency('NORMAL')}
                  className={`flex-1 py-2 text-xs font-medium ${
                    urgency === 'NORMAL' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('EXPRESS')}
                  className={`flex-1 py-2 text-xs font-medium ${
                    urgency === 'EXPRESS' ? 'bg-amber-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Express (1.2x)
                </button>
              </div>
            </div>
          </div>

          {/* Custom Sliders (if toggled) */}
          {useCustomSplit && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200 pb-2">
                <span>Direct Split Adjuster</span>
                <span className="text-emerald-700">Total: {providerPct + consultantPct + freelancerPct + referralPct + coordinatorPct + platformMarginPct}%</span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Provider / EPC / Agency Share:</span>
                  <span className="font-bold">{providerPct}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="85"
                  value={providerPct}
                  onChange={(e) => setProviderPct(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Consultant Review Fee:</span>
                  <span className="font-bold">{consultantPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={consultantPct}
                  onChange={(e) => setConsultantPct(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Freelancer Sub-package:</span>
                  <span className="font-bold">{freelancerPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={freelancerPct}
                  onChange={(e) => setFreelancerPct(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Referral Partner Share:</span>
                  <span className="font-bold">{referralPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={referralPct}
                  onChange={(e) => setReferralPct(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Coordinator Operations:</span>
                  <span className="font-bold">{coordinatorPct}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={coordinatorPct}
                  onChange={(e) => setCoordinatorPct(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Platform Retained Margin:</span>
                  <span className="font-bold text-emerald-700">{platformMarginPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={platformMarginPct}
                  onChange={(e) => setPlatformMarginPct(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Simulation Results */}
        <div className="lg:col-span-7 space-y-6">
          {simulation ? (
            <>
              {/* Margin Health Banner */}
              <div 
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  simulation.marginStatus === 'HEALTHY'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : simulation.marginStatus === 'LOW_MARGIN_WARNING'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
                id="simulation-margin-banner"
              >
                {simulation.marginStatus === 'HEALTHY' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : simulation.marginStatus === 'LOW_MARGIN_WARNING' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-sm flex items-center gap-2">
                    <span>
                      {simulation.marginStatus === 'HEALTHY' && 'Commercial Split: Healthy Margin Profile'}
                      {simulation.marginStatus === 'LOW_MARGIN_WARNING' && 'Low Margin Warning Detected'}
                      {simulation.marginStatus === 'NEGATIVE_MARGIN_ALERT' && 'Critical: Negative Margin Alert!'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface)] font-mono border">
                      Rule v{simulation.effectiveRuleVersion}
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {simulation.marginWarningMessage ||
                      `Gross platform margin stands at ${simulation.platformGrossMarginPercent}% (₹${formatINR(
                        simulation.platformGrossMargin
                      )}), exceeding standard risk buffers after accounting for statutory 18% GST and partner payouts.`}
                  </p>
                </div>
              </div>

              {/* Big Summary Cards */}
              <div className="grid grid-cols-3 gap-3.5">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Client Quote</div>
                  <div className="text-lg font-black text-slate-900 mt-1">₹{formatINR(simulation.grossCustomerQuote)}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Incl. 18% GST (₹{formatINR(simulation.taxAmount)})</div>
                </div>

                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl">
                  <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Net Delivery Cost</div>
                  <div className="text-lg font-black text-blue-900 mt-1">
                    ₹{formatINR(simulation.netCustomerQuoteBeforeTax - simulation.platformGrossMargin)}
                  </div>
                  <div className="text-xs text-blue-600 mt-0.5">Executor + Consultant + Ref</div>
                </div>

                <div className={`p-4 rounded-xl border ${
                  simulation.platformNetMargin >= 0 
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}>
                  <div className="text-xs font-semibold uppercase tracking-wide opacity-80">Platform Net Margin</div>
                  <div className="text-lg font-black mt-1">
                    ₹{formatINR(simulation.platformNetMargin)}
                  </div>
                  <div className="text-xs font-semibold mt-0.5">
                    {simulation.platformNetMarginPercent}% net retention
                  </div>
                </div>
              </div>

              {/* Detailed Multi-Party Distribution Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="px-4 py-3 bg-slate-100/70 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Audited Payout & Margin Waterfall
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Net Base: ₹{formatINR(simulation.netCustomerQuoteBeforeTax)}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 text-sm">
                  {/* Row 1: Primary Executor / Provider */}
                  <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                      <div>
                        <div className="font-semibold text-slate-900">Primary Provider / Agency / Vendor</div>
                        <div className="text-xs text-slate-500">Scope execution, equipment & field team costs</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">₹{formatINR(simulation.providerPayable)}</div>
                      <div className="text-xs text-slate-500">{simulation.providerPercent}% split</div>
                    </div>
                  </div>

                  {/* Row 2: Consultant Review */}
                  <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                      <div>
                        <div className="font-semibold text-slate-900">Empaneled Senior Consultant</div>
                        <div className="text-xs text-slate-500">Technical peer review, QA & client signoff fee</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">₹{formatINR(simulation.consultantCommission)}</div>
                      <div className="text-xs text-slate-500">{simulation.consultantPercent}% split</div>
                    </div>
                  </div>

                  {/* Row 3: Freelancer Package (if applicable) */}
                  <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
                      <div>
                        <div className="font-semibold text-slate-900">Specialist Freelancer Work Package</div>
                        <div className="text-xs text-slate-500">Discrete 3D simulation / drafting / testing modules</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">₹{formatINR(simulation.freelancerPayable)}</div>
                      <div className="text-xs text-slate-500">{simulation.freelancerPercent}% split</div>
                    </div>
                  </div>

                  {/* Row 4: Referral Partner */}
                  <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-600"></div>
                      <div>
                        <div className="font-semibold text-slate-900">Referral / Channel Partner</div>
                        <div className="text-xs text-slate-500">Lead originator success bonus (BEG-REF code)</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">₹{formatINR(simulation.referralShare)}</div>
                      <div className="text-xs text-slate-500">{simulation.referralPercent}% split</div>
                    </div>
                  </div>

                  {/* Row 5: Coordinator Desk */}
                  <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-600"></div>
                      <div>
                        <div className="font-semibold text-slate-900">Case Coordinator Allocation</div>
                        <div className="text-xs text-slate-500">Internal operations management & SLA tracking</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">₹{formatINR(simulation.coordinatorFee)}</div>
                      <div className="text-xs text-slate-500">{simulation.coordinatorPercent}% split</div>
                    </div>
                  </div>

                  {/* Row 6: Platform Gross Margin */}
                  <div className="p-3.5 flex items-center justify-between bg-emerald-50/40">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                      <div>
                        <div className="font-bold text-emerald-950">BuildEcoGroup Platform Gross Margin</div>
                        <div className="text-xs text-emerald-700">Retained revenue before operational overhead</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-emerald-900">₹{formatINR(simulation.platformGrossMargin)}</div>
                      <div className="text-xs font-bold text-emerald-700">{simulation.platformGrossMarginPercent}% gross</div>
                    </div>
                  </div>

                  {/* Row 7: Platform Operational Overhead */}
                  <div className="p-3.5 flex items-center justify-between bg-slate-50/60 text-xs text-slate-500">
                    <div className="flex items-center gap-3 pl-4">
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span>Less: Payment Gateway (2%) + Verification/Platform Compliance (2%)</span>
                    </div>
                    <span className="font-medium text-slate-700">- ₹{formatINR(simulation.estimatedPlatformDirectCosts)}</span>
                  </div>

                  {/* Final Row: Statutory GST Note */}
                  <div className="p-3 bg-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Info className="w-3.5 h-3.5 text-slate-500" />
                      Government Tax (18% GST collected for treasury)
                    </span>
                    <span className="font-bold font-mono">₹{formatINR(simulation.taxAmount)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 border border-dashed rounded-xl">
              Loading commercial simulation data...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
