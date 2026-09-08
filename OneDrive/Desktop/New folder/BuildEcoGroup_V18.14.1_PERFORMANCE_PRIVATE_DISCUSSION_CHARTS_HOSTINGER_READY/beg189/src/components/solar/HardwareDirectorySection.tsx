import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  SlidersHorizontal, 
  X, 
  Zap, 
  Sun, 
  BatteryCharging, 
  Cpu, 
  ArrowRight,
  Download,
  Scale
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { SOLAR_PRODUCTS_CATALOG } from '../../lib/solarRegistry';
import { SolarProductItem, HardwareCategory } from '../../types/solar';

interface HardwareDirectorySectionProps {
  onSelectProductForQuote?: (product: SolarProductItem) => void;
}

export const HardwareDirectorySection: React.FC<HardwareDirectorySectionProps> = ({
  onSelectProductForQuote
}) => {
  const [selectedCategory, setSelectedCategory] = useState<HardwareCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [almmOnly, setAlmmOnly] = useState(false);
  
  // Side-by-side comparison state (IDs of products to compare)
  const [comparisonList, setComparisonList] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const toggleComparison = (productId: string) => {
    if (comparisonList.includes(productId)) {
      setComparisonList(comparisonList.filter(id => id !== productId));
    } else {
      if (comparisonList.length >= 3) {
        alert('You can compare up to 3 hardware items simultaneously.');
        return;
      }
      setComparisonList([...comparisonList, productId]);
    }
  };

  const filteredProducts = useMemo(() => {
    return SOLAR_PRODUCTS_CATALOG.filter((item) => {
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchAlmm = !almmOnly || item.almmApproved;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = 
        !q ||
        item.brandName.toLowerCase().includes(q) ||
        item.modelNumber.toLowerCase().includes(q) ||
        item.technologyType.toLowerCase().includes(q) ||
        item.capacityRating.toLowerCase().includes(q);

      return matchCat && matchAlmm && matchSearch;
    });
  }, [selectedCategory, almmOnly, searchQuery]);

  const comparedProducts = useMemo(() => {
    return SOLAR_PRODUCTS_CATALOG.filter(p => comparisonList.includes(p.id));
  }, [comparisonList]);

  return (
    <div className="space-y-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-[var(--color-border)]">
        <div className="space-y-2 max-w-2xl">
          <Badge variant="primary" size="md" icon={<Cpu className="w-3.5 h-3.5" />}>
            Tier-1 Hardware Catalog & Benchmarking
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
            Certified Solar Modules, Inverters & Storage Directory
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Compare technical datasheets, ALMM certification, temperature coefficients, and warranty guarantees across leading Indian and global Tier-1 manufacturers.
          </p>
        </div>

        {/* Search & Compare Drawer trigger */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#7A837C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Waaree, Sungrow, BYD, TOPCon..."
              className="w-full sm:w-64 pl-9 pr-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-xs font-semibold focus:border-[#1697C4] focus:outline-hidden"
            />
          </div>

          {comparisonList.length > 0 && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCompareModalOpen(true)}
              className="bg-[var(--color-primary)] text-xs font-bold shrink-0 animate-pulse"
              leftIcon={<Scale className="w-4 h-4" />}
            >
              Compare ({comparisonList.length}/3)
            </Button>
          )}
        </div>
      </div>

      {/* Category Switcher & ALMM Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'All Hardware' },
            { id: 'MODULE', label: 'Solar PV Modules' },
            { id: 'INVERTER', label: 'Solar Inverters' },
            { id: 'BATTERY', label: 'Battery Storage (BESS)' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border-strong)] hover:border-[#1697C4]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ALMM Filter Toggle */}
        <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)] bg-[var(--color-background)] px-3 py-2 rounded-xl border border-[var(--color-border)] cursor-pointer">
          <input
            type="checkbox"
            checked={almmOnly}
            onChange={(e) => setAlmmOnly(e.target.checked)}
            className="rounded accent-[#1697C4] w-4 h-4"
          />
          <span>Show ALMM List-I Approved Only</span>
        </label>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => {
          const isComparing = comparisonList.includes(prod.id);
          return (
            <Card
              key={prod.id}
              className="rounded-3xl border border-[var(--color-border)] p-6 bg-[var(--color-surface)] flex flex-col justify-between space-y-5 hover:border-[#1697C4]/40 transition-colors shadow-2xs"
            >
              <div className="space-y-4">
                
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-1 rounded-md border border-[#D4E8DC]">
                      {prod.category}
                    </span>
                    {prod.almmApproved && (
                      <span className="text-[10px] font-bold text-[var(--color-brand-brown)] bg-[#FAF6EE] px-2 py-0.5 rounded border border-[#C6DEE8]">
                        ALMM Verified
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-[#7A837C]">
                    {prod.tier}
                  </span>
                </div>

                {/* Brand & Model */}
                <div>
                  <div className="text-xs font-bold text-[var(--color-brand-brown)] uppercase">{prod.brandName}</div>
                  <h3 className="text-base font-extrabold text-[var(--color-text)] mt-0.5">{prod.modelNumber}</h3>
                  <div className="text-xs font-semibold text-[var(--color-primary)] mt-1">{prod.technologyType}</div>
                </div>

                {/* Core Parametric Specs */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] text-xs">
                  <div>
                    <span className="text-[#7A837C] text-[10px]">Rated Capacity:</span>
                    <div className="font-extrabold text-[var(--color-text)]">{prod.capacityRating}</div>
                  </div>
                  <div>
                    <span className="text-[#7A837C] text-[10px]">Efficiency:</span>
                    <div className="font-extrabold text-[var(--color-primary)]">{prod.efficiencyPercentage}%</div>
                  </div>

                  {prod.temperatureCoefficient && (
                    <div>
                      <span className="text-[#7A837C] text-[10px]">Temp Coeff:</span>
                      <div className="font-bold text-[var(--color-text)]">{prod.temperatureCoefficient}</div>
                    </div>
                  )}

                  {prod.warrantyYears && (
                    <div>
                      <span className="text-[#7A837C] text-[10px]">Product Warranty:</span>
                      <div className="font-bold text-[var(--color-text)]">{prod.warrantyYears} Years</div>
                    </div>
                  )}

                  {prod.bessCycleLife && (
                    <div>
                      <span className="text-[#7A837C] text-[10px]">BESS Cycles:</span>
                      <div className="font-bold text-[var(--color-primary)]">{prod.bessCycleLife}+ @ 90% DoD</div>
                    </div>
                  )}

                  {prod.mpptChannels && (
                    <div>
                      <span className="text-[#7A837C] text-[10px]">MPPT Trackers:</span>
                      <div className="font-bold text-[var(--color-text)]">{prod.mpptChannels}</div>
                    </div>
                  )}
                </div>

                {/* Key Features List */}
                <div className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                  {prod.keyFeatures.slice(0, 2).map((feat, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{feat}</span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Action Buttons: Compare Checkbox + Quote */}
              <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleComparison(prod.id)}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                    isComparing
                      ? 'bg-[var(--color-primary)] text-white border-[#1697C4]'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border-strong)] hover:border-[#1697C4]'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{isComparing ? 'Comparing' : 'Compare'}</span>
                </button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSelectProductForQuote && onSelectProductForQuote(prod)}
                  className="flex-1 bg-[var(--color-primary)] text-xs font-bold"
                >
                  Include in BOQ
                </Button>
              </div>

            </Card>
          );
        })}
      </div>

      {/* SIDE-BY-SIDE PRODUCT COMPARISON MODAL */}
      {isCompareModalOpen && comparedProducts.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div 
            className="relative w-full max-w-5xl bg-[var(--color-surface)] rounded-3xl shadow-2xl border border-[var(--color-border)] overflow-hidden my-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-background)] border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-brown)]">
                    Parametric Comparison Engine
                  </div>
                  <div className="text-sm font-extrabold text-[var(--color-text)]">
                    Side-by-Side Hardware Specifications ({comparedProducts.length} Selected)
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsCompareModalOpen(false)}
                className="p-1.5 text-[#7A837C] hover:text-[var(--color-text)] hover:bg-[#D6E8F0]/50 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Matrix Table */}
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="p-3 bg-[var(--color-background)] font-bold text-[#7A837C] w-48">Parameter</th>
                    {comparedProducts.map((p) => (
                      <th key={p.id} className="p-3 font-extrabold text-[var(--color-text)] min-w-[200px]">
                        <div className="text-xs text-[var(--color-brand-brown)]">{p.brandName}</div>
                        <div className="text-sm">{p.modelNumber}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D6E8F0]">
                  <tr>
                    <td className="p-3 font-bold text-[var(--color-text-muted)] bg-[var(--color-background)]">Category</td>
                    {comparedProducts.map(p => <td key={p.id} className="p-3 font-semibold">{p.category}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[var(--color-text-muted)] bg-[var(--color-background)]">Rated Output</td>
                    {comparedProducts.map(p => <td key={p.id} className="p-3 font-extrabold text-[var(--color-primary)]">{p.capacityRating}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[var(--color-text-muted)] bg-[var(--color-background)]">Technology / Architecture</td>
                    {comparedProducts.map(p => <td key={p.id} className="p-3">{p.technologyType}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[var(--color-text-muted)] bg-[var(--color-background)]">Peak Efficiency</td>
                    {comparedProducts.map(p => <td key={p.id} className="p-3 font-bold text-[var(--color-primary)]">{p.efficiencyPercentage}%</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[var(--color-text-muted)] bg-[var(--color-background)]">Temperature Coefficient</td>
                    {comparedProducts.map(p => <td key={p.id} className="p-3">{p.temperatureCoefficient || 'N/A'}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[var(--color-text-muted)] bg-[var(--color-background)]">Bifaciality / Degradation</td>
                    {comparedProducts.map(p => <td key={p.id} className="p-3">{p.bifacialityFactor || p.depthOfDischarge || 'Standard'}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[var(--color-text-muted)] bg-[var(--color-background)]">Product / Linear Warranty</td>
                    {comparedProducts.map(p => (
                      <td key={p.id} className="p-3 font-semibold">
                        {p.warrantyYears} Years Product {p.linearWarrantyYears ? `/ ${p.linearWarrantyYears} Yrs Performance` : ''}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[var(--color-text-muted)] bg-[var(--color-background)]">ALMM Approved</td>
                    {comparedProducts.map(p => (
                      <td key={p.id} className="p-3">
                        {p.almmApproved ? (
                          <span className="text-[var(--color-primary)] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </span>
                        ) : (
                          <span className="text-[#7A837C]">Export / Non-ALMM</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[var(--color-text-muted)] bg-[var(--color-background)]">Indicative Pricing Benchmark</td>
                    {comparedProducts.map(p => <td key={p.id} className="p-3 font-bold text-[var(--color-brand-brown)]">{p.priceEstimate}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[var(--color-background)] border-t border-[var(--color-border)] flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setComparisonList([])}
                className="text-xs"
              >
                Clear Comparison
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCompareModalOpen(false)}
                className="bg-[var(--color-primary)] text-xs font-bold"
              >
                Done
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
