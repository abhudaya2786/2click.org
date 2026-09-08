import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Layers,
  Cpu,
  Zap,
  BatteryCharging,
  Sun,
  ShieldCheck,
  CheckCircle2,
  Scale,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Download,
  Info,
  ChevronRight,
  Sparkles,
  ExternalLink,
  PackageCheck,
  Eye,
  Plus,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { SOLAR_PRODUCTS_CATALOG } from '../../lib/solarRegistry';
import { SolarProductItem, HardwareCategory, TechnologyType } from '../../types/solar';

interface SolarCatalogProps {
  onSelectProductForQuote?: (product: SolarProductItem) => void;
  onOpenUniversalIntake?: (objective: string, category?: string) => void;
  className?: string;
}

type SortOption = 'EFFICIENCY_DESC' | 'CAPACITY_DESC' | 'WARRANTY_DESC' | 'BRAND_ASC';
type ViewLayout = 'GRID' | 'TABLE';

export const SolarCatalog: React.FC<SolarCatalogProps> = ({
  onSelectProductForQuote,
  onOpenUniversalIntake,
  className = ''
}) => {
  // --- Filter & Search States ---
  const [selectedCategory, setSelectedCategory] = useState<HardwareCategory | 'ALL'>('ALL');
  const [selectedTechType, setSelectedTechType] = useState<string>('ALL');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [almmOnly, setAlmmOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('EFFICIENCY_DESC');
  const [viewLayout, setViewLayout] = useState<ViewLayout>('GRID');
  
  // Mobile / Expandable filter panel toggle
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  // --- Comparison & Spec Drawer States ---
  const [comparisonList, setComparisonList] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [activeDetailProduct, setActiveDetailProduct] = useState<SolarProductItem | null>(null);

  // Extract unique brands dynamically based on current category selection
  const availableBrands = useMemo(() => {
    const list = selectedCategory === 'ALL'
      ? SOLAR_PRODUCTS_CATALOG
      : SOLAR_PRODUCTS_CATALOG.filter(p => p.category === selectedCategory);
    const brandsSet = new Set(list.map(p => p.brand || p.brandName));
    return Array.from(brandsSet).sort();
  }, [selectedCategory]);

  // Extract available technology types for current category
  const availableTechTypes = useMemo(() => {
    const list = selectedCategory === 'ALL'
      ? SOLAR_PRODUCTS_CATALOG
      : SOLAR_PRODUCTS_CATALOG.filter(p => p.category === selectedCategory);
    const techSet = new Set(list.map(p => p.technologyType));
    return Array.from(techSet).sort();
  }, [selectedCategory]);

  // Handle Brand Toggle
  const handleToggleBrand = (brandName: string) => {
    if (selectedBrands.includes(brandName)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brandName));
    } else {
      setSelectedBrands([...selectedBrands, brandName]);
    }
  };

  // Reset all active filters
  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedTechType('ALL');
    setSelectedBrands([]);
    setSelectedTier('ALL');
    setAlmmOnly(false);
    setSearchQuery('');
    setSortBy('EFFICIENCY_DESC');
  };

  const hasActiveFilters = 
    selectedCategory !== 'ALL' ||
    selectedTechType !== 'ALL' ||
    selectedBrands.length > 0 ||
    selectedTier !== 'ALL' ||
    almmOnly ||
    searchQuery.trim().length > 0;

  // Comparison Handlers
  const toggleComparison = (productId: string) => {
    if (comparisonList.includes(productId)) {
      setComparisonList(comparisonList.filter(id => id !== productId));
    } else {
      if (comparisonList.length >= 3) {
        alert('You can compare up to 3 hardware units simultaneously.');
        return;
      }
      setComparisonList([...comparisonList, productId]);
    }
  };

  // Filter & Sort Logic
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = SOLAR_PRODUCTS_CATALOG.filter((item) => {
      // 1. Category Filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }

      // 2. Technology Type Filter (TOPCon, Mono PERC, LFP, etc.)
      if (selectedTechType !== 'ALL' && item.technologyType !== selectedTechType) {
        return false;
      }

      // 3. Brand Filter
      const itemBrand = item.brand || item.brandName;
      if (selectedBrands.length > 0 && !selectedBrands.includes(itemBrand)) {
        return false;
      }

      // 4. Tier Filter
      if (selectedTier !== 'ALL' && item.tier !== selectedTier) {
        return false;
      }

      // 5. ALMM Verified Only Filter
      if (almmOnly && !item.almmApproved) {
        return false;
      }

      // 6. Search Query (SKU, Name, Model, Brand, Tech, Capacity)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const skuMatch = item.sku?.toLowerCase().includes(q) || false;
        const nameMatch = item.name?.toLowerCase().includes(q) || false;
        const brandMatch = (item.brand || item.brandName).toLowerCase().includes(q);
        const modelMatch = (item.model || item.modelNumber).toLowerCase().includes(q);
        const techMatch = item.technologyType.toLowerCase().includes(q);
        const capMatch = item.capacityRating.toLowerCase().includes(q);
        const subcatMatch = item.subcategory?.toLowerCase().includes(q) || false;

        if (!skuMatch && !nameMatch && !brandMatch && !modelMatch && !techMatch && !capMatch && !subcatMatch) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'EFFICIENCY_DESC') {
        return b.efficiencyPercentage - a.efficiencyPercentage;
      }
      if (sortBy === 'CAPACITY_DESC') {
        const capA = a.capacityValue || parseFloat(a.capacityRating) || 0;
        const capB = b.capacityValue || parseFloat(b.capacityRating) || 0;
        return capB - capA;
      }
      if (sortBy === 'WARRANTY_DESC') {
        const wA = (a.linearWarrantyYears || a.warrantyYears || 0);
        const wB = (b.linearWarrantyYears || b.warrantyYears || 0);
        return wB - wA;
      }
      if (sortBy === 'BRAND_ASC') {
        const bA = a.brand || a.brandName;
        const bB = b.brand || b.brandName;
        return bA.localeCompare(bB);
      }
      return 0;
    });
  }, [selectedCategory, selectedTechType, selectedBrands, selectedTier, almmOnly, searchQuery, sortBy]);

  // Compared products object references
  const comparedProducts = useMemo(() => {
    return SOLAR_PRODUCTS_CATALOG.filter(p => comparisonList.includes(p.id));
  }, [comparisonList]);

  // Category Tab Counts
  const categoryCounts = useMemo(() => {
    return {
      ALL: SOLAR_PRODUCTS_CATALOG.length,
      MODULE: SOLAR_PRODUCTS_CATALOG.filter(p => p.category === 'MODULE').length,
      INVERTER: SOLAR_PRODUCTS_CATALOG.filter(p => p.category === 'INVERTER').length,
      BATTERY: SOLAR_PRODUCTS_CATALOG.filter(p => p.category === 'BATTERY').length
    };
  }, []);

  return (
    <div id="solar-catalog-section" className={`space-y-6 ${className}`}>
      
      {/* =========================================================================
          1. HEADER & HERO BANNER
         ========================================================================= */}
      <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="md" icon={<Cpu className="w-3.5 h-3.5" />}>
                Verified Hardware Catalog & Benchmarks
              </Badge>
              <span className="text-[11px] font-mono font-bold text-[var(--color-brand-brown)] bg-[#FAF6EE] px-2.5 py-0.5 rounded-md border border-[#C6DEE8]">
                MNRE ALMM List-I & IEC Standard Compliant
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
              Solar Equipment Catalog & Parametric Explorer
            </h2>

            <p className="text-sm text-[var(--color-text-muted)]">
              Browse certified N-Type TOPCon & Mono PERC PV modules, high-efficiency multi-MPPT & hybrid inverters, and LFP battery energy storage systems (BESS). Filter by manufacturer, cell technology, and ALMM verification status.
            </p>
          </div>

          {/* Quick Actions / Integration CTA */}
          <div className="flex flex-wrap items-center gap-3">
            {onOpenUniversalIntake && (
              <Button
                variant="outline"
                size="md"
                onClick={() => onOpenUniversalIntake('Custom Solar Hardware BOQ Procurement', 'solar')}
                className="text-xs font-bold border-[var(--color-border-strong)] hover:border-[#1697C4] text-[var(--color-text)]"
                leftIcon={<FileSpreadsheet className="w-4 h-4 text-[var(--color-primary)]" />}
              >
                Request Custom BOQ
              </Button>
            )}

            {comparisonList.length > 0 && (
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCompareModalOpen(true)}
                className="bg-[var(--color-primary)] text-xs font-bold shadow-xs hover:bg-[#123D29] animate-pulse"
                leftIcon={<Scale className="w-4 h-4" />}
              >
                Compare ({comparisonList.length}/3)
              </Button>
            )}
          </div>
        </div>

        {/* Primary Hardware Categories */}
        <div className="mt-6 pt-6 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: 'All Equipment', icon: Layers, count: categoryCounts.ALL },
              { id: 'MODULE', label: 'PV Modules', icon: Sun, count: categoryCounts.MODULE },
              { id: 'INVERTER', label: 'Solar Inverters', icon: Zap, count: categoryCounts.INVERTER },
              { id: 'BATTERY', label: 'Battery Storage (BESS)', icon: BatteryCharging, count: categoryCounts.BATTERY },
            ].map((cat) => {
              const IconComp = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id as any);
                    setSelectedTechType('ALL');
                    setSelectedBrands([]);
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-white shadow-xs'
                      : 'bg-[var(--color-background)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[#1697C4] hover:text-[var(--color-text)]'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--color-primary)]'}`} />
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                    isActive ? 'bg-[var(--color-surface)]/20 text-white' : 'bg-[#D6E8F0] text-[var(--color-text-muted)]'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Layout Toggle (Grid / Table) */}
          <div className="flex items-center gap-2 bg-[var(--color-background)] p-1 rounded-xl border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setViewLayout('GRID')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewLayout === 'GRID' ? 'bg-[var(--color-surface)] shadow-2xs text-[var(--color-primary)]' : 'text-[#7A837C] hover:text-[var(--color-text)]'
              }`}
            >
              Grid View
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('TABLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewLayout === 'TABLE' ? 'bg-[var(--color-surface)] shadow-2xs text-[var(--color-primary)]' : 'text-[#7A837C] hover:text-[var(--color-text)]'
              }`}
            >
              Specs Table
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. FILTER & SEARCH CONTROLS BAR
         ========================================================================= */}
      <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] p-5 space-y-4 shadow-2xs">
        {/* Top Control Line: Search + Tech Type + Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-[#7A837C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SKU, model, brand, e.g. Waaree, TOPCon, BYD..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-background)] text-xs font-semibold text-[var(--color-text)] placeholder-[#7A837C] focus:bg-[var(--color-surface)] focus:border-[#1697C4] focus:outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A837C] hover:text-[var(--color-text)] p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Technology Type Filter (TOPCon, Mono PERC, LFP, etc.) */}
          <div className="lg:col-span-3">
            <div className="relative">
              <select
                value={selectedTechType}
                onChange={(e) => setSelectedTechType(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-background)] text-xs font-bold text-[var(--color-text)] focus:bg-[var(--color-surface)] focus:border-[#1697C4] focus:outline-hidden transition-all pr-8"
              >
                <option value="ALL">All Technologies (TOPCon, Mono PERC, LFP...)</option>
                {availableTechTypes.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-[#7A837C] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Tier Filter */}
          <div className="lg:col-span-2">
            <div className="relative">
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-background)] text-xs font-bold text-[var(--color-text)] focus:bg-[var(--color-surface)] focus:border-[#1697C4] focus:outline-hidden transition-all pr-8"
              >
                <option value="ALL">All Quality Tiers</option>
                <option value="Tier-1 Premium">Tier-1 Premium</option>
                <option value="Tier-1 Standard">Tier-1 Standard</option>
                <option value="Industrial Utility">Industrial Utility</option>
              </select>
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#7A837C] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="lg:col-span-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-background)] text-xs font-bold text-[var(--color-text)] focus:bg-[var(--color-surface)] focus:border-[#1697C4] focus:outline-hidden transition-all pr-8"
              >
                <option value="EFFICIENCY_DESC">Sort: Peak Efficiency (High to Low)</option>
                <option value="CAPACITY_DESC">Sort: Power / Capacity (High to Low)</option>
                <option value="WARRANTY_DESC">Sort: Warranty Term (Longest)</option>
                <option value="BRAND_ASC">Sort: Manufacturer Brand (A–Z)</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-[#7A837C] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Second Line: Brand Filter Chips + ALMM Toggle + Active Filter Reset */}
        <div className="pt-3 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand Filter Multi-Select Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#7A837C] mr-1 flex items-center gap-1">
              <span>Brands:</span>
            </span>

            {availableBrands.map((brandName) => {
              const isSelected = selectedBrands.includes(brandName);
              return (
                <button
                  key={brandName}
                  type="button"
                  onClick={() => handleToggleBrand(brandName)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-background)] text-[var(--color-text-muted)] border border-[var(--color-border-strong)] hover:border-[#1697C4] hover:text-[var(--color-text)]'
                  }`}
                >
                  {brandName}
                </button>
              );
            })}

            {selectedBrands.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedBrands([])}
                className="text-[11px] font-bold text-[var(--color-brand-brown)] hover:underline px-1.5"
              >
                Clear Brands
              </button>
            )}
          </div>

          {/* Right Side: ALMM Toggle + Reset Filters */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)] bg-[var(--color-background)] px-3 py-1.5 rounded-xl border border-[var(--color-border)] cursor-pointer hover:border-[#1697C4] transition-colors">
              <input
                type="checkbox"
                checked={almmOnly}
                onChange={(e) => setAlmmOnly(e.target.checked)}
                className="rounded accent-[#1697C4] w-4 h-4 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>ALMM List-I Only</span>
              </span>
            </label>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#BA1A1A] hover:underline flex items-center gap-1 px-2 py-1.5 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* =========================================================================
          3. PRODUCT GRID / TABLE VIEW
         ========================================================================= */}
      
      {/* Result Count Banner */}
      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] px-1">
        <div>
          Showing <span className="font-extrabold text-[var(--color-text)]">{filteredAndSortedProducts.length}</span> hardware models matching your specifications
        </div>
        {comparisonList.length > 0 && (
          <div className="text-[var(--color-primary)] font-bold">
            {comparisonList.length} of 3 items selected for side-by-side benchmark
          </div>
        )}
      </div>

      {filteredAndSortedProducts.length === 0 ? (
        /* Empty State */
        <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] p-12 text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF6EE] text-[var(--color-brand-brown)] mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-[var(--color-text)]">No hardware matches your active filter parameters</h3>
            <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto">
              Try removing brand filters, toggling off ALMM requirement, or selecting 'All Technologies' to view compatible alternatives.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleResetFilters}
            className="bg-[var(--color-primary)] text-xs font-bold"
          >
            Reset All Filters
          </Button>
        </div>
      ) : viewLayout === 'GRID' ? (
        /* --- GRID VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProducts.map((prod) => {
            const isComparing = comparisonList.includes(prod.id);
            const brand = prod.brand || prod.brandName;
            const model = prod.model || prod.modelNumber;

            return (
              <Card
                key={prod.id}
                className={`rounded-3xl border transition-all p-6 bg-[var(--color-surface)] flex flex-col justify-between space-y-5 shadow-2xs hover:shadow-md ${
                  isComparing ? 'border-[#1697C4] ring-2 ring-[#1697C4]/10' : 'border-[var(--color-border)] hover:border-[#1697C4]/50'
                }`}
              >
                <div className="space-y-4">
                  
                  {/* Category Pill & Quality Tier */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-1 rounded-md border border-[#D4E8DC]">
                        {prod.category}
                      </span>
                      {prod.almmApproved && (
                        <span className="text-[10px] font-bold text-[var(--color-brand-brown)] bg-[#FAF6EE] px-2 py-0.5 rounded border border-[#C6DEE8] flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[var(--color-brand-brown)]" />
                          <span>ALMM List-I</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-[#7A837C] shrink-0">
                      {prod.tier}
                    </span>
                  </div>

                  {/* Brand & Model Title */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[var(--color-brand-brown)] uppercase tracking-wider">
                        {brand}
                      </span>
                      {prod.sku && (
                        <span className="text-[10px] font-mono text-[#7A837C] bg-[var(--color-background)] px-2 py-0.5 rounded border border-[var(--color-border)]">
                          {prod.sku}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-[var(--color-text)] mt-1 line-clamp-1">
                      {model}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-[var(--color-primary)]">
                        {prod.technologyType}
                      </span>
                      {prod.subcategory && (
                        <span className="text-[11px] text-[#7A837C]">
                          • {prod.subcategory}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Core Parametric Metric Tiles */}
                  <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] text-xs">
                    <div>
                      <span className="text-[#7A837C] text-[10px] font-semibold block">Rated Output:</span>
                      <span className="font-extrabold text-[var(--color-text)] text-sm">{prod.capacityRating}</span>
                    </div>

                    <div>
                      <span className="text-[#7A837C] text-[10px] font-semibold block">Conversion Efficiency:</span>
                      <span className="font-extrabold text-[var(--color-primary)] text-sm">{prod.efficiencyPercentage}%</span>
                    </div>

                    {prod.temperatureCoefficient && (
                      <div>
                        <span className="text-[#7A837C] text-[10px] font-semibold block">Temp Coeff (Pmax):</span>
                        <span className="font-bold text-[var(--color-text)]">{prod.temperatureCoefficient}</span>
                      </div>
                    )}

                    {prod.bifacialityFactor && (
                      <div>
                        <span className="text-[#7A837C] text-[10px] font-semibold block">Bifacial Factor:</span>
                        <span className="font-bold text-[var(--color-text)]">{prod.bifacialityFactor}</span>
                      </div>
                    )}

                    {prod.mpptChannels && (
                      <div>
                        <span className="text-[#7A837C] text-[10px] font-semibold block">MPPT Inputs:</span>
                        <span className="font-bold text-[var(--color-text)]">{prod.mpptChannels}</span>
                      </div>
                    )}

                    {prod.bessCycleLife && (
                      <div>
                        <span className="text-[#7A837C] text-[10px] font-semibold block">Cycle Endurance:</span>
                        <span className="font-bold text-[var(--color-primary)]">{prod.bessCycleLife}+ Cycles</span>
                      </div>
                    )}

                    <div>
                      <span className="text-[#7A837C] text-[10px] font-semibold block">Product / Perf Warranty:</span>
                      <span className="font-bold text-[var(--color-text)]">
                        {prod.warrantyYears} Yrs {prod.linearWarrantyYears ? `/ ${prod.linearWarrantyYears} Yrs` : ''}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#7A837C] text-[10px] font-semibold block">Indicative Rate:</span>
                      <span className="font-extrabold text-[var(--color-brand-brown)]">{prod.priceDisplay || prod.priceEstimate}</span>
                    </div>
                  </div>

                  {/* Key Highlights Bullet points */}
                  <div className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                    {prod.keyFeatures.slice(0, 2).map((feat, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{feat}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 border-t border-[var(--color-border)] space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleComparison(prod.id)}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                        isComparing
                          ? 'bg-[var(--color-primary)] text-white border-[#1697C4]'
                          : 'bg-[var(--color-background)] text-[var(--color-text-muted)] border-[var(--color-border-strong)] hover:border-[#1697C4] hover:text-[var(--color-text)]'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>{isComparing ? 'Comparing' : 'Compare'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveDetailProduct(prod)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-[var(--color-background)] text-[var(--color-text)] border border-[var(--color-border-strong)] hover:border-[#1697C4] hover:bg-[var(--color-surface)] transition-colors flex items-center justify-center gap-1"
                      title="View full technical datasheet"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#7A837C]" />
                      <span>Datasheet</span>
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (onSelectProductForQuote) {
                        onSelectProductForQuote(prod);
                      } else if (onOpenUniversalIntake) {
                        onOpenUniversalIntake(`Solar Equipment Procurement: ${brand} ${model}`, 'solar');
                      }
                    }}
                    className="w-full bg-[var(--color-primary)] text-xs font-bold hover:bg-[#123D29]"
                    rightIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Include in Project BOQ
                  </Button>
                </div>

              </Card>
            );
          })}
        </div>
      ) : (
        /* --- SPECS TABLE VIEW --- */
        <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-background)] border-b border-[var(--color-border)] text-[#7A837C] uppercase font-bold text-[10px] tracking-wider">
                  <th className="p-4">Equipment / Model</th>
                  <th className="p-4">Category & Tech</th>
                  <th className="p-4">Rating & Output</th>
                  <th className="p-4">Peak Efficiency</th>
                  <th className="p-4">Warranty</th>
                  <th className="p-4">ALMM List-I</th>
                  <th className="p-4">Benchmark Price</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6E8F0]">
                {filteredAndSortedProducts.map((prod) => {
                  const isComparing = comparisonList.includes(prod.id);
                  const brand = prod.brand || prod.brandName;
                  const model = prod.model || prod.modelNumber;

                  return (
                    <tr key={prod.id} className="hover:bg-[var(--color-background)]/70 transition-colors">
                      <td className="p-4 font-semibold">
                        <div className="text-[10px] font-mono font-bold text-[var(--color-brand-brown)] uppercase">{brand}</div>
                        <div className="text-xs font-extrabold text-[var(--color-text)]">{model}</div>
                        {prod.sku && <div className="text-[10px] font-mono text-[#7A837C]">{prod.sku}</div>}
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-mono font-bold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2 py-0.5 rounded border border-[#D4E8DC] inline-block mb-1">
                          {prod.category}
                        </span>
                        <div className="text-xs font-medium text-[var(--color-text)]">{prod.technologyType}</div>
                      </td>
                      <td className="p-4 font-extrabold text-[var(--color-text)]">
                        {prod.capacityRating}
                      </td>
                      <td className="p-4 font-extrabold text-[var(--color-primary)]">
                        {prod.efficiencyPercentage}%
                      </td>
                      <td className="p-4 text-[var(--color-text)]">
                        {prod.warrantyYears} Yrs {prod.linearWarrantyYears ? `(${prod.linearWarrantyYears} Yrs Perf)` : ''}
                      </td>
                      <td className="p-4">
                        {prod.almmApproved ? (
                          <span className="text-[var(--color-primary)] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </span>
                        ) : (
                          <span className="text-[#7A837C]">Export / Non-ALMM</span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-[var(--color-brand-brown)]">
                        {prod.priceDisplay || prod.priceEstimate}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => toggleComparison(prod.id)}
                            className={`p-1.5 rounded-lg border text-xs ${
                              isComparing ? 'bg-[var(--color-primary)] text-white border-[#1697C4]' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border-strong)] hover:border-[#1697C4]'
                            }`}
                            title="Add to Comparison"
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              if (onSelectProductForQuote) {
                                onSelectProductForQuote(prod);
                              } else if (onOpenUniversalIntake) {
                                onOpenUniversalIntake(`Solar Hardware: ${brand} ${model}`, 'solar');
                              }
                            }}
                            className="bg-[var(--color-primary)] text-xs font-bold py-1 px-3"
                          >
                            Add to BOQ
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. FLOATING COMPARISON TRAY (When 1+ items selected)
         ========================================================================= */}
      {comparisonList.length > 0 && !isCompareModalOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#191C1A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-4 animate-bounce">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[var(--color-brand-brown)]" />
            <span className="text-xs font-bold">
              {comparisonList.length} of 3 items selected for comparison
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCompareModalOpen(true)}
              className="bg-[var(--color-primary)] text-xs font-bold hover:bg-[#123D29]"
            >
              Open Comparison Matrix
            </Button>
            <button
              onClick={() => setComparisonList([])}
              className="text-xs text-[#B7D2DE] hover:text-white underline px-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. SIDE-BY-SIDE PARAMETRIC COMPARISON MODAL
         ========================================================================= */}
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
                    BuildEcoGroup Parametric Benchmarking
                  </div>
                  <div className="text-sm font-extrabold text-[var(--color-text)]">
                    Side-by-Side Equipment Comparison ({comparedProducts.length} Selected)
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
                      <th key={p.id} className="p-3 font-extrabold text-[var(--color-text)] min-w-[220px]">
                        <div className="text-xs text-[var(--color-brand-brown)]">{p.brand || p.brandName}</div>
                        <div className="text-sm font-extrabold">{p.model || p.modelNumber}</div>
                        {p.sku && <div className="text-[10px] font-mono text-[#7A837C]">{p.sku}</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D6E8F0]">
                  <tr>
                    <td className="p-3 font-bold text-[var(--color-text-muted)] bg-[var(--color-background)]">Equipment Category</td>
                    {comparedProducts.map(p => <td key={p.id} className="p-3 font-semibold">{p.category}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[var(--color-text-muted)] bg-[var(--color-background)]">Rated Output / Capacity</td>
                    {comparedProducts.map(p => <td key={p.id} className="p-3 font-extrabold text-[var(--color-primary)]">{p.capacityRating}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[var(--color-text-muted)] bg-[var(--color-background)]">Technology / Architecture</td>
                    {comparedProducts.map(p => <td key={p.id} className="p-3">{p.technologyType}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[var(--color-text-muted)] bg-[var(--color-background)]">Conversion Efficiency</td>
                    {comparedProducts.map(p => <td key={p.id} className="p-3 font-bold text-[var(--color-primary)]">{p.efficiencyPercentage}%</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[var(--color-text-muted)] bg-[var(--color-background)]">Temperature Coefficient</td>
                    {comparedProducts.map(p => <td key={p.id} className="p-3">{p.temperatureCoefficient || 'N/A'}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[var(--color-text-muted)] bg-[var(--color-background)]">Bifaciality / DoD Life</td>
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
                    <td className="p-3 font-bold text-[var(--color-text-muted)] bg-[var(--color-background)]">ALMM List-I Approved</td>
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
                    <td className="p-3 font-bold text-[var(--color-text-muted)] bg-[var(--color-background)]">Indicative Rate Benchmark</td>
                    {comparedProducts.map(p => <td key={p.id} className="p-3 font-bold text-[var(--color-brand-brown)]">{p.priceDisplay || p.priceEstimate}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[var(--color-background)] border-t border-[var(--color-border)] flex items-center justify-between">
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

      {/* =========================================================================
          6. DETAILED DATASHEET SPECIFICATION MODAL
         ========================================================================= */}
      {activeDetailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div 
            className="relative w-full max-w-2xl bg-[var(--color-surface)] rounded-3xl shadow-2xl border border-[var(--color-border)] overflow-hidden my-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-background)] border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-brown)]">
                    Technical Datasheet Breakdown
                  </div>
                  <div className="text-sm font-extrabold text-[var(--color-text)]">
                    {activeDetailProduct.brand || activeDetailProduct.brandName} • {activeDetailProduct.model || activeDetailProduct.modelNumber}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setActiveDetailProduct(null)}
                className="p-1.5 text-[#7A837C] hover:text-[var(--color-text)] hover:bg-[#D6E8F0]/50 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs">
              
              {/* Summary paragraph */}
              <div className="p-4 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] text-[var(--color-text-secondary)] leading-relaxed">
                {activeDetailProduct.datasheetSummary}
              </div>

              {/* Parametric Specs Grid */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-[var(--color-text)] uppercase tracking-wider text-[11px]">
                  Electrical & Mechanical Specifications
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
                  <div>
                    <span className="text-[#7A837C] text-[10px] block">Rated Power:</span>
                    <span className="font-extrabold text-[var(--color-text)]">{activeDetailProduct.capacityRating}</span>
                  </div>
                  <div>
                    <span className="text-[#7A837C] text-[10px] block">Efficiency:</span>
                    <span className="font-extrabold text-[var(--color-primary)]">{activeDetailProduct.efficiencyPercentage}%</span>
                  </div>
                  <div>
                    <span className="text-[#7A837C] text-[10px] block">Cell Technology:</span>
                    <span className="font-bold text-[var(--color-text)]">{activeDetailProduct.technologyType}</span>
                  </div>
                  <div>
                    <span className="text-[#7A837C] text-[10px] block">Product Warranty:</span>
                    <span className="font-bold text-[var(--color-text)]">{activeDetailProduct.warrantyYears} Years</span>
                  </div>
                  {activeDetailProduct.linearWarrantyYears && (
                    <div>
                      <span className="text-[#7A837C] text-[10px] block">Performance Warranty:</span>
                      <span className="font-bold text-[var(--color-text)]">{activeDetailProduct.linearWarrantyYears} Years</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[#7A837C] text-[10px] block">Origin / ALMM:</span>
                    <span className="font-bold text-[var(--color-text)]">{activeDetailProduct.countryOfOrigin}</span>
                  </div>
                </div>
              </div>

              {/* Detailed Specs Map if present */}
              {activeDetailProduct.specifications && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[var(--color-text)] uppercase tracking-wider text-[11px]">
                    Detailed Engineering Parameters
                  </h4>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)]">
                    {Object.entries(activeDetailProduct.specifications).map(([key, val]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-[#7A837C] text-[10px] uppercase font-mono">{key}</span>
                        <span className="font-bold text-[var(--color-text)]">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features Bullet points */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-[var(--color-text)] uppercase tracking-wider text-[11px]">
                  Engineered Advantages & Certifications
                </h4>
                <div className="space-y-1.5">
                  {activeDetailProduct.keyFeatures.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                      <span className="text-[var(--color-text-secondary)]">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-[var(--color-background)] border-t border-[var(--color-border)] flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveDetailProduct(null)}
                className="text-xs"
              >
                Close
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (onSelectProductForQuote) {
                    onSelectProductForQuote(activeDetailProduct);
                  } else if (onOpenUniversalIntake) {
                    onOpenUniversalIntake(`Solar Hardware Quotation: ${activeDetailProduct.brand || activeDetailProduct.brandName} ${activeDetailProduct.model || activeDetailProduct.modelNumber}`, 'solar');
                  }
                  setActiveDetailProduct(null);
                }}
                className="bg-[var(--color-primary)] text-xs font-bold"
              >
                Select for Project BOQ
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
