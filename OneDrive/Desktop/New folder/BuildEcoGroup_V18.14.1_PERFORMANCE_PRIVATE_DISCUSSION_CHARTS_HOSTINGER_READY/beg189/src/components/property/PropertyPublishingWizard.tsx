import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Image as ImageIcon, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  X, 
  Plus, 
  Sparkles, 
  FileText, 
  LocateFixed, 
  Eye, 
  Info,
  DollarSign,
  Maximize2,
  Lock,
  Layers,
  Video,
  Check,
  Compass,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { 
  ListingPurpose, 
  PropertyCategory, 
  PropertySubtype, 
  FurnishingStatus, 
  ImageCategoryTag, 
  PropertyMediaItem, 
  PropertyListing 
} from '../../types/property';

interface PropertyPublishingWizardProps {
  onClose: () => void;
  onPublishSuccess: (newListing: PropertyListing) => void;
}

const SAMPLE_DEFAULT_IMAGES: PropertyMediaItem[] = [
  {
    id: 'wiz-img-1',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    name: 'Front_Elevation.jpg',
    categoryTag: 'Exterior',
    isCover: true,
    sizeBytes: 2450000
  },
  {
    id: 'wiz-img-2',
    url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    name: 'Living_Hall.jpg',
    categoryTag: 'Living Room',
    isCover: false,
    sizeBytes: 1980000
  }
];

export const PropertyPublishingWizard: React.FC<PropertyPublishingWizardProps> = ({
  onClose,
  onPublishSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  // --- Step 1: Basic Info & Transaction Type ---
  const [purpose, setPurpose] = useState<ListingPurpose>('SELL');
  const [category, setCategory] = useState<PropertyCategory>('RESIDENTIAL');
  const [subtype, setSubtype] = useState<PropertySubtype>('Apartment / Flat');
  const [title, setTitle] = useState<string>('Luxury 3BHK Eco-Smart High-Rise Apartment');
  const [tagline, setTagline] = useState<string>('Sunlit corner unit with panoramic green views & Italian modular kitchen');
  const [price, setPrice] = useState<number>(12500000); // 1.25 Cr
  const [monthlyRent, setMonthlyRent] = useState<number>(45000);
  const [maintenanceDeposit, setMaintenanceDeposit] = useState<number>(90000);
  const [superBuiltupAreaSqFt, setSuperBuiltupAreaSqFt] = useState<number>(1950);
  const [carpetAreaSqFt, setCarpetAreaSqFt] = useState<number>(1580);
  const [plotAreaSqYards, setPlotAreaSqYards] = useState<number>(200);
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(3);
  const [balconies, setBalconies] = useState<number>(2);
  const [furnishing, setFurnishing] = useState<FurnishingStatus>('FULLY_FURNISHED');
  const [floorNumber, setFloorNumber] = useState<number>(7);
  const [totalFloors, setTotalFloors] = useState<number>(16);
  const [facing, setFacing] = useState<'NORTH' | 'EAST' | 'NORTH_EAST' | 'SOUTH' | 'WEST'>('NORTH_EAST');
  const [availableFrom, setAvailableFrom] = useState<string>('Immediate');
  const [description, setDescription] = useState<string>(
    'Masterfully crafted bioclimatic apartment featuring double-glazed acoustic windows, automated smart lighting, VRV energy-efficient climate control, and high-speed fiber internet infrastructure. Gated society with 24/7 power backup and clubhouse.'
  );

  // --- Step 2: Location & Geotagging ---
  const [houseOrPlotNo, setHouseOrPlotNo] = useState<string>('Flat 702, Tower Cypress');
  const [street, setStreet] = useState<string>('Amar Shaheed Path Corridor');
  const [landmark, setLandmark] = useState<string>('Near Phoenix Palassio Mall & Ekana Stadium');
  const [locality, setLocality] = useState<string>('Gomti Nagar Extension');
  const [city, setCity] = useState<string>('Lucknow');
  const [state, setState] = useState<string>('Uttar Pradesh');
  const [pincode, setPincode] = useState<string>('226010');
  const [lat, setLat] = useState<number>(26.8393);
  const [lng, setLng] = useState<number>(80.9998);
  const [microMarketTags, setMicroMarketTags] = useState<string[]>([
    'Near Metro Station',
    'Highway Facing',
    'Gated Township',
    'IT Corridor'
  ]);
  const [newTagInput, setNewTagInput] = useState<string>('');

  // --- Step 3: Media & Photo Uploader ---
  const [mediaList, setMediaList] = useState<PropertyMediaItem[]>(SAMPLE_DEFAULT_IMAGES);
  const [videoTourUrl, setVideoTourUrl] = useState<string>('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [virtualTour360Url, setVirtualTour360Url] = useState<string>('');
  const [dragOver, setDragOver] = useState<boolean>(false);

  // --- Step 4: Amenities & Legal Status ---
  const [amenities, setAmenities] = useState({
    powerBackup247: true,
    gatedSecurity: true,
    waterSupply247: true,
    passengerGoodsLift: true,
    reservedParking: true,
    solarRooftopEquipped: true,
    waterRecyclingETP: true,
    cctvSurveillance: true,
    fireFightingSystem: true,
    evChargingStation: true,
    clubhouseGym: true
  });

  const [legal, setLegal] = useState({
    isReraRegistered: true,
    reraNumber: 'UPRERAPRJ99201/2024',
    isFreeholdClearTitle: true,
    isEncumbranceFree: true,
    zoningClassification: 'RESIDENTIAL' as const,
    farFsiPermissible: '2.5 FSI'
  });

  // Owner Info
  const [ownerName, setOwnerName] = useState<string>('Er. Alok Srivastava');
  const [ownerPhone, setOwnerPhone] = useState<string>('+91 94150 88990');
  const [isNriRemoteOwner, setIsNriRemoteOwner] = useState<boolean>(false);
  const [isPmsManaged, setIsPmsManaged] = useState<boolean>(true);

  // Helper: Geolocation Auto-detect
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationNotice(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(parseFloat(pos.coords.latitude.toFixed(5)));
        setLng(parseFloat(pos.coords.longitude.toFixed(5)));
        setIsLocating(false);
        setLocationNotice('Coordinates captured successfully from device GPS!');
      },
      (err) => {
        setIsLocating(false);
        setLocationNotice('Could not retrieve GPS coordinates. Defaulting to regional hub coordinates.');
      },
      { timeout: 8000 }
    );
  };

  // Helper: Add Custom Micro Market Tag
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    if (!microMarketTags.includes(newTagInput.trim())) {
      setMicroMarketTags([...microMarketTags, newTagInput.trim()]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setMicroMarketTags(microMarketTags.filter(t => t !== tagToRemove));
  };

  // Helper: File Upload Simulator
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: PropertyMediaItem[] = [];

    Array.from(files).forEach((file, index) => {
      const isFirst = mediaList.length === 0 && index === 0;
      const fakeUrl = URL.createObjectURL(file);
      newItems.push({
        id: `wiz-img-${Date.now()}-${index}`,
        url: fakeUrl,
        name: file.name,
        categoryTag: index % 2 === 0 ? 'Interior' : 'Exterior',
        isCover: isFirst,
        sizeBytes: file.size
      });
    });

    setMediaList([...mediaList, ...newItems]);
  };

  const handleSetCoverPhoto = (id: string) => {
    setMediaList(mediaList.map(img => ({
      ...img,
      isCover: img.id === id
    })));
  };

  const handleSetCategoryTag = (id: string, tag: ImageCategoryTag) => {
    setMediaList(mediaList.map(img => img.id === id ? { ...img, categoryTag: tag } : img));
  };

  const handleRemoveImage = (id: string) => {
    setMediaList(mediaList.filter(img => img.id !== id));
  };

  // Publish / Submit Handler
  const handleFinalPublish = (status: 'ACTIVE' | 'DRAFT') => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      const newListing: PropertyListing = {
        id: `prop-custom-${Date.now()}`,
        sku: `BEG-${city.substring(0, 3).toUpperCase()}-${category.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        title: title || 'Premium Real Estate Asset',
        tagline: tagline || 'Verified Title & High-Yield Asset',
        description: description,
        purpose,
        category,
        subtype,
        price: (purpose === 'SELL' || purpose === 'JV') ? price : undefined,
        priceDisplay: (purpose === 'SELL' || purpose === 'JV') ? `₹${(price / 10000000).toFixed(2)} Cr` : undefined,
        monthlyRent: (purpose === 'RENT' || purpose === 'PMS') ? monthlyRent : undefined,
        monthlyRentDisplay: (purpose === 'RENT' || purpose === 'PMS') ? `₹${monthlyRent.toLocaleString('en-IN')} / mo` : undefined,
        maintenanceDeposit,
        pricePerSqFt: superBuiltupAreaSqFt > 0 && price ? Math.round(price / superBuiltupAreaSqFt) : undefined,
        superBuiltupAreaSqFt,
        carpetAreaSqFt,
        plotAreaSqYards,
        bedrooms: category === 'RESIDENTIAL' ? bedrooms : undefined,
        bathrooms: category === 'RESIDENTIAL' ? bathrooms : undefined,
        balconies: category === 'RESIDENTIAL' ? balconies : undefined,
        furnishing,
        floorNumber,
        totalFloors,
        facing,
        availableFrom,
        images: mediaList.length > 0 ? mediaList : SAMPLE_DEFAULT_IMAGES,
        videoTourUrl,
        virtualTour360Url,
        location: {
          lat,
          lng,
          houseOrPlotNo,
          street,
          landmark,
          locality,
          city,
          state,
          pincode,
          microMarketTags
        },
        amenities,
        legal,
        rentalYieldPct: purpose === 'RENT' ? 7.2 : 8.5,
        expectedRoi5YrPct: 16.4,
        ownerId: `usr-owner-${Date.now()}`,
        ownerName,
        ownerPhone,
        isNriRemoteOwner,
        isPmsManaged,
        status,
        viewsCount: 1,
        leadsCount: 0,
        publishedAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };

      setIsSubmitting(false);
      onPublishSuccess(newListing);
    }, 800);
  };

  const stepsList = [
    { num: 1, label: 'Basic Info & Type' },
    { num: 2, label: 'Location & Geotag' },
    { num: 3, label: 'Media & Virtual Tour' },
    { num: 4, label: 'Amenities & RERA' },
    { num: 5, label: 'Review & Publish' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#0F172A]/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-[var(--color-surface)] rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Wizard Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0F172A] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#10B981] text-slate-950 flex items-center justify-center font-extrabold shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#10B981] font-bold">
                  Property Publishing Wizard
                </span>
                <span className="text-[10px] bg-[var(--color-surface)]/10 px-2 py-0.5 rounded text-slate-200">
                  Step {currentStep} of 5
                </span>
              </div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                List Your Property on BuildEcoGroup PropTech
              </h2>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-[var(--color-surface)]/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-6 py-3 shrink-0">
          <div className="flex items-center justify-between max-w-2xl mx-auto overflow-x-auto gap-2">
            {stepsList.map((st) => {
              const isDone = currentStep > st.num;
              const isCurrent = currentStep === st.num;
              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => setCurrentStep(st.num)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isCurrent
                      ? 'bg-[#0F172A] text-white shadow-xs'
                      : isDone
                      ? 'bg-[#EBF7F2] text-[#10B981] hover:bg-[#D4EFE5]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-[#10B981] text-slate-950'
                      : isDone
                      ? 'bg-[#10B981] text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isDone ? <Check className="w-3 h-3" /> : st.num}
                  </span>
                  <span className="hidden sm:inline">{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* =========================================================================
              STEP 1: BASIC INFO & TRANSACTION TYPE
             ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Step 1: Listing Purpose & Category
                </h3>
                <p className="text-xs text-slate-500">
                  Specify whether you are selling, renting, placing under remote PMS management, or seeking a landowner JV.
                </p>
              </div>

              {/* 1. Purpose Selector Pills */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Transaction Purpose *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'SELL', label: 'Sell Outright', desc: 'Find verified buyers & investors' },
                    { id: 'RENT', label: 'Rent / Lease', desc: 'Secure high-quality tenants' },
                    { id: 'PMS', label: 'PMS Onboarding', desc: 'End-to-end NRI / remote management' },
                    { id: 'JV', label: 'Landowner JV', desc: 'Revenue share & plot monetization' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPurpose(item.id as ListingPurpose)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        purpose === item.id
                          ? 'border-[#10B981] bg-[#F0FDF4] ring-2 ring-[#10B981]/20'
                          : 'border-slate-200 bg-[var(--color-surface)] hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-extrabold ${purpose === item.id ? 'text-[#065F46]' : 'text-slate-900'}`}>
                          {item.label}
                        </span>
                        {purpose === item.id && <CheckCircle2 className="w-4 h-4 text-[#10B981]" />}
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-1 leading-tight">
                        {item.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Category & Subtype */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Property Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const newCat = e.target.value as PropertyCategory;
                      setCategory(newCat);
                      if (newCat === 'RESIDENTIAL') setSubtype('Apartment / Flat');
                      else if (newCat === 'COMMERCIAL') setSubtype('Grade-A Office');
                      else if (newCat === 'INDUSTRIAL') setSubtype('Industrial Warehouse');
                      else setSubtype('Commercial Land / Highway Plot');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                  >
                    <option value="RESIDENTIAL">Residential (Apartment, Villa, Floor)</option>
                    <option value="COMMERCIAL">Commercial (Office, Retail, SCO)</option>
                    <option value="INDUSTRIAL">Industrial (Warehouse, Factory Plot)</option>
                    <option value="LAND_PLOT">Land / Plot (Open Land, Agricultural, JV)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Specific Subtype *
                  </label>
                  <select
                    value={subtype}
                    onChange={(e) => setSubtype(e.target.value as PropertySubtype)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                  >
                    {category === 'RESIDENTIAL' && (
                      <>
                        <option value="Apartment / Flat">Apartment / High-Rise Flat</option>
                        <option value="Luxury Villa">Luxury Independent Villa</option>
                        <option value="Independent Floor">Builder / Independent Floor</option>
                        <option value="Penthouse">Sky Penthouse</option>
                      </>
                    )}
                    {category === 'COMMERCIAL' && (
                      <>
                        <option value="Grade-A Office">Grade-A Corporate Office</option>
                        <option value="Retail Shop / Showroom">High-Street Retail / Showroom</option>
                        <option value="Coworking / Managed Office">Coworking / Managed Office</option>
                        <option value="Commercial SCO Plot">Commercial SCO Plot</option>
                      </>
                    )}
                    {category === 'INDUSTRIAL' && (
                      <>
                        <option value="Industrial Warehouse">Industrial Warehouse / Logistics</option>
                        <option value="Open Industrial Plot">Open Industrial Plot</option>
                      </>
                    )}
                    {category === 'LAND_PLOT' && (
                      <>
                        <option value="Commercial Land / Highway Plot">Commercial Land / Highway Frontage</option>
                        <option value="Agricultural / Farm Land">Agricultural / Farm Land</option>
                        <option value="Open Industrial Plot">Open Industrial Land</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* 3. Title & Tagline */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Listing Headline / Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Fully Furnished 3BHK Apartment in Gomti Nagar Extension"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    High-Converting Subtitle / Highlight Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Pre-leased with 9% Net Rental Yield • Clear Freehold Title"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* 4. Financials & Commercials */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase">
                  <DollarSign className="w-4 h-4 text-[#10B981]" />
                  <span>Commercials & Expected Returns</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(purpose === 'SELL' || purpose === 'JV') && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Expected Sale Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[var(--color-surface)] text-xs font-bold text-slate-900 focus:border-[#10B981] focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        ≈ ₹{(price / 10000000).toFixed(2)} Crores
                      </span>
                    </div>
                  )}

                  {(purpose === 'RENT' || purpose === 'PMS') && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Expected Monthly Rent (₹) *
                      </label>
                      <input
                        type="number"
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[var(--color-surface)] text-xs font-bold text-slate-900 focus:border-[#10B981] focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        ₹{monthlyRent.toLocaleString('en-IN')} / month
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Maintenance / Security Deposit (₹)
                    </label>
                    <input
                      type="number"
                      value={maintenanceDeposit}
                      onChange={(e) => setMaintenanceDeposit(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[var(--color-surface)] text-xs font-bold text-slate-900 focus:border-[#10B981] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Availability Timeline
                    </label>
                    <input
                      type="text"
                      value={availableFrom}
                      onChange={(e) => setAvailableFrom(e.target.value)}
                      placeholder="e.g. Immediate, 1st Oct 2026"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[var(--color-surface)] text-xs font-semibold text-slate-900 focus:border-[#10B981] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Physical Dimensions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Super Built-up Area (Sq Ft) *
                  </label>
                  <input
                    type="number"
                    value={superBuiltupAreaSqFt}
                    onChange={(e) => setSuperBuiltupAreaSqFt(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Carpet Area (Sq Ft)
                  </label>
                  <input
                    type="number"
                    value={carpetAreaSqFt}
                    onChange={(e) => setCarpetAreaSqFt(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                  />
                </div>

                {category === 'RESIDENTIAL' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Bedrooms
                      </label>
                      <select
                        value={bedrooms}
                        onChange={(e) => setBedrooms(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                      >
                        <option value={1}>1 BHK / Studio</option>
                        <option value={2}>2 BHK</option>
                        <option value={3}>3 BHK</option>
                        <option value={4}>4 BHK</option>
                        <option value={5}>5+ BHK / Penthouse</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Bathrooms
                      </label>
                      <select
                        value={bathrooms}
                        onChange={(e) => setBathrooms(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                      >
                        <option value={1}>1 Bathroom</option>
                        <option value={2}>2 Bathrooms</option>
                        <option value={3}>3 Bathrooms</option>
                        <option value={4}>4+ Bathrooms</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Furnishing Status
                  </label>
                  <select
                    value={furnishing}
                    onChange={(e) => setFurnishing(e.target.value as FurnishingStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                  >
                    <option value="FULLY_FURNISHED">Fully Furnished</option>
                    <option value="SEMI_FURNISHED">Semi Furnished</option>
                    <option value="UNFURNISHED">Unfurnished</option>
                    <option value="BARE_SHELL">Bare Shell (Warm/Cold)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Facing Direction
                  </label>
                  <select
                    value={facing}
                    onChange={(e) => setFacing(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                  >
                    <option value="NORTH_EAST">North-East (Ishan - Auspicious)</option>
                    <option value="EAST">East Facing</option>
                    <option value="NORTH">North Facing</option>
                    <option value="WEST">West Facing</option>
                    <option value="SOUTH">South Facing</option>
                  </select>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              STEP 2: LOCATION & GEOTAGGING
             ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Step 2: Location, Geotagging & Micro-Market Tags
                </h3>
                <p className="text-xs text-slate-500">
                  Accurate geotagging ensures your property appears in buyer map radius searches and GIS spatial zoning audits.
                </p>
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    House / Plot / Unit No. *
                  </label>
                  <input
                    type="text"
                    value={houseOrPlotNo}
                    onChange={(e) => setHouseOrPlotNo(e.target.value)}
                    placeholder="e.g. Villa 14 / Flat 702, Tower Cypress"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Street / Road / Sector *
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. Amar Shaheed Path Corridor"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Prominent Landmark
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Opposite Ekana International Cricket Stadium"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Locality / Sector Name *
                  </label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Gomti Nagar Extension"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                  >
                    <option value="Lucknow">Lucknow, UP</option>
                    <option value="Noida">Noida / Greater Noida, UP</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Gorakhpur">Gorakhpur, UP</option>
                    <option value="Varanasi">Varanasi, UP</option>
                    <option value="Kanpur">Kanpur, UP</option>
                    <option value="Bengaluru">Bengaluru, KA</option>
                    <option value="Pune">Pune, MH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 226010"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Interactive Map Picker & GPS Geolocation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#10B981]" />
                      <span>GPS Coordinates & Map Marker Pin</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Latitude: {lat} • Longitude: {lng}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="text-xs border-slate-300 text-slate-800 hover:border-[#10B981]"
                    leftIcon={<LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-[#10B981]' : 'text-[#10B981]'}`} />}
                  >
                    {isLocating ? 'Detecting GPS...' : 'Detect My Location'}
                  </Button>
                </div>

                {locationNotice && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>{locationNotice}</span>
                  </div>
                )}

                {/* Visual Map Canvas Mock with interactive pin representation */}
                <div className="relative h-44 rounded-2xl bg-slate-800 overflow-hidden border border-slate-300 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1200&q=80"
                    alt="Satellite Map Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />

                  {/* Pulsing Pin Marker */}
                  <div className="relative z-10 flex flex-col items-center animate-bounce">
                    <div className="bg-[#10B981] text-slate-950 px-3 py-1 rounded-full text-[10px] font-extrabold shadow-lg flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{locality}, {city}</span>
                    </div>
                    <div className="w-3 h-3 bg-[#10B981] rotate-45 -mt-1.5 shadow-md" />
                  </div>

                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-white/80 font-mono">
                    <span>Lat: {lat}° N, Lng: {lng}° E</span>
                    <span>OpenStreetMap / GIS Georeferenced</span>
                  </div>
                </div>
              </div>

              {/* Micro-Market & Neighborhood Tags */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Micro-Market / Neighborhood Highlights
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {microMarketTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-1.5"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 max-w-md pt-1">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    placeholder="Add custom tag (e.g. 'Near Metro', 'Corner Plot')"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                    className="text-xs"
                  >
                    Add Tag
                  </Button>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              STEP 3: MEDIA & PHOTO UPLOADER (DRAG-AND-DROP)
             ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Step 3: Multi-Media & Virtual Tour Uploader
                </h3>
                <p className="text-xs text-slate-500">
                  Upload high-resolution property photography, CAD floorplans, and drone aerials. Tag each image category for maximum buyer conversion.
                </p>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFileUpload(e.dataTransfer.files);
                }}
                className={`p-8 rounded-3xl border-2 border-dashed text-center transition-all ${
                  dragOver
                    ? 'border-[#10B981] bg-[#F0FDF4]'
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100/60'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-surface)] text-[#10B981] shadow-xs mx-auto flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Drag & Drop Property Photos or Floor Plans
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Supports PNG, JPG, WEBP formats up to 10MB each. Instant preview thumbnails generated.
                </p>

                <div className="mt-4">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-slate-800 cursor-pointer shadow-xs">
                    <Plus className="w-4 h-4 text-[#10B981]" />
                    <span>Browse Files from Device</span>
                    <input
                      type="file"
                      multiple
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                  </label>
                </div>
              </div>

              {/* Uploaded Photos Thumbnails & Categorization */}
              {mediaList.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Uploaded Media ({mediaList.length} items)</span>
                    <span className="text-slate-500 font-normal">Click 'Set Cover' to pick the main thumbnail</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {mediaList.map((media) => (
                      <div
                        key={media.id}
                        className={`p-3 rounded-2xl border bg-[var(--color-surface)] flex flex-col justify-between space-y-2 relative transition-all ${
                          media.isCover ? 'border-[#10B981] ring-2 ring-[#10B981]/20' : 'border-slate-200'
                        }`}
                      >
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100">
                          <img
                            src={media.url}
                            alt={media.name}
                            className="w-full h-full object-cover"
                          />
                          {media.isCover && (
                            <span className="absolute top-2 left-2 bg-[#10B981] text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded shadow-sm">
                              ★ Primary Cover
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(media.id)}
                            className="absolute top-2 right-2 p-1 bg-black/60 text-white hover:bg-red-600 rounded-lg transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                              {media.name}
                            </span>
                            {!media.isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverPhoto(media.id)}
                                className="text-[10px] font-bold text-[#065F46] hover:underline"
                              >
                                Set as Cover
                              </button>
                            )}
                          </div>

                          {/* Category Tag Selector */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-500 font-bold">Tag:</span>
                            <select
                              value={media.categoryTag}
                              onChange={(e) => handleSetCategoryTag(media.id, e.target.value as ImageCategoryTag)}
                              className="flex-1 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-800 focus:bg-[var(--color-surface)] focus:outline-hidden"
                            >
                              <option value="Exterior">Exterior</option>
                              <option value="Interior">Interior</option>
                              <option value="Floor Plan">Floor Plan</option>
                              <option value="Master Bedroom">Master Bedroom</option>
                              <option value="Living Room">Living Room</option>
                              <option value="Kitchen">Kitchen</option>
                              <option value="Drone View">Drone View</option>
                              <option value="Site Map">Site Map</option>
                            </select>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Tour & 360 Matterport Virtual Tour Link */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase">
                  <Video className="w-4 h-4 text-[#10B981]" />
                  <span>Video Tour & 360° Walkthrough Links</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      YouTube / Vimeo Walkthrough URL
                    </label>
                    <input
                      type="url"
                      value={videoTourUrl}
                      onChange={(e) => setVideoTourUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[var(--color-surface)] text-xs text-slate-900 focus:border-[#10B981] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Matterport / 360° VR Tour Link
                    </label>
                    <input
                      type="url"
                      value={virtualTour360Url}
                      onChange={(e) => setVirtualTour360Url(e.target.value)}
                      placeholder="https://my.matterport.com/show/?m=..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[var(--color-surface)] text-xs text-slate-900 focus:border-[#10B981] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              STEP 4: AMENITIES & LEGAL STATUS
             ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Step 4: Amenities, Infrastructure & RERA Legal Status
                </h3>
                <p className="text-xs text-slate-500">
                  Highlight verified sustainable features, 24/7 infrastructure, and statutory approvals to build tenant and buyer confidence.
                </p>
              </div>

              {/* Amenities Checkboxes */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Amenities & Infrastructure Features
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { key: 'powerBackup247', label: '24/7 DG Power Backup' },
                    { key: 'gatedSecurity', label: 'Gated Security & Guard' },
                    { key: 'waterSupply247', label: '24/7 Dual Water Supply' },
                    { key: 'passengerGoodsLift', label: 'Passenger & Goods Lift' },
                    { key: 'reservedParking', label: 'Covered Reserved Parking' },
                    { key: 'solarRooftopEquipped', label: 'Solar Rooftop Equipped' },
                    { key: 'waterRecyclingETP', label: 'ETP & Rainwater Recharge' },
                    { key: 'cctvSurveillance', label: 'Full CCTV Surveillance' },
                    { key: 'fireFightingSystem', label: 'Hydrant Fire Safety' },
                    { key: 'evChargingStation', label: 'EV Charging Station' },
                    { key: 'clubhouseGym', label: 'Clubhouse & Gymnasium' },
                  ].map((amenity) => {
                    const isChecked = (amenities as any)[amenity.key];
                    return (
                      <label
                        key={amenity.key}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-[#F0FDF4] border-[#10B981] text-[#065F46]'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => setAmenities({ ...amenities, [amenity.key]: e.target.checked })}
                          className="rounded accent-[#10B981] w-4 h-4 cursor-pointer"
                        />
                        <span>{amenity.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Legal & Regulatory Compliance */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  <span>Title & Statutory Approvals</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={legal.isReraRegistered}
                        onChange={(e) => setLegal({ ...legal, isReraRegistered: e.target.checked })}
                        className="rounded accent-[#10B981] w-4 h-4 cursor-pointer"
                      />
                      <span>RERA Registered Project / Agent</span>
                    </label>

                    {legal.isReraRegistered && (
                      <input
                        type="text"
                        value={legal.reraNumber}
                        onChange={(e) => setLegal({ ...legal, reraNumber: e.target.value })}
                        placeholder="Enter RERA Registration Number (e.g. UPRERAPRJ...)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[var(--color-surface)] text-xs font-mono font-bold text-slate-900 focus:border-[#10B981] focus:outline-hidden"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={legal.isFreeholdClearTitle}
                        onChange={(e) => setLegal({ ...legal, isFreeholdClearTitle: e.target.checked })}
                        className="rounded accent-[#10B981] w-4 h-4 cursor-pointer"
                      />
                      <span>Freehold & Clear Title (100% Marketable)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={legal.isEncumbranceFree}
                        onChange={(e) => setLegal({ ...legal, isEncumbranceFree: e.target.checked })}
                        className="rounded accent-[#10B981] w-4 h-4 cursor-pointer"
                      />
                      <span>Encumbrance-Free Certificate Available</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Owner / Contact Details */}
              <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-slate-200 space-y-3">
                <div className="text-xs font-extrabold text-slate-900 uppercase">
                  Owner / Representative Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Owner Full Name *
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Contact Phone / WhatsApp *
                    </label>
                    <input
                      type="text"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNriRemoteOwner}
                      onChange={(e) => setIsNriRemoteOwner(e.target.checked)}
                      className="rounded accent-[#10B981] w-4 h-4 cursor-pointer"
                    />
                    <span>I am an NRI / Remote Owner living outside the city</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPmsManaged}
                      onChange={(e) => setIsPmsManaged(e.target.checked)}
                      className="rounded accent-[#10B981] w-4 h-4 cursor-pointer"
                    />
                    <span>Enroll this listing under BuildEcoGroup Full-Stack PMS</span>
                  </label>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              STEP 5: REVIEW & PUBLISH
             ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Step 5: Live Listing Preview & Publishing
                </h3>
                <p className="text-xs text-slate-500">
                  Review your public listing card before publishing to the live PropTech marketplace.
                </p>
              </div>

              {/* Live Preview Card */}
              <div className="max-w-xl mx-auto">
                <Card className="rounded-3xl border border-slate-200 overflow-hidden shadow-lg bg-[var(--color-surface)]">
                  
                  {/* Photo Banner */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={mediaList[0]?.url || SAMPLE_DEFAULT_IMAGES[0].url}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-950 bg-[#10B981] px-2.5 py-1 rounded-md shadow-xs">
                        {purpose}
                      </span>
                      <span className="text-[10px] font-bold text-white bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded">
                        {subtype}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white drop-shadow-md">
                      <div className="text-lg font-black">
                        {(purpose === 'SELL' || purpose === 'JV') ? `₹${(price / 10000000).toFixed(2)} Cr` : `₹${monthlyRent.toLocaleString('en-IN')} / mo`}
                      </div>
                      <div className="text-xs font-semibold bg-black/50 px-2 py-1 rounded-lg backdrop-blur-xs">
                        {superBuiltupAreaSqFt} sq ft
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>{locality}, {city}</span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                      {title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {tagline}
                    </p>

                    {/* Micro-market tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {microMarketTags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Legal Check Badges */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 text-[#065F46] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>RERA & Title Clear</span>
                      </div>
                      <span className="text-slate-500">
                        Owner: {ownerName.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                </Card>
              </div>

              {/* Publishing Options Notice */}
              <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#10B981]/30 text-xs text-[#065F46] flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-extrabold text-slate-900">
                    Instant Marketplace Syndication
                  </div>
                  <p className="text-slate-600">
                    Publishing now activates your live URL, initiates algorithmic buyer matching, and opens your real-time Inquiry Management Dashboard.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <div>
            {currentStep > 1 ? (
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="text-xs font-bold"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            ) : (
              <Button
                variant="outline"
                size="md"
                onClick={onClose}
                className="text-xs font-bold text-slate-600"
              >
                Cancel
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < 5 ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold"
                rightIcon={<ArrowRight className="w-4 h-4 text-[#10B981]" />}
              >
                Continue to Step {currentStep + 1}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleFinalPublish('DRAFT')}
                  disabled={isSubmitting}
                  className="text-xs font-bold border-slate-300"
                >
                  Save as Draft
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleFinalPublish('ACTIVE')}
                  disabled={isSubmitting}
                  className="bg-[#10B981] hover:bg-[#0EA5E9] text-slate-950 font-extrabold text-xs shadow-md"
                  rightIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Instantly'}
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
