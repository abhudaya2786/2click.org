import React, { useState } from 'react';
import { 
  Handshake, 
  ShieldCheck, 
  MapPin, 
  TrendingUp, 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  Building2, 
  Layers, 
  Compass, 
  DollarSign, 
  Lock, 
  Sparkles,
  Phone,
  MessageSquare
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { PropertyListing } from '../../types/property';

interface LandownerJVSectionProps {
  jvListings: PropertyListing[];
  onSelectProperty: (property: PropertyListing) => void;
  onOpenPublishWizard: () => void;
  className?: string;
}

export const LandownerJVSection: React.FC<LandownerJVSectionProps> = ({
  jvListings,
  onSelectProperty,
  onOpenPublishWizard,
  className = ''
}) => {
  const [showJvIntakeModal, setShowJvIntakeModal] = useState<boolean>(false);
  const [landCity, setLandCity] = useState<string>('Lucknow');
  const [landArea, setLandArea] = useState<string>('2.5 Acres');
  const [landRoadWidth, setLandRoadWidth] = useState<string>('60 Feet (Four-Lane)');
  const [landContactName, setLandContactName] = useState<string>('');
  const [landContactPhone, setLandContactPhone] = useState<string>('');
  const [intakeSuccess, setIntakeSuccess] = useState<boolean>(false);

  const handleSubmitJvIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!landContactName || !landContactPhone) return;
    setIntakeSuccess(true);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      
      {/* Hero Showcase */}
      <div className="relative rounded-3xl bg-[#0F172A] text-white p-6 sm:p-10 overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Handshake className="w-3.5 h-3.5" />
            <span>Landowner Joint Venture (JV) Program</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Monetize Vacant Land Without Selling Ownership
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Partner with BuildEcoGroup and certified institutional operators. We co-invest 100% of the fit-out and construction capital expenditures under legally registered revenue-sharing agreements, unlocking steady monthly yields while you retain full freehold title.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowJvIntakeModal(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Submit Land for Free Feasibility Audit
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={onOpenPublishWizard}
              className="border-slate-600 text-white hover:bg-[var(--color-surface)]/10 text-xs font-bold"
            >
              List Land Parcel in JV Directory
            </Button>
          </div>
        </div>

        {/* Ambient background watermark */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <Compass className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* The 4-Step Monetization Pipeline */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#10B981] font-bold">
            Standardized Operational Protocol
          </span>
          <h3 className="text-xl font-extrabold text-slate-900">
            How The Landowner Joint Venture Model Operates
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'GIS Spatial & FAR Audit',
              desc: 'Our engineering team verifies road width, Section 143 conversion status, FSI permissible, and micro-market commercial footfall.',
              icon: Compass
            },
            {
              step: '02',
              title: 'Registered Escrow Agreement',
              desc: 'Structured Revenue-Sharing Joint Venture Contract executed without transferring land title. Zero ownership encumbrance risk.',
              icon: FileText
            },
            {
              step: '03',
              title: '100% Operator Capex Fit-Out',
              desc: 'Operator finances pre-engineered warehouses, commercial retail arcades, or solar power parks with zero capex burden on landowner.',
              icon: Building2
            },
            {
              step: '04',
              title: 'Monthly Escrow Revenue Split',
              desc: 'Automated 5th-of-the-month bank settlement with transparent digital ledger, occupancy dashboard, and GST/TDS reports.',
              icon: DollarSign
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.step} className="p-5 rounded-3xl border border-slate-200 bg-[var(--color-surface)] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center font-black text-sm">
                    <Icon className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400">
                    STEP {item.step}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Active JV Listings in Ecosystem */}
      {jvListings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Active Landowner JV Opportunities</h3>
              <p className="text-xs text-slate-500">Verified land parcels ready for developer partnership & fit-out deployment</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenPublishWizard}
              className="text-xs font-bold border-slate-300"
            >
              Post Your JV Parcel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jvListings.map((prop) => (
              <Card key={prop.id} className="rounded-3xl border border-slate-200 overflow-hidden bg-[var(--color-surface)] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="relative aspect-video bg-slate-900">
                    <img src={prop.images[0]?.url} alt={prop.title || 'JV property'} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded shadow-xs">
                      JV OPPORTUNITY
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>{prop.location.locality}, {prop.location.city}</span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">{prop.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{prop.tagline}</p>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between">
                      <span className="text-slate-500">Plot Area:</span>
                      <strong className="text-slate-900">{prop.plotAreaSqYards} Sq Yards</strong>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onSelectProperty(prop)}
                    className="w-full bg-[#0F172A] text-white text-xs font-bold"
                  >
                    View JV Dossier & GIS Data
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Land JV Intake Modal */}
      {showJvIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[var(--color-surface)] rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-600 font-bold uppercase">Confidential Intake</span>
                <h3 className="text-base font-extrabold text-slate-900">Submit Land Parcel for JV Feasibility</h3>
              </div>
              <button onClick={() => { setShowJvIntakeModal(false); setIntakeSuccess(false); }} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            {intakeSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-xs">
                <div className="font-extrabold flex items-center gap-1.5 text-sm text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Land Parcel Received for Evaluation!</span>
                </div>
                <p>
                  Our GIS spatial planning team has initiated the road width, zoning, and FAR feasibility audit for your parcel in {landCity}. A senior JV partner will contact you within 24 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitJvIntake} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">City / Region *</label>
                    <input
                      type="text"
                      required
                      value={landCity}
                      onChange={(e) => setLandCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Plot Area *</label>
                    <input
                      type="text"
                      required
                      value={landArea}
                      onChange={(e) => setLandArea(e.target.value)}
                      placeholder="e.g. 2.5 Acres or 15,000 sq ft"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Frontage Road Width *</label>
                  <input
                    type="text"
                    required
                    value={landRoadWidth}
                    onChange={(e) => setLandRoadWidth(e.target.value)}
                    placeholder="e.g. 60 Feet Four-Lane Highway"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={landContactName}
                      onChange={(e) => setLandContactName(e.target.value)}
                      placeholder="e.g. Shrinet Yadav"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={landContactPhone}
                      onChange={(e) => setLandContactPhone(e.target.value)}
                      placeholder="e.g. +91 94150 12345"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setShowJvIntakeModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black">
                    Submit for Feasibility
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
