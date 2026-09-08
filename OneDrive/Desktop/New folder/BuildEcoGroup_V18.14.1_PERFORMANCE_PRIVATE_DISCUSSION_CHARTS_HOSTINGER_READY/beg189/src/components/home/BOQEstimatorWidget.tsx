import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  FileSpreadsheet, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Sun, 
  Droplets, 
  Camera, 
  Compass,
  Building,
  HelpCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatINR } from '../../lib/utils';

interface BOQEstimatorWidgetProps {
  onOpenIntakeWithEstimate: (estimateDetails: string) => void;
}

export const BOQEstimatorWidget: React.FC<BOQEstimatorWidgetProps> = ({
  onOpenIntakeWithEstimate,
}) => {
  const [areaSqFt, setAreaSqFt] = useState<number>(2500);
  const [typology, setTypology] = useState<'RESIDENTIAL' | 'ECO_VILLA' | 'COMMERCIAL' | 'WAREHOUSE'>('ECO_VILLA');
  const [specTier, setSpecTier] = useState<'STANDARD' | 'PREMIUM' | 'LUXURY_PASSIVE'>('PREMIUM');
  const [includeSolar, setIncludeSolar] = useState(true);
  const [includeSTP, setIncludeSTP] = useState(true);
  const [includeIoT, setIncludeIoT] = useState(true);
  const [includeVastu, setIncludeVastu] = useState(false);

  // Rate matrices (INR per sqft benchmark)
  const baseRates: Record<string, Record<string, number>> = {
    RESIDENTIAL: { STANDARD: 1850, PREMIUM: 2400, LUXURY_PASSIVE: 3200 },
    ECO_VILLA: { STANDARD: 2200, PREMIUM: 2950, LUXURY_PASSIVE: 3900 },
    COMMERCIAL: { STANDARD: 2100, PREMIUM: 2800, LUXURY_PASSIVE: 3600 },
    WAREHOUSE: { STANDARD: 1250, PREMIUM: 1650, LUXURY_PASSIVE: 2200 },
  };

  const calculated = useMemo(() => {
    const ratePerSqFt = baseRates[typology]?.[specTier] || 2500;
    const civilAndStructure = Math.round(areaSqFt * ratePerSqFt * 0.52);
    const mepAndElectrical = Math.round(areaSqFt * ratePerSqFt * 0.22);
    const finishesAndDoors = Math.round(areaSqFt * ratePerSqFt * 0.26);

    let addOns = 0;
    let solarCost = 0;
    let stpCost = 0;
    let iotCost = 0;
    let vastuCost = 0;

    if (includeSolar) {
      // ~5kW - 15kW depending on area
      const kw = Math.max(3, Math.round(areaSqFt / 400));
      solarCost = kw * 62000;
      addOns += solarCost;
    }

    if (includeSTP) {
      stpCost = Math.round(areaSqFt * 45);
      addOns += stpCost;
    }

    if (includeIoT) {
      iotCost = Math.round(areaSqFt * 35);
      addOns += iotCost;
    }

    if (includeVastu) {
      vastuCost = 35000;
      addOns += vastuCost;
    }

    const subtotal = civilAndStructure + mepAndElectrical + finishesAndDoors + addOns;
    const engineeringFee = Math.round(subtotal * 0.04);
    const totalEstimate = subtotal + engineeringFee;

    return {
      ratePerSqFt,
      civilAndStructure,
      mepAndElectrical,
      finishesAndDoors,
      solarCost,
      stpCost,
      iotCost,
      vastuCost,
      addOns,
      engineeringFee,
      totalEstimate,
      effectiveRatePerSqFt: Math.round(totalEstimate / areaSqFt),
    };
  }, [areaSqFt, typology, specTier, includeSolar, includeSTP, includeIoT, includeVastu]);

  const handleExportToCase = () => {
    const summary = `BOQ Estimate: Typology=${typology}, SpecTier=${specTier}, Area=${areaSqFt} sqft, Total=${formatINR(
      calculated.totalEstimate
    )} (@ ₹${calculated.effectiveRatePerSqFt}/sqft). Addons: Solar=${includeSolar}, STP=${includeSTP}, IoT=${includeIoT}, Vastu=${includeVastu}.`;
    onOpenIntakeWithEstimate(summary);
  };

  return (
    <section id="boq-estimator" className="py-16 sm:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)] scroll-mt-20">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="primary" size="md" icon={<Calculator className="w-3.5 h-3.5" />}>
            Transparent Cost Intelligence
          </Badge>
          <h2 className="text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
            Instant BOQ & Construction Cost Estimator
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Simulate realistic construction and engineering budgets with standardized CPWD/IS code rate benchmarks.
          </p>
        </div>

        {/* Estimator Main Card */}
        <div className="bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Inputs Controls */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Area Slider & Input */}
            <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-[var(--color-border)] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
                  Planned Built-up Area
                </label>
                <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-3 py-1 rounded-lg">
                  <span>{areaSqFt.toLocaleString()}</span>
                  <span className="text-xs text-[var(--color-text-muted)]">Sq Ft</span>
                </div>
              </div>

              <input
                type="range"
                min={500}
                max={25000}
                step={100}
                value={areaSqFt}
                onChange={(e) => setAreaSqFt(Number(e.target.value))}
                className="w-full h-2 bg-[var(--color-primary-border)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
              />

              <div className="flex justify-between text-[10px] font-mono text-[var(--color-text-muted)]">
                <span>500 sqft (Tiny/Cabin)</span>
                <span>5,000 sqft (Bungalow)</span>
                <span>25,000+ sqft (Commercial)</span>
              </div>
            </div>

            {/* Typology & Specification Tier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)] space-y-2">
                <label className="block text-xs font-bold text-[var(--color-text)]">Typology</label>
                <select
                  value={typology}
                  onChange={(e: any) => setTypology(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-xs font-semibold text-[var(--color-text)]"
                >
                  <option value="ECO_VILLA">Sustainable Eco Villa</option>
                  <option value="RESIDENTIAL">Standard Residential Home</option>
                  <option value="COMMERCIAL">Commercial / Office Complex</option>
                  <option value="WAREHOUSE">Industrial / PEB Warehouse</option>
                </select>
              </div>

              <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)] space-y-2">
                <label className="block text-xs font-bold text-[var(--color-text)]">Specification Tier</label>
                <select
                  value={specTier}
                  onChange={(e: any) => setSpecTier(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-xs font-semibold text-[var(--color-text)]"
                >
                  <option value="STANDARD">Standard Grade (IS Compliant)</option>
                  <option value="PREMIUM">Premium Engineered (Low-Carbon)</option>
                  <option value="LUXURY_PASSIVE">Bioclimatic Luxury (Passive House)</option>
                </select>
              </div>
            </div>

            {/* Sustainability & Engineering Add-ons */}
            <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-[var(--color-border)] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
                Sustainability & Smart Systems Add-ons
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-background)]">
                  <input
                    type="checkbox"
                    checked={includeSolar}
                    onChange={(e) => setIncludeSolar(e.target.checked)}
                    className="w-4 h-4 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)]"
                  />
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-bold text-[var(--color-text)]">Solar Microgrid</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">Rooftop PV & Hybrid Inverter</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-background)]">
                  <input
                    type="checkbox"
                    checked={includeSTP}
                    onChange={(e) => setIncludeSTP(e.target.checked)}
                    className="w-4 h-4 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)]"
                  />
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-bold text-[var(--color-text)]">Water Loop / STP</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">Rainwater recharge & filtration</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-background)]">
                  <input
                    type="checkbox"
                    checked={includeIoT}
                    onChange={(e) => setIncludeIoT(e.target.checked)}
                    className="w-4 h-4 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)]"
                  />
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="font-bold text-[var(--color-text)]">IoT & Site Telemetry</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">CCTV, sensors & energy meters</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-background)]">
                  <input
                    type="checkbox"
                    checked={includeVastu}
                    onChange={(e) => setIncludeVastu(e.target.checked)}
                    className="w-4 h-4 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)]"
                  />
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[var(--color-brand-brown)]" />
                    <div>
                      <div className="font-bold text-[var(--color-text)]">Vastu Alignment</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">Directional energy optimization</div>
                    </div>
                  </div>
                </label>

              </div>
            </div>

          </div>

          {/* Right Summary Breakdown Panel */}
          <div className="lg:col-span-5 bg-[var(--color-surface)] p-6 sm:p-7 rounded-2xl border border-[var(--color-border)] space-y-6 shadow-sm">
            <div>
              <span className="text-xs font-mono font-bold text-[var(--color-brand-brown)] uppercase tracking-wider">
                Computed Cost Matrix
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-[var(--color-primary)]">
                  {formatINR(calculated.totalEstimate)}
                </span>
                <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                  (₹{calculated.effectiveRatePerSqFt}/sqft)
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                Estimated turnkey baseline for {areaSqFt.toLocaleString()} sqft {typology.toLowerCase().replace('_', ' ')}.
              </p>
            </div>

            {/* Line Item Breakdown */}
            <div className="space-y-3 pt-4 border-t border-[var(--color-border)] text-xs">
              
              <div className="flex justify-between items-center py-1">
                <span className="text-[var(--color-text-muted)]">Civil & Structural Shell (RCC, Steel, Masonry):</span>
                <span className="font-bold text-[var(--color-text)]">{formatINR(calculated.civilAndStructure)}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[var(--color-text-muted)]">MEP, Electrical & Plumbing:</span>
                <span className="font-bold text-[var(--color-text)]">{formatINR(calculated.mepAndElectrical)}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[var(--color-text-muted)]">Finishes, Flooring, Paint & Glazing:</span>
                <span className="font-bold text-[var(--color-text)]">{formatINR(calculated.finishesAndDoors)}</span>
              </div>

              {calculated.addOns > 0 && (
                <div className="flex justify-between items-center py-1 text-emerald-800 bg-[var(--color-primary-subtle)] px-2 py-1 rounded">
                  <span className="font-medium">Sustainability & Smart Add-ons:</span>
                  <span className="font-bold">+ {formatINR(calculated.addOns)}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-1 text-[var(--color-text-muted)]">
                <span>Independent Peer Review & Orchestration Fee (~4%):</span>
                <span>{formatINR(calculated.engineeringFee)}</span>
              </div>

            </div>

            {/* Disclaimer */}
            <div className="p-3 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] text-[10px] text-[var(--color-text-muted)] leading-relaxed">
              * Indicative computational estimate based on standard regional indices. Actual cost is finalized via itemized BOQ tender and vendor bid normalization.
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleExportToCase}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Export to Case & Get Itemized BOQ
              </Button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
