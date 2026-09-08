import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Building2, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Compass, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Eye, 
  X, 
  Home, 
  Briefcase, 
  Layers, 
  Trees, 
  ArrowRight, 
  Phone, 
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Map as MapIcon,
  Grid
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { 
  PropertyListing, 
  ListingPurpose, 
  PropertyCategory, 
  FurnishingStatus 
} from '../../types/property';

interface PropertyMarketplaceProps {
  listings: PropertyListing[];
  onSelectProperty: (property: PropertyListing) => void;
  onOpenPublishWizard: () => void;
  onOpenInquiryModal: (property: PropertyListing) => void;
  className?: string;
}

type SortOption = 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'YIELD_DESC' | 'AREA_DESC';
type ViewMode = 'GRID' | 'MAP';

export const PropertyMarketplace: React.FC<PropertyMarketplaceProps> = ({
  listings,
  onSelectProperty,
  onOpenPublishWizard,
  onOpenInquiryModal,
  className = ''
}) => {
  // Filters State
  const [selectedPurpose, setSelectedPurpose] = useState<ListingPurpose | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<PropertyCategory | 'ALL'>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reraOnly, setReraOnly] = useState<boolean>(false);
  const [selectedFurnishing, setSelectedFurnishing] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');
  const [viewMode, setViewMode] = useState<ViewMode>('GRID');
  const [activeMapPinId, setActiveMapPinId] = useState<string | null>(listings[0]?.id || null);

  // Filter & Sort listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Purpose Filter
      if (selectedPurpose !== 'ALL' && item.purpose !== selectedPurpose) {
        return false;
      }

      // Category Filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }

      // City Filter
      if (selectedCity !== 'ALL' && item.location.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // RERA Only Filter
      if (reraOnly && !item.legal.isReraRegistered) {
        return false;
      }

      // Furnishing Filter
      if (selectedFurnishing !== 'ALL' && item.furnishing !== selectedFurnishing) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = item.title.toLowerCase().includes(q);
        const localityMatch = item.location.locality.toLowerCase().includes(q);
        const cityMatch = item.location.city.toLowerCase().includes(q);
        const skuMatch = item.sku.toLowerCase().includes(q);
        const subtypeMatch = item.subtype.toLowerCase().includes(q);
        const tagMatch = item.location.microMarketTags.some(t => t.toLowerCase().includes(q));

        if (!titleMatch && !localityMatch && !cityMatch && !skuMatch && !subtypeMatch && !tagMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      if (sortBy === 'YIELD_DESC') {
        return (b.rentalYieldPct || 0) - (a.rentalYieldPct || 0);
      }
      if (sortBy === 'AREA_DESC') {
        return b.superBuiltupAreaSqFt - a.superBuiltupAreaSqFt;
      }
      if (sortBy === 'PRICE_ASC') {
        const pA = a.price || (a.monthlyRent ? a.monthlyRent * 12 : 0);
        const pB = b.price || (b.monthlyRent ? b.monthlyRent * 12 : 0);
        return pA - pB;
      }
      if (sortBy === 'PRICE_DESC') {
        const pA = a.price || (a.monthlyRent ? a.monthlyRent * 12 : 0);
        const pB = b.price || (b.monthlyRent ? b.monthlyRent * 12 : 0);
        return pB - pA;
      }
      return 0;
    });
  }, [listings, selectedPurpose, selectedCategory, selectedCity, reraOnly, selectedFurnishing, searchQuery, sortBy]);

  const activeMapProperty = useMemo(() => {
    return listings.find(p => p.id === activeMapPinId) || filteredListings[0] || null;
  }, [listings, activeMapPinId, filteredListings]);

  const hasActiveFilters = 
    selectedPurpose !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    selectedCity !== 'ALL' ||
    reraOnly ||
    selectedFurnishing !== 'ALL' ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setSelectedPurpose('ALL');
    setSelectedCategory('ALL');
    setSelectedCity('ALL');
    setReraOnly(false);
    setSelectedFurnishing('ALL');
    setSearchQuery('');
    setSortBy('NEWEST');
  };

  return (
    <div id="property-marketplace" className={`space-y-6 ${className}`}>
      
      {/* =========================================================================
          1. MARKETPLACE CONTROLS & FILTER BAR
         ========================================================================= */}
      <div className="bg-[var(--color-surface)] rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        
        {/* Purpose Filter Pills Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'ALL', label: 'All Properties' },
              { id: 'SELL', label: 'Buy / Sale' },
              { id: 'RENT', label: 'Rent / Lease' },
              { id: 'PMS', label: 'NRI Managed PMS' },
              { id: 'JV', label: 'Landowner JV' },
            ].map((tab) => {
              const isActive = selectedPurpose === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedPurpose(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#0F172A] text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* View Mode (Grid vs Map) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('GRID')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'GRID' ? 'bg-[var(--color-surface)] shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('MAP')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'MAP' ? 'bg-[var(--color-surface)] shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-[#10B981]" />
              <span>GIS Map</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by locality, project name, or tag..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="lg:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
            >
              <option value="ALL">All Categories (Residential, Office, Land)</option>
              <option value="RESIDENTIAL">Residential (Apartments & Villas)</option>
              <option value="COMMERCIAL">Commercial (Offices & Retail)</option>
              <option value="INDUSTRIAL">Industrial (Warehouses & Plants)</option>
              <option value="LAND_PLOT">Land / Plots (Commercial & JV)</option>
            </select>
          </div>

          {/* City Selector */}
          <div className="lg:col-span-2">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
            >
              <option value="ALL">All Cities</option>
              <option value="Lucknow">Lucknow, UP</option>
              <option value="Noida">Noida / NCR</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Gorakhpur">Gorakhpur, UP</option>
              <option value="Varanasi">Varanasi, UP</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Pune">Pune</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="lg:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
            >
              <option value="NEWEST">Sort: Newest Listed</option>
              <option value="YIELD_DESC">Sort: Highest Rental Yield %</option>
              <option value="AREA_DESC">Sort: Largest Built-up Area</option>
              <option value="PRICE_ASC">Sort: Price (Low to High)</option>
              <option value="PRICE_DESC">Sort: Price (High to Low)</option>
            </select>
          </div>

        </div>

        {/* Toggles: RERA Verified & Clear Filters */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#10B981]">
              <input
                type="checkbox"
                checked={reraOnly}
                onChange={(e) => setReraOnly(e.target.checked)}
                className="rounded accent-[#10B981] w-4 h-4 cursor-pointer"
              />
              <span className="flex items-center gap-1 text-[#065F46]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                <span>RERA Registered Only</span>
              </span>
            </label>

            <span className="text-slate-500 font-medium">
              Showing <strong className="text-slate-900 font-extrabold">{filteredListings.length}</strong> verified properties
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

      </div>

      {/* =========================================================================
          2. VIEW RENDERER (GRID vs MAP)
         ========================================================================= */}
      {filteredListings.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">No properties match your filter criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Try removing city filters or resetting the RERA toggle to explore available inventory.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleResetFilters}
            className="bg-[#0F172A] text-white text-xs font-bold"
          >
            Reset Filters
          </Button>
        </div>
      ) : viewMode === 'GRID' ? (
        
        /* --- GRID VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((prop) => {
            const coverPhoto = prop.images.find(img => img.isCover) || prop.images[0];
            const priceTag = prop.priceDisplay || prop.monthlyRentDisplay || 'Contact for Price';

            return (
              <Card
                key={prop.id}
                className="rounded-3xl border border-slate-200 overflow-hidden bg-[var(--color-surface)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-[#10B981]/50"
              >
                <div>
                  
                  {/* Photo Banner with Badges */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer" onClick={() => onSelectProperty(prop)}>
                    <img
                      src={coverPhoto?.url}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs ${
                        prop.purpose === 'SELL' ? 'bg-[#10B981] text-slate-950' :
                        prop.purpose === 'RENT' ? 'bg-sky-500 text-white' :
                        prop.purpose === 'JV' ? 'bg-amber-400 text-slate-950' :
                        'bg-purple-600 text-white'
                      }`}>
                        {prop.purpose === 'JV' ? 'LAND JV' : prop.purpose}
                      </span>
                      {prop.legal.isReraRegistered && (
                        <span className="text-[10px] font-bold text-white bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                          <span>RERA Verified</span>
                        </span>
                      )}
                    </div>

                    {/* Yield Tag on Top Right */}
                    {prop.rentalYieldPct && (
                      <div className="absolute top-3 right-3 bg-emerald-950/90 text-[#10B981] border border-[#10B981]/40 backdrop-blur-xs text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{prop.rentalYieldPct}% Net Yield</span>
                      </div>
                    )}

                    {/* Bottom Price & Area Tag */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <div>
                        <span className="text-base sm:text-lg font-black drop-shadow-md">
                          {priceTag}
                        </span>
                        {prop.pricePerSqFt && (
                          <span className="text-[10px] text-slate-300 block">
                            ₹{prop.pricePerSqFt.toLocaleString('en-IN')}/sq ft
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                          {prop.superBuiltupAreaSqFt.toLocaleString('en-IN')} sq ft
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 space-y-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#065F46] uppercase tracking-wider text-[11px]">
                        {prop.subtype}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {prop.sku}
                      </span>
                    </div>

                    <div>
                      <h3 
                        onClick={() => onSelectProperty(prop)}
                        className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-1 hover:text-[#065F46] cursor-pointer transition-colors"
                      >
                        {prop.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        <span className="truncate">{prop.location.locality}, {prop.location.city}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {prop.tagline}
                    </p>

                    {/* Micro-market Pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {prop.location.microMarketTags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Key Specs Row */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Bedrooms:</span>
                        <span className="font-bold text-slate-900">{prop.bedrooms ? `${prop.bedrooms} BHK` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Furnishing:</span>
                        <span className="font-bold text-slate-900 truncate block">{prop.furnishing.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Available:</span>
                        <span className="font-bold text-[#065F46] truncate block">{prop.availableFrom}</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Card Action Buttons */}
                <div className="p-5 pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectProperty(prop)}
                      className="flex-1 text-xs font-bold border-slate-300 text-slate-900 hover:border-[#10B981]"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      View Specs
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onOpenInquiryModal(prop)}
                      className="flex-1 bg-[#10B981] hover:bg-[#0EA5E9] text-slate-950 font-extrabold text-xs shadow-xs"
                      rightIcon={<Calendar className="w-3.5 h-3.5" />}
                    >
                      Book Visit
                    </Button>
                  </div>
                </div>

              </Card>
            );
          })}
        </div>
      ) : (
        
        /* --- INTERACTIVE GIS MAP VIEW --- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[var(--color-surface)] rounded-3xl border border-slate-200 p-6 shadow-xs">
          
          {/* Left Column: Interactive Map Canvas */}
          <div className="lg:col-span-8 relative h-[520px] rounded-2xl bg-slate-900 overflow-hidden border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1600&q=80"
              alt="Cadastral Map"
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-slate-950/40" />

            {/* Simulated Geotag Pins */}
            {filteredListings.map((p, idx) => {
              const isSelected = p.id === activeMapPinId;
              // Distribute pins visually
              const topPos = 20 + ((idx * 27) % 60);
              const leftPos = 15 + ((idx * 33) % 70);

              return (
                <div
                  key={p.id}
                  style={{ top: `${topPos}%`, left: `${leftPos}%` }}
                  onClick={() => setActiveMapPinId(p.id)}
                  className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 z-20 group transition-transform duration-200 hover:scale-110"
                >
                  <div className={`px-2.5 py-1 rounded-xl text-xs font-black shadow-xl flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-[#10B981] text-slate-950 border-white scale-110 animate-pulse ring-4 ring-[#10B981]/30'
                      : 'bg-[#0F172A] text-white border-slate-400 group-hover:border-[#10B981]'
                  }`}>
                    <MapPin className="w-3 h-3" />
                    <span>{p.priceDisplay || p.monthlyRentDisplay?.split('/')[0]}</span>
                  </div>
                  <div className={`w-2.5 h-2.5 rotate-45 mx-auto -mt-1 ${isSelected ? 'bg-[#10B981]' : 'bg-[#0F172A]'}`} />
                </div>
              );
            })}

            {/* Map Header Status */}
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white text-xs font-bold flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#10B981]" />
              <span>GIS Georeferenced Coordinates Layer</span>
            </div>
          </div>

          {/* Right Column: Selected Property Card in Map View */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            {activeMapProperty ? (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200">
                  <img
                    src={activeMapProperty.images[0]?.url}
                    alt={activeMapProperty.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-[#10B981] text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded shadow-xs">
                    {activeMapProperty.purpose}
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-mono font-bold text-[#065F46] uppercase">
                    {activeMapProperty.subtype} • {activeMapProperty.location.city}
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 line-clamp-1 mt-0.5">
                    {activeMapProperty.title}
                  </h4>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {activeMapProperty.priceDisplay || activeMapProperty.monthlyRentDisplay}
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 border-t border-slate-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Super Area:</span>
                    <span className="font-bold text-slate-800">{activeMapProperty.superBuiltupAreaSqFt} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RERA Status:</span>
                    <span className="font-bold text-[#065F46]">{activeMapProperty.legal.isReraRegistered ? 'Approved' : 'Clear Title'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GPS Coordinates:</span>
                    <span className="font-mono text-[10px] text-slate-800">{activeMapProperty.location.lat}°N, {activeMapProperty.location.lng}°E</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => onSelectProperty(activeMapProperty)}
                    className="w-full bg-[#0F172A] text-white text-xs font-bold"
                  >
                    View Full Property Dossier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenInquiryModal(activeMapProperty)}
                    className="w-full text-xs font-bold border-slate-300 text-slate-800"
                    leftIcon={<Calendar className="w-3.5 h-3.5 text-[#10B981]" />}
                  >
                    Schedule In-Person Site Visit
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Click on any map pin marker to inspect the property details.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
