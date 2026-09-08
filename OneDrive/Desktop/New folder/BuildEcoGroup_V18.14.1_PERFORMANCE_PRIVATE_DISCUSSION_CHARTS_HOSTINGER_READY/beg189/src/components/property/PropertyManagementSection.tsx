import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Key, 
  DollarSign, 
  Wrench, 
  Camera, 
  FileCheck, 
  CheckCircle2, 
  ArrowRight, 
  Globe, 
  Sparkles, 
  Phone, 
  MessageSquare,
  Lock,
  Clock
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface PropertyManagementSectionProps {
  onOpenPublishWizard: () => void;
  className?: string;
}

export const PropertyManagementSection: React.FC<PropertyManagementSectionProps> = ({
  onOpenPublishWizard,
  className = ''
}) => {
  const [showPmsIntake, setShowPmsIntake] = useState<boolean>(false);
  const [ownerLocation, setOwnerLocation] = useState<string>('Dubai, UAE');
  const [propertyCity, setPropertyCity] = useState<string>('Lucknow');
  const [propertySubtype, setPropertySubtype] = useState<string>('3BHK High-Rise Apartment');
  const [expectedRent, setExpectedRent] = useState<number>(45000);
  const [intakeSuccess, setIntakeSuccess] = useState<boolean>(false);

  const handleSubmitPms = (e: React.FormEvent) => {
    e.preventDefault();
    setIntakeSuccess(true);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      
      {/* Hero Showcase */}
      <div className="relative rounded-3xl bg-[#0F172A] text-white p-6 sm:p-10 overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] text-xs font-mono font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>Full-Stack NRI & Remote Property Management</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            100% Hands-Off Rental Yields for Remote Landlords
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Living abroad or in another city? BuildEcoGroup PMS handles tenant acquisition, background verification, keyless access, 24/7 maintenance, and guarantees your rent hits your bank account by the 5th of every month.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowPmsIntake(true)}
              className="bg-[#10B981] hover:bg-[#0EA5E9] text-slate-950 font-black text-xs shadow-lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Enroll Property Under PMS Care
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={onOpenPublishWizard}
              className="border-slate-600 text-white hover:bg-[var(--color-surface)]/10 text-xs font-bold"
            >
              List Managed Rental Unit
            </Button>
          </div>
        </div>

        {/* Ambient background watermark */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
          <Building2 className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* 5 Pillars of PMS Protection */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#10B981] font-bold">
            End-To-End Asset Governance
          </span>
          <h3 className="text-xl font-extrabold text-slate-900">
            Everything Your Property Needs While You're Away
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'CIBIL & Police Verified Tenants',
              desc: 'Rigorous 3-step screening including credit score vetting, corporate employer confirmation, and police background clearance.',
              icon: ShieldCheck
            },
            {
              title: 'Smart Keyless Access & Lockboxes',
              desc: 'Biometric smart locks installed for secure self-guided buyer/tenant tours and authorized maintenance worker entry logs.',
              icon: Key
            },
            {
              title: '5th-of-the-Month Escrow Rent Disbursal',
              desc: 'Automated rent collection backed by escrow with instant credit to your domestic NRE/NRO or resident savings bank account.',
              icon: DollarSign
            },
            {
              title: '24/7 Digital Maintenance Ticket Desk',
              desc: 'Tenants log plumbing, HVAC, or electrical issues in real time. We dispatch vetted technicians and video-verify completed repairs.',
              icon: Wrench
            },
            {
              title: 'Quarterly Video & Drone Audits',
              desc: 'Receive comprehensive high-resolution 360° photographic condition reports and structural dampness checks right to your email.',
              icon: Camera
            },
            {
              title: 'Digital Legal & Tax Documentation',
              desc: 'E-stamped 11-month lease agreements, monthly GST compliant rent invoices, and TDS certificates generated automatically.',
              icon: FileCheck
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="p-5 rounded-3xl border border-slate-200 bg-[var(--color-surface)] space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center font-black">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Transparent Service Packages */}
      <div className="space-y-4 pt-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#10B981] font-bold">
            Transparent Pricing
          </span>
          <h3 className="text-xl font-extrabold text-slate-900">
            Choose Your Asset Management Plan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Plan 1 */}
          <Card className="p-6 rounded-3xl border border-slate-200 bg-[var(--color-surface)] space-y-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Tier 01</span>
                <h4 className="text-lg font-black text-slate-900">Tenant Placement Only</h4>
                <div className="text-2xl font-black text-slate-900 mt-2">1 Month Rent</div>
                <span className="text-[11px] text-slate-500">One-time fee upon lease execution</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>360° HDR Photography & Video Shoot</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>CIBIL & Corporate Background Check</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>E-Stamped Registered Agreement</span>
                </li>
              </ul>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => setShowPmsIntake(true)}
              className="w-full text-xs font-bold border-slate-300"
            >
              Select Placement Only
            </Button>
          </Card>

          {/* Plan 2: Featured NRI Asset Care */}
          <Card className="p-6 rounded-3xl border-2 border-[#10B981] bg-[#F0FDF4]/40 space-y-5 shadow-xl flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#10B981] text-slate-950 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs">
              ★ Most Popular for NRIs
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <span className="text-xs font-bold text-[#065F46] uppercase">Tier 02</span>
                <h4 className="text-lg font-black text-slate-900">Full-Stack NRI Asset Care</h4>
                <div className="text-2xl font-black text-slate-900 mt-2">8% <span className="text-xs font-normal text-slate-500">/ month</span></div>
                <span className="text-[11px] text-slate-500">Deducted directly from collected rent</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>All Tenant Placement Features Included</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Guaranteed Rent Collection by 5th</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>24/7 Tenant Repair & MEP Desk</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Quarterly Video & Structural Audit</span>
                </li>
              </ul>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setShowPmsIntake(true)}
              className="w-full bg-[#10B981] hover:bg-[#0EA5E9] text-slate-950 font-black text-xs shadow-md"
            >
              Get Full-Stack NRI Care
            </Button>
          </Card>

          {/* Plan 3 */}
          <Card className="p-6 rounded-3xl border border-slate-200 bg-[var(--color-surface)] space-y-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Tier 03</span>
                <h4 className="text-lg font-black text-slate-900">Commercial Facility Desk</h4>
                <div className="text-2xl font-black text-slate-900 mt-2">6% <span className="text-xs font-normal text-slate-500">/ month</span></div>
                <span className="text-[11px] text-slate-500">For retail shops & corporate office floors</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>HVAC & UPS Lifecycle Maintenance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Common Area Maintenance (CAM) Audit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Corporate GST & TDS Invoicing</span>
                </li>
              </ul>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => setShowPmsIntake(true)}
              className="w-full text-xs font-bold border-slate-300"
            >
              Select Commercial Plan
            </Button>
          </Card>

        </div>
      </div>

      {/* PMS Onboarding Modal */}
      {showPmsIntake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[var(--color-surface)] rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#10B981] font-bold uppercase">Remote Landlord Intake</span>
                <h3 className="text-base font-extrabold text-slate-900">Enroll Your Property for PMS Care</h3>
              </div>
              <button onClick={() => { setShowPmsIntake(false); setIntakeSuccess(false); }} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            {intakeSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-xs">
                <div className="font-extrabold flex items-center gap-1.5 text-sm text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Property Registered for PMS Inspection!</span>
                </div>
                <p>
                  Our dedicated Asset Manager assigned to {propertyCity} will reach out to you via WhatsApp to coordinate biometric key handover and schedule the 360° HDR photography shoot.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitPms} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Current Location (Country/City) *</label>
                  <input
                    type="text"
                    required
                    value={ownerLocation}
                    onChange={(e) => setOwnerLocation(e.target.value)}
                    placeholder="e.g. Dubai, London, San Francisco, Mumbai"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Property City *</label>
                    <input
                      type="text"
                      required
                      value={propertyCity}
                      onChange={(e) => setPropertyCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Expected Rent (₹/mo) *</label>
                    <input
                      type="number"
                      required
                      value={expectedRent}
                      onChange={(e) => setExpectedRent(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Property Type & Configuration</label>
                  <input
                    type="text"
                    value={propertySubtype}
                    onChange={(e) => setPropertySubtype(e.target.value)}
                    placeholder="e.g. 3BHK Apartment in Gomti Nagar Extension"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-[var(--color-surface)] focus:border-[#10B981] focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setShowPmsIntake(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" className="bg-[#10B981] text-slate-950 font-extrabold">
                    Initiate PMS Onboarding
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
