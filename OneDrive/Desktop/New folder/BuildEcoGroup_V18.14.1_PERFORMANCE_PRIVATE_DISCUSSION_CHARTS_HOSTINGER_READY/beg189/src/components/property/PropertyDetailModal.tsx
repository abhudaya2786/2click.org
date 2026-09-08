import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Phone, 
  MessageSquare, 
  X, 
  TrendingUp, 
  Maximize2, 
  Compass, 
  FileText, 
  Sparkles, 
  Check, 
  Calculator, 
  DollarSign, 
  Share2, 
  Download, 
  Layers, 
  Trees, 
  Sun, 
  Zap, 
  Flame, 
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { PropertyListing } from '../../types/property';

interface PropertyDetailModalProps {
  property: PropertyListing;
  onClose: () => void;
  onSubmitInquiry: (inquiryData: {
    leadName: string;
    leadPhone: string;
    leadEmail: string;
    requestedDate: string;
    message: string;
    leadType: 'BUYER' | 'TENANT' | 'INVESTOR' | 'JV_PARTNER';
  }) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onSubmitInquiry
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'SPECS' | 'AMENITIES' | 'LOCATION' | 'LEGAL' | 'CALCULATOR'>('SPECS');

  // Inquiry Form State
  const [leadName, setLeadName] = useState<string>('');
  const [leadPhone, setLeadPhone] = useState<string>('');
  const [leadEmail, setLeadEmail] = useState<string>('');
  const [requestedDate, setRequestedDate] = useState<string>('2026-09-05 (11:00 AM)');
  const [leadType, setLeadType] = useState<'BUYER' | 'TENANT' | 'INVESTOR' | 'JV_PARTNER'>(
    property.purpose === 'RENT' || property.purpose === 'PMS' ? 'TENANT' : 'BUYER'
  );
  const [message, setMessage] = useState<string>(
    `Hi, I am interested in ${property.title} (${property.sku}). Please share the full project brochure, RERA certificate, and confirm availability for a site inspection.`
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Mini Financial Calculator State
  const [loanTenureYears, setLoanTenureYears] = useState<number>(20);
  const [interestRatePct, setInterestRatePct] = useState<number>(8.5);
  const [downpaymentPct, setDownpaymentPct] = useState<number>(20);

  const images = property.images && property.images.length > 0 ? property.images : [
    {
      id: 'default-img',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      name: 'Property View',
      categoryTag: 'Exterior' as const,
      isCover: true
    }
  ];

  // Calculated EMI for sale properties
  const propertyPrice = property.price || (property.monthlyRent ? property.monthlyRent * 120 : 5000000);
  const loanAmount = propertyPrice * (1 - downpaymentPct / 100);
  const monthlyRate = interestRatePct / 12 / 100;
  const totalMonths = loanTenureYears * 12;
  const calculatedEmi = monthlyRate > 0 && totalMonths > 0
    ? Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1))
    : 0;

  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) return;

    onSubmitInquiry({
      leadName,
      leadPhone,
      leadEmail,
      requestedDate,
      message,
      leadType
    });

    setIsSubmitted(true);
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#0F172A]/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-5xl bg-[var(--color-surface)] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0F172A] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#10B981] text-slate-950 flex items-center justify-center font-black">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#10B981] font-bold">
                  {property.sku}
                </span>
                <span className="text-[10px] bg-[var(--color-surface)]/10 px-2 py-0.5 rounded text-slate-200">
                  {property.subtype}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate max-w-xl">
                {property.title}
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

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-slate-800">
          
          {/* Top Section: Photo Gallery & Key High-Conversion Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Gallery Column */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-md">
                <img
                  src={images[activeImageIndex]?.url}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                {/* Left/Right Carousel Controls */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-950 transition-colors shadow-lg"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-950 transition-colors shadow-lg"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Tag & Counter */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-[#10B981] text-slate-950 px-2.5 py-1 rounded-md shadow-xs">
                    {images[activeImageIndex]?.categoryTag || 'Exterior'}
                  </span>
                  <span className="text-[10px] font-semibold bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                    {activeImageIndex + 1} / {images.length}
                  </span>
                </div>
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx ? 'border-[#10B981] scale-105 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={`${property.title} — ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Pricing & Commercial Dossier Column */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px]">
                    Pricing & Commercials
                  </span>
                  {property.legal.isReraRegistered && (
                    <span className="text-[#065F46] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>RERA Registered</span>
                    </span>
                  )}
                </div>

                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                  {property.priceDisplay || property.monthlyRentDisplay}
                </div>
                {property.pricePerSqFt && (
                  <span className="text-xs text-slate-500 font-semibold">
                    ₹{property.pricePerSqFt.toLocaleString('en-IN')} per sq ft
                  </span>
                )}
              </div>

              {/* Metric Highlights Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-[var(--color-surface)] border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold block">Super Built-up Area:</span>
                  <span className="text-sm font-extrabold text-slate-900">{property.superBuiltupAreaSqFt} sq ft</span>
                </div>

                {property.rentalYieldPct && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs">
                    <span className="text-[10px] text-[#065F46] font-bold block">Net Rental Yield:</span>
                    <span className="text-sm font-black text-emerald-800">{property.rentalYieldPct}% p.a.</span>
                  </div>
                )}

                <div className="p-3 rounded-2xl bg-[var(--color-surface)] border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold block">Furnishing Status:</span>
                  <span className="text-xs font-bold text-slate-900">{property.furnishing.replace('_', ' ')}</span>
                </div>

                <div className="p-3 rounded-2xl bg-[var(--color-surface)] border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold block">Possession / Available:</span>
                  <span className="text-xs font-bold text-[#065F46]">{property.availableFrom}</span>
                </div>
              </div>

              {/* Location Badge */}
              <div className="p-3 rounded-2xl bg-[var(--color-surface)] border border-slate-200 flex items-center gap-2 text-xs">
                <MapPin className="w-4 h-4 text-[#10B981] shrink-0" />
                <span className="font-bold text-slate-800 truncate">
                  {property.location.locality}, {property.location.city}
                </span>
              </div>

              {/* Direct Quick WhatsApp Action */}
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/919415088990?text=${encodeURIComponent(`Hi BuildEcoGroup, I am interested in inspecting ${property.title} (${property.sku}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366] text-slate-950 font-extrabold text-xs hover:bg-[#20bd5a] transition-colors shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Inquiry</span>
                </a>
              </div>
            </div>

          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
            {[
              { id: 'SPECS', label: 'Dossier & Specifications' },
              { id: 'AMENITIES', label: 'Amenities & Energy' },
              { id: 'LOCATION', label: 'Location & GIS Map' },
              { id: 'LEGAL', label: 'Legal & RERA' },
              { id: 'CALCULATOR', label: 'Yield & EMI Calculator' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'border-[#10B981] text-[#065F46]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Container */}
          <div className="space-y-4">
            
            {/* TAB 1: SPECIFICATIONS */}
            {activeTab === 'SPECS' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                    Property Narrative
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {property.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Bedrooms:</span>
                    <strong className="text-slate-900">{property.bedrooms ? `${property.bedrooms} BHK` : 'N/A'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Bathrooms:</span>
                    <strong className="text-slate-900">{property.bathrooms || 'N/A'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Balconies:</span>
                    <strong className="text-slate-900">{property.balconies || 'N/A'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Floor Position:</span>
                    <strong className="text-slate-900">{property.floorNumber !== undefined ? `${property.floorNumber} of ${property.totalFloors}` : 'Ground'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Facing:</span>
                    <strong className="text-slate-900">{property.facing || 'East'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Carpet Area:</span>
                    <strong className="text-slate-900">{property.carpetAreaSqFt ? `${property.carpetAreaSqFt} sq ft` : 'N/A'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">PMS Managed:</span>
                    <strong className="text-[#065F46]">{property.isPmsManaged ? 'Yes (Full PMS)' : 'Standard'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Owner Status:</span>
                    <strong className="text-slate-900">{property.isNriRemoteOwner ? 'NRI / Remote Owner' : 'Resident Owner'}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AMENITIES & SUSTAINABILITY */}
            {activeTab === 'AMENITIES' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {Object.entries(property.amenities).map(([key, val]) => (
                    <div
                      key={key}
                      className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                        val ? 'bg-[#F0FDF4] border-[#10B981]/40 text-[#065F46]' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      {val ? (
                        <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="font-bold">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: LOCATION & MAP */}
            {activeTab === 'LOCATION' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="font-extrabold text-slate-900">
                    {property.location.houseOrPlotNo}, {property.location.street}
                  </div>
                  <div className="text-slate-600">
                    Landmark: {property.location.landmark}
                  </div>
                  <div className="text-slate-600">
                    {property.location.locality}, {property.location.city}, {property.location.state} - {property.location.pincode}
                  </div>
                </div>

                <div className="relative h-60 rounded-2xl bg-slate-900 overflow-hidden border border-slate-300 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1200&q=80"
                    alt="Map"
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-[#10B981] text-slate-950 px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-xl flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{property.location.locality}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-3 right-3 text-[10px] text-white/80 font-mono flex justify-between">
                    <span>GPS: {property.location.lat}° N, {property.location.lng}° E</span>
                    <span>Micro-Market Geocoded</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: LEGAL & RERA */}
            {activeTab === 'LEGAL' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-slate-400 font-bold uppercase text-[10px]">RERA Regulatory Registration</div>
                    <div className="text-sm font-extrabold text-slate-900">
                      {property.legal.isReraRegistered ? property.legal.reraNumber || 'Registered & Verified' : 'Clear Title Non-RERA/Direct Freehold'}
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Compliant with statutory real estate authority transparency protocols.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-slate-400 font-bold uppercase text-[10px]">Title & Encumbrance Status</div>
                    <div className="text-sm font-extrabold text-[#065F46] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      <span>100% Freehold & Encumbrance-Free</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Title chain vetted for bank mortgage pre-approvals and clear ownership handover.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: FINANCIAL YIELD & EMI CALCULATOR */}
            {activeTab === 'CALCULATOR' && (
              <div className="space-y-4 animate-fadeIn p-4 rounded-3xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase">
                  <Calculator className="w-4 h-4 text-[#10B981]" />
                  <span>Interactive Home Loan / Commercial EMI Estimator</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Down Payment ({downpaymentPct}%): ₹{((propertyPrice * downpaymentPct) / 100).toLocaleString('en-IN')}
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={50}
                      step={5}
                      value={downpaymentPct}
                      onChange={(e) => setDownpaymentPct(Number(e.target.value))}
                      className="w-full accent-[#10B981] cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Interest Rate: {interestRatePct}%
                    </label>
                    <input
                      type="range"
                      min={7.0}
                      max={12.0}
                      step={0.25}
                      value={interestRatePct}
                      onChange={(e) => setInterestRatePct(Number(e.target.value))}
                      className="w-full accent-[#10B981] cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Loan Tenure: {loanTenureYears} Years
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={30}
                      step={1}
                      value={loanTenureYears}
                      onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                      className="w-full accent-[#10B981] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-500 font-bold block">Estimated Monthly EMI:</span>
                    <span className="text-2xl font-black text-slate-900">₹{calculatedEmi.toLocaleString('en-IN')} / mo</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Principal Loan Amount: <strong>₹{loanAmount.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* =========================================================================
              LEAD INTAKE & SITE VISIT SCHEDULER FORM
             ========================================================================= */}
          <div className="p-6 rounded-3xl bg-[#0F172A] text-white space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#10B981] font-bold">
                Direct Contact & Site Inspection
              </span>
              <h3 className="text-base font-extrabold text-white">
                Book a Verified Site Visit or Inquire with Owner
              </h3>
            </div>

            {isSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-950 border border-[#10B981] text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-white text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                  <span>Inquiry Transmitted Successfully!</span>
                </div>
                <p className="text-xs">
                  Your inquiry has been logged in the owner's dashboard. A property coordinator will contact you via WhatsApp to coordinate entry gate access.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="e.g. Vikramaditya Rao"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-[#10B981] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Mobile / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="e.g. +91 98200 12345"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-[#10B981] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Preferred Site Visit Date & Time
                    </label>
                    <input
                      type="text"
                      value={requestedDate}
                      onChange={(e) => setRequestedDate(e.target.value)}
                      placeholder="e.g. Tomorrow at 11:00 AM"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-[#10B981] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Message / Special Requirements
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-[#10B981] focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="bg-[#10B981] hover:bg-[#0EA5E9] text-slate-950 font-black text-xs shadow-lg"
                    rightIcon={<Calendar className="w-4 h-4" />}
                  >
                    Confirm & Dispatch Inquiry
                  </Button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-200 shrink-0 text-xs">
          <span className="text-slate-500">
            Managed & Certified by <strong>BuildEcoGroup PropTech Platform</strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-bold"
          >
            Close Dossier
          </Button>
        </div>

      </div>
    </div>
  );
};
